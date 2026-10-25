/**
 * Read-only Search Console export / overlap audit. Never prints auth tokens.
 * API reference: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 * Limits: https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data
 *
 * node scripts/gsc-audit.mjs --check-access
 * GSC_ACCESS_TOKEN and GSC_SITE_URL => node scripts/gsc-audit.mjs --fetch
 * node scripts/gsc-audit.mjs --import query-page.csv --start 2025-06-25 --end 2026-10-21
 * Imports require QUERY AND PAGE on each row. Separate UI query/page tabs cannot
 * establish query-page overlap and are deliberately rejected.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { pathToFileURL } from "node:url";

const API_ROOT = "https://www.googleapis.com/webmasters/v3";
const LIMITATION = "Search Console supplies top rows, excludes anonymized queries and caps daily results at 50,000 rows per search type. A paginated export is not a guarantee of every query-page pair. Multiple pages for a query indicate overlap to review, not proof of harmful cannibalization.";
const DEFAULT_SITE = "https://www.canevimsile.com/";
const isoDate = (date) => date.toISOString().slice(0, 10);
const addDay = (day, amount) => isoDate(new Date(Date.parse(`${day}T00:00:00Z`) + amount * 86400000));

function validateDay(value, name) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || isoDate(new Date(`${value}T00:00:00Z`)) !== value) throw new Error(`Invalid ${name}; use YYYY-MM-DD.`);
  return value;
}

function shiftMonths(day, amount) {
  const date = new Date(`${day}T00:00:00Z`);
  const originalDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  date.setUTCDate(Math.min(originalDay, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()));
  return isoDate(date);
}

export function parseCsv(text) {
  const clean = text.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/)[0];
  const delimiters = [",", ";", "\t"];
  const delimiter = delimiters.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < clean.length; index++) {
    const char = clean[index];
    if (char === '"') {
      if (quoted && clean[index + 1] === '"') { field += '"'; index++; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && clean[index + 1] === "\n") index++;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = []; field = "";
    } else field += char;
  }
  if (quoted) throw new Error("CSV has an unclosed quoted field.");
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("CSV needs headers and at least one query-page row.");
  const headers = rows.shift();
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

const headerKey = (value) => value.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const aliases = {
  query: ["query", "queries", "topqueries", "sorgu", "sorgular", "enonsorgular"],
  page: ["page", "pages", "url", "landingpage", "sayfa", "sayfalar", "enonsayfalar"],
  date: ["date", "tarih"], clicks: ["clicks", "tiklamalar", "tiklama"], impressions: ["impressions", "gosterimler", "gosterim"], position: ["position", "averageposition", "konum", "ortalamakonum"],
};

function number(value, label) {
  if (value === "" || value == null) throw new Error(`Missing numeric ${label}.`);
  let candidate = String(value).trim().replace(/\s/g, "");
  if (["clicks", "impressions"].includes(label) && /^\d{1,3}([,.]\d{3})+$/.test(candidate)) candidate = candidate.replace(/[,.]/g, "");
  if (candidate.includes(",") && !candidate.includes(".")) candidate = candidate.replace(",", ".");
  const parsed = Number(candidate);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid numeric ${label}. Use ungrouped numbers.`);
  if (["clicks", "impressions"].includes(label) && !Number.isInteger(parsed)) throw new Error(`Invalid ${label}; click and impression counts must be integers.`);
  return parsed;
}

export function normalizeRows(input, dimensions = ["query", "page"]) {
  if (!Array.isArray(input)) throw new Error("Export must contain an array of rows.");
  return input.map((row, index) => {
    const values = Object.fromEntries(Object.entries(row).map(([key, value]) => [headerKey(key), value]));
    if (Array.isArray(row.keys)) dimensions.forEach((dimension, keyIndex) => { values[dimension] = row.keys[keyIndex]; });
    const field = (name) => aliases[name].map((alias) => values[alias]).find((value) => value !== undefined && value !== "");
    const query = String(field("query") || "").trim();
    const page = String(field("page") || "").trim();
    if (!query || !/^https?:\/\//i.test(page)) throw new Error(`Row ${index + 1} needs both query and absolute page URL. Separate Queries/Pages exports cannot identify cannibalization.`);
    const date = field("date");
    if (date) validateDay(date, `date in row ${index + 1}`);
    const clicks = number(field("clicks"), "clicks");
    const impressions = number(field("impressions"), "impressions");
    const position = number(field("position"), "position");
    if (clicks > impressions) throw new Error(`Row ${index + 1} has more clicks than impressions.`);
    return { ...(date ? { date } : {}), query, page: new URL(page).href, clicks, impressions, position };
  });
}

export function auditRows(rows) {
  const queries = new Map();
  for (const row of rows) {
    const query = row.query.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
    if (!queries.has(query)) queries.set(query, new Map());
    const pages = queries.get(query);
    const page = pages.get(row.page) || { page: row.page, clicks: 0, impressions: 0, positionNumerator: 0, datedRows: 0 };
    page.clicks += row.clicks;
    page.impressions += row.impressions;
    page.positionNumerator += row.position * row.impressions;
    page.datedRows += row.date ? 1 : 0;
    pages.set(row.page, page);
  }
  const queryPages = [...queries].map(([query, pages]) => ({ query, pages: [...pages.values()].map(({ positionNumerator, ...page }) => ({ ...page, ctr: page.impressions ? page.clicks / page.impressions : 0, position: page.impressions ? positionNumerator / page.impressions : null })).sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions) }));
  const overlaps = queryPages.filter(({ pages }) => pages.length > 1).map((entry) => ({ ...entry, totalImpressions: entry.pages.reduce((sum, page) => sum + page.impressions, 0), reviewStatus: "overlap_requires_intent_and_trend_review" })).sort((a, b) => b.totalImpressions - a.totalImpressions);
  return { rows: rows.length, queries: queries.size, distinctPages: new Set(rows.map(({ page }) => page)).size, overlappingQueries: overlaps.length, limitation: LIMITATION, overlaps, queryPages };
}

export function buildImportAudit({ rows, start, end, sourceFile }) {
  validateDay(start, "start");
  validateDay(end, "end");
  if (start > end) throw new Error("Start date must not be after end date.");
  const filtered = rows.filter((row) => !row.date || (row.date >= start && row.date <= end));
  return { source: "user_supplied_query_page_export", sourceFile, requestedRange: { start, end }, exportRangeVerified: filtered.length > 0 && filtered.every((row) => !!row.date), undatedRowsNotRangeFiltered: filtered.filter((row) => !row.date).length, completeDatasetGuaranteed: false, ...auditRows(filtered) };
}

async function requestJson(url, token, body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
    if (response.ok) return response.json();
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`Search Console request failed: HTTP ${response.status}. No live report claimed. Credentials and response bodies are never logged.`);
    await new Promise((done) => setTimeout(done, Math.min(1000 * 2 ** attempt, 8000)));
  }
}

export async function fetchDay({ day, site, token, fetchJson = requestJson }) {
  const rows = [];
  let requests = 0;
  for (let startRow = 0; startRow < 50000; startRow += 25000) {
    const result = await fetchJson(`${API_ROOT}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, token, { startDate: day, endDate: day, dimensions: ["query", "page"], type: "web", aggregationType: "auto", dataState: "final", rowLimit: 25000, startRow });
    requests++;
    const page = result.rows || [];
    if (!page.length) break;
    rows.push(...normalizeRows(page).map((row) => ({ ...row, date: day })));
  }
  return { day, site, searchType: "web", rows, requests, reachedDailyCap: rows.length >= 50000, limitation: LIMITATION };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Read-only Search Console query-page audit

Usage:
  node scripts/gsc-audit.mjs --check-access
  node scripts/gsc-audit.mjs --fetch [--start YYYY-MM-DD] [--end YYYY-MM-DD]
  node scripts/gsc-audit.mjs --import query-page.csv [--start YYYY-MM-DD] [--end YYYY-MM-DD]
  node scripts/gsc-audit.mjs --import query-page.json [--out .audit/gsc]

API environment:
  GSC_ACCESS_TOKEN  Authorized OAuth access token; never printed or stored.
  GSC_SITE_URL      Exact authorized URL-prefix or sc-domain property name.
                   Default: https://www.canevimsile.com/
  Required scope: https://www.googleapis.com/auth/webmasters.readonly

Dates default to a 16-calendar-month window ending three days ago.
Google Search Console dates use Pacific Time. Dates may be set explicitly.
API results use daily query+page slices, 25,000-row pagination and resumable cache.
CSV/JSON needs query, absolute page URL, clicks, impressions and position on each row.
Date is optional; undated imports cannot verify or filter the requested period.
Separate aggregate Queries and Pages tabs are insufficient and are rejected.
Output defaults to .audit/gsc; no public web directory is used.

${LIMITATION}`);
    return;
  }
  const option = (name, fallback) => { const index = args.indexOf(name); return index < 0 ? fallback : args[index + 1]; };
  const out = resolve(option("--out", ".audit/gsc"));
  await mkdir(out, { recursive: true });
  const site = process.env.GSC_SITE_URL || DEFAULT_SITE;
  const token = process.env.GSC_ACCESS_TOKEN;
  const end = validateDay(option("--end", addDay(isoDate(new Date()), -3)), "end");
  const start = validateDay(option("--start", addDay(shiftMonths(end, -16), 1)), "start");
  if (start > end) throw new Error("Start date must not be after end date.");
  const writeJson = (name, data) => writeFile(resolve(out, name), `${JSON.stringify(data, null, 2)}\n`);
  if (args.includes("--check-access") || args.includes("--fetch")) {
    if (!token) {
      await writeJson("access.json", { status: "unavailable", checkedAt: new Date().toISOString(), site, reason: "GSC_ACCESS_TOKEN is not available in this process. No live query-page dataset was retrieved.", requiredScope: "https://www.googleapis.com/auth/webmasters.readonly", requestedRange: { start, end }, limitation: LIMITATION });
      console.log("GSC access unavailable; evidence saved to access.json. No ranking or traffic numbers generated.");
      process.exitCode = 2;
      return;
    }
    const response = await requestJson(`${API_ROOT}/sites`, token);
    const permission = response.siteEntry?.find((entry) => entry.siteUrl === site);
    await writeJson("access.json", { status: permission ? "authorized" : "property_not_listed", checkedAt: new Date().toISOString(), site, permissionLevel: permission?.permissionLevel || null, requestedRange: { start, end } });
    if (!permission) throw new Error("Requested GSC_SITE_URL does not appear in the authorized properties. Use the exact URL-prefix or sc-domain property name.");
    if (!args.includes("--fetch")) { console.log("GSC property access verified; no performance data requested."); return; }
    const cache = resolve(out, "daily");
    await mkdir(cache, { recursive: true });
    const rows = [], dailyCaps = [];
    for (let day = start; day <= end; day = addDay(day, 1)) {
      const cacheFile = resolve(cache, `${day}.json`);
      let result = await readFile(cacheFile, "utf8").then(JSON.parse).catch(() => null);
      if (result?.site !== site || result?.searchType !== "web" || result?.day !== day) {
        result = await fetchDay({ day, site, token });
        await writeFile(cacheFile, `${JSON.stringify(result)}\n`);
      }
      rows.push(...result.rows);
      if (result.reachedDailyCap) dailyCaps.push(day);
      if (day.endsWith("-01") || day === start || day === end) console.log(`${day}: cached ${rows.length} query-page rows.`);
    }
    await writeJson("query-page.json", { source: "Search Console API", site, start, end, dimensions: ["query", "page"], rows });
    await writeJson("overlap-audit.json", { source: "Search Console API", site, start, end, dailyCaps, completeDatasetGuaranteed: false, ...auditRows(rows) });
    console.log(`GSC audit saved: ${rows.length} rows; ${dailyCaps.length} daily caps. ${LIMITATION}`);
    return;
  }
  const source = option("--import");
  if (!source) throw new Error("Use --check-access, --fetch or --import <query-page.csv|json>.");
  const text = await readFile(resolve(source), "utf8");
  const data = extname(source).toLowerCase() === ".json" ? JSON.parse(text) : parseCsv(text);
  const rows = normalizeRows(Array.isArray(data) ? data : data.rows, data.dimensions || ["query", "page"]);
  const report = buildImportAudit({ rows, start, end, sourceFile: resolve(source) });
  await writeJson("overlap-audit.json", report);
  console.log(`Imported ${report.rows} query-page rows. Audit saved; undated imports do not prove the requested date range.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
