import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CONTENT_ROUTES } from "../app/seo-routes.mjs";

const root = path.resolve(import.meta.dirname, "..");
process.chdir(root);
const draft = process.argv.includes("--draft");
const offline = process.argv.includes("--offline");
const parse = async (file) => JSON.parse((await fs.readFile(file, "utf8")).replace(/^\uFEFF/, ""));
const metrics = await parse(".audit/round2/final-metrics.json");
const gsc = await parse(".audit/round2/gsc-evidence.json");
const html = await fs.readFile("CANEVIM-DEV-BUYUME-RAPORU.html", "utf8");
const markdown = await fs.readFile("TUM-OPERASYON-KANITLARI.md", "utf8");
const manifest = await parse(".audit/file-evidence.json");
const round2Manifest = await parse(".audit/round2/file-evidence.json");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const format = (value) => new Intl.NumberFormat("tr-TR").format(value);
const textOf = (value) => value.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " }[entity])).replace(/\s+/g, " ").trim();
// Read the supplied CSVs independently of the importer. Preserve quoted fields,
// BOMs and physical record references; never write or refresh source files.
async function csv(file) {
  const source = (await fs.readFile(file, "utf8")).replace(/^\uFEFF/, ""), records = [];
  let fields = [], field = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { fields.push(field); field = ""; }
    else if ((char === "\r" || char === "\n") && !quoted) {
      if (char === "\r" && source[i + 1] === "\n") i++;
      fields.push(field); if (fields.some(Boolean)) records.push(fields); fields = []; field = "";
    } else field += char;
  }
  assert.equal(quoted, false, `Unclosed quoted CSV field: ${file}`);
  if (field || fields.length) { fields.push(field); records.push(fields); }
  const [headers = [], ...rows] = records;
  return { headers, rows: rows.map((values, index) => { assert.equal(values.length, headers.length, `CSV width: ${file}:${index + 2}`); return { ...Object.fromEntries(headers.map((header, column) => [header, values[column]])), _row: index + 2 }; }) };
}
const packageRoot = path.resolve("gsc-canevim-2026-10-26");
const packageManifestPath = path.join(packageRoot, "manifest.json");
const packageBytes = await fs.readFile(packageManifestPath);
const packageManifest = JSON.parse(packageBytes.toString("utf8").replace(/^\uFEFF/, ""));
const raw = async (file) => csv(path.join(packageRoot, file));
const daily = (await raw("kaynak-16-ay/Grafik.csv")).rows;
const queries = (await raw("kaynak-16-ay/Sorgular.csv")).rows;
const pages = (await raw("kaynak-16-ay/Sayfa sayısı.csv")).rows;
const filters = (await raw("kaynak-16-ay/Filtreler.csv")).rows;
const number = (value) => { assert.notEqual(value, "", "Missing numeric source value"); assert.ok(Number.isFinite(Number(value)), `Invalid source number: ${value}`); return Number(value); };
const sum = (rows, key) => rows.reduce((total, row) => total + number(row[key]), 0);
const totals = (rows) => ({ clicks: sum(rows, "Tıklamalar"), impressions: sum(rows, "Gösterimler") });
const close = (actual, expected, label) => assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) < 1e-10, `${label}: ${actual} !== ${expected}`);
const actual = totals(daily), dates = daily.map((row) => row.Tarih).sort();
assert.equal(new Set(dates).size, dates.length, "Daily source has duplicate dates");
assert.equal((Date.parse(dates.at(-1)) - Date.parse(dates[0])) / 86400000 + 1, dates.length, "Daily source has a date gap");
const gs = gsc.localSource, gm = gsc.sourceVerifiedMetrics;
assert.equal(path.resolve(gs.path), packageManifestPath, "Normalized evidence must identify the supplied package manifest");
assert.equal(gs.bytes, packageBytes.length);
assert.equal(gs.sha256, sha256(packageBytes));
assert.equal(gs.firstAvailableDate, dates[0]);
assert.equal(gs.lastAvailableDate, dates.at(-1));
assert.equal(gs.dailyRows, daily.length);
assert.equal(gs.queryRows, queries.length);
assert.equal(gs.pageRows, pages.length);
assert.equal(gs.filterLabel, filters.find((row) => row["Filtre uygula"] === "Tarih")["Değer"]);
assert.equal(gs.contains16Months, false, "Filter selection must not be represented as sixteen months of observed daily data");
assert.equal(gm.propertyClicks, actual.clicks);
assert.equal(gm.propertyImpressions, actual.impressions);
close(gm.propertyCalculatedCtr, actual.clicks / actual.impressions, "Property CTR");
for (const [field, url] of [["home", "https://www.canevimsile.com/"], ["menu", "https://www.canevimsile.com/menu"], ["httpHome", "http://www.canevimsile.com/"]]) {
  const row = pages.find((entry) => entry["En alakalı sayfalar"] === url);
  assert.ok(row, `Raw page evidence: ${url}`);
  assert.equal(gm[field].clicks, number(row["Tıklamalar"]));
  assert.equal(gm[field].impressions, number(row["Gösterimler"]));
}
for (const [field, query] of [["sileKahvaltiQuery", "şile kahvaltı"], ["serpmeQuery", "şile serpme kahvaltı"], ["gozlemeQuery", "şile gözleme"]]) {
  const row = queries.find((entry) => entry["En çok yapılan sorgular"] === query);
  assert.ok(row, `Raw query evidence: ${query}`);
  assert.equal(gm[field].clicks, number(row["Tıklamalar"]));
  assert.equal(gm[field].impressions, number(row["Gösterimler"]));
}
assert.equal(gsc.provenance.mode, "user_provided_ui_export");
assert.equal(gsc.provenance.independentlyAuthenticated, false);
assert.equal(gsc.provenance.sourceUnchanged, true);
assert.equal(gsc.provenance.manifestEntries, packageManifest.files.length);
assert.equal(gsc.liveApi.callsMade, 0);
for (const entry of packageManifest.files) {
  const file = path.resolve(packageRoot, entry.file);
  assert.ok(file.startsWith(packageRoot + path.sep), `Package path escapes source directory: ${entry.file}`);
  const bytes = await fs.readFile(file);
  assert.equal(bytes.length, entry.bytes, `Package bytes: ${entry.file}`);
  assert.equal(sha256(bytes), entry.sha256, `Package hash: ${entry.file}`);
}
const rawQueryPages = [], filterFolders = (await fs.readdir(path.join(packageRoot, "kaynak-sorgu-sayfa"), { withFileTypes: true })).filter((entry) => entry.isDirectory());
for (const folder of filterFolders) {
  const directory = path.join("kaynak-sorgu-sayfa", folder.name), query = (await fs.readFile(path.join(packageRoot, directory, "sorgu.txt"), "utf8")).replace(/^\uFEFF/, "").trim();
  const queryFilter = (await raw(path.join(directory, "Filtreler.csv"))).rows;
  assert.equal(queryFilter.find((row) => row["Filtre uygula"] === "Sorgu")["Değer"], query);
  for (const row of (await raw(path.join(directory, "Sayfa sayısı.csv"))).rows) rawQueryPages.push({ query, page: row["En alakalı sayfalar"], clicks: number(row["Tıklamalar"]), impressions: number(row["Gösterimler"]), sourceFile: path.join(directory, "Sayfa sayısı.csv").replaceAll("\\", "/"), sourceRow: row._row });
}
assert.equal(gs.containsJoinedQueryPageRows, true);
assert.equal(gs.joinedQueryPageRows, rawQueryPages.length);
assert.equal(gs.containsDateQueryPageRows, false);
assert.equal(gs.queryFilterOperatorVerified, false);
assert.equal(gsc.queryPage.operatorVerified, false);
assert.equal(gsc.queryPage.filterCount, filterFolders.length);
assert.equal(gsc.queryPage.rows.length, rawQueryPages.length);
assert.equal(new Set(rawQueryPages.map((row) => JSON.stringify([row.query, row.page]))).size, rawQueryPages.length);
for (const expected of rawQueryPages) {
  const row = gsc.queryPage.rows.find((entry) => entry.query === expected.query && entry.page === expected.page);
  assert.ok(row, `Missing normalized joint row: ${expected.query} / ${expected.page}`);
  assert.equal(row.clicks, expected.clicks); assert.equal(row.impressions, expected.impressions);
  assert.equal(row.sourceRow, expected.sourceRow);
  assert.ok(row.sourceFile.replaceAll("\\", "/").endsWith(expected.sourceFile), "Joint row must preserve its actual filtered source");
}
const comparison = await raw("kaynak-28gun-onceki/Sorgular.csv");
const clickColumns = comparison.headers.filter((header) => header.endsWith(" Tıklamalar"));
const impressionColumns = comparison.headers.filter((header) => header.endsWith(" Gösterimler"));
const periods = [];
for (const [index, name] of ["current", "previous"].entries()) {
  const [, startDay, startMonth, startYear, endDay, endMonth, endYear] = clickColumns[index].match(/^(\d{2})\.(\d{2})\.(\d{4}) - (\d{2})\.(\d{2})\.(\d{4}) /);
  const start = `${startYear}-${startMonth}-${startDay}`, end = `${endYear}-${endMonth}-${endDay}`, rows = daily.filter((row) => row.Tarih >= start && row.Tarih <= end), stats = totals(rows);
  const expected = { ...stats, start, end, days: rows.length, ctr: stats.clicks / stats.impressions };
  for (const field of ["clicks", "impressions", "start", "end", "days"]) assert.equal(gsc.periods[name][field], expected[field], `Period ${name}: ${field}`);
  close(gsc.periods[name].ctr, expected.ctr, `Period ${name} CTR`);
  periods.push(expected);
}
const brand = { current: { clicks: 0, impressions: 0 }, previous: { clicks: 0, impressions: 0 } }, nonbrand = structuredClone(brand);
for (const row of comparison.rows) {
  const segment = /can evim|canevim/i.test(row[comparison.headers[0]]) ? brand : nonbrand;
  for (const [index, name] of ["current", "previous"].entries()) { segment[name].clicks += number(row[clickColumns[index]]); segment[name].impressions += number(row[impressionColumns[index]]); }
}
assert.match(gsc.brandBreakdown.scope, /visible/i);
for (const [segment, expected] of [["brand", brand], ["nonbrand", nonbrand]]) for (const name of ["current", "previous"]) for (const field of ["clicks", "impressions"]) assert.equal(gsc.brandBreakdown[segment][name][field], expected[name][field], `${segment} ${name} ${field}`);
for (const [index, name] of ["current", "previous"].entries()) for (const field of ["clicks", "impressions"]) assert.equal(gsc.brandBreakdown.unrepresented[name][field], periods[index][field] - brand[name][field] - nonbrand[name][field]);
assert.equal(gsc.manualInspectionUnverified.independentlyVerified, false);
const gscHtml = html.match(/<section\b[^>]*\bid="gsc-evidence"[^>]*>[\s\S]*?<\/section>/i)?.[0];
assert.ok(gscHtml, "Main report must contain a dedicated GSC evidence section");
const gscText = textOf(gscHtml), gscRows = [...gscHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => textOf(cell[1])));
assert.ok(gscHtml.includes('data-gsc-source="user-provided-export"'));
assert.ok(gscHtml.includes(`data-gsc-query-page-rows="${rawQueryPages.length}"`));
assert.ok(gscHtml.includes('data-gsc-inspection-status="unverified"'));
assert.match(gscText, /bağımsız doğrulanmadı/i);
assert.match(gscText, /kullanıcı(?:nın| tarafından|dan)?|kullanıcının sağladığı/i);
assert.ok(gscText.includes(gs.filterLabel) && gscText.includes(gs.firstAvailableDate) && gscText.includes(gs.lastAvailableDate) && gscText.includes(`${daily.length} gün`), "Report must distinguish filter label from observed daily coverage");
assert.match(gscText, /16 aylık.{0,35}(?:değil|yok)/i);
assert.match(gscText, /(?:tarih|gün).{0,30}sorgu.{0,30}sayfa.{0,100}(?:yok|üretilmedi|bulunmuyor|bulunmadı|sağlamıyor)/i);
assert.doesNotMatch(gscText, /Ayrı sorgu ve sayfa sekmeleri ortak sorgu.sayfa satırı sağlamaz|Belirli sorgunun tıklaması bir URL.ye atanmadı/i, "Current filtered joint data must not inherit the old separate-tabs-only limitation");
const oldAnalysis = await parse(".audit/round2/gsc-local-export-analysis.json");
const oldDays = oldAnalysis.sheets.find((sheet) => sheet.name === "Grafik").rowsIncludingHeader - 1;
if (oldDays !== daily.length) assert.doesNotMatch(gscText, new RegExp(`\\b${oldDays}\\s+gün(?:dür|lük|\\b)`, "i"), "Old workbook coverage must not appear as current package coverage");
const countCell = (cell, expected) => cell === String(expected) || cell === format(expected);
const hasMetricRow = (label, values) => gscRows.some((cells) => cells.some((cell) => label.test(cell)) && values.every((value) => cells.some((cell) => countCell(cell, value))));
assert.ok(hasMetricRow(/mülk toplamı/i, [actual.clicks, actual.impressions]), "Report property total must match raw daily CSV");
const periodTable = [...gscHtml.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map((match) => [...match[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) => [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => textOf(cell[1])))).find((table) => table[0]?.includes("Önceki tıklama") && table[0]?.includes("Son tıklama"));
assert.ok(periodTable, "Report must label the directions of the period comparison");
const checkPeriodRow = (label, prior, current) => {
  const cells = periodTable.find((row) => label.test(row[0]));
  assert.ok(cells, `Missing comparison row: ${label}`);
  for (const [header, expected] of [["Önceki tıklama", prior.clicks], ["Son tıklama", current.clicks], ["Önceki gösterim", prior.impressions], ["Son gösterim", current.impressions]]) assert.ok(countCell(cells[periodTable[0].indexOf(header)], expected), `Report comparison ${label}: ${header}`);
};
checkPeriodRow(/mülk toplamı/i, periods[1], periods[0]);
assert.match(gscText, /görün(?:en|ür)/i);
checkPeriodRow(/markalı/i, brand.previous, brand.current);
checkPeriodRow(/markasız/i, nonbrand.previous, nonbrand.current);
checkPeriodRow(/temsil edilmeyen/i, gsc.brandBreakdown.unrepresented.previous, gsc.brandBreakdown.unrepresented.current);
for (const query of ["şile kahvaltı", "şile kahvaltı mekanları"]) for (const url of ["https://www.canevimsile.com/", "https://www.canevimsile.com/menu", "https://www.canevimsile.com/sile/sile-kahvalti-mekanlari"]) {
  const expected = rawQueryPages.find((row) => row.query === query && row.page === url), pathname = new URL(url).pathname;
  assert.ok(expected, `Raw proof pair: ${query} ${url}`);
  assert.ok(gscRows.some((cells) => cells.includes(query) && cells.some((cell) => cell === url || cell === pathname) && cells.some((cell) => countCell(cell, expected.clicks)) && cells.some((cell) => countCell(cell, expected.impressions))), `Report joint proof must preserve query and URL: ${query} ${pathname}`);
}
assert.match(gscText, /yamyamlık.{0,50}(?:kanıtlanmadı|kanıtlanmış değil|kanıtı değil)|zararlı.{0,30}(?:kanıtlanmadı|kanıtı değil)|eski rehberin ana sayfayı bastırdığı iddiası desteklenmiyor/i);
assert.equal(metrics.gsc.days, daily.length); assert.equal(metrics.gsc.clicks, actual.clicks); assert.equal(metrics.gsc.impressions, actual.impressions);
assert.equal(metrics.gsc.sha256, gs.sha256);
assert.equal(metrics.gsc.start, dates[0]); assert.equal(metrics.gsc.end, dates.at(-1));
assert.equal(metrics.gsc.source, "user_provided_export");
assert.equal(metrics.gsc.independentlyAuthenticated, false);
assert.equal(metrics.gsc.joinedQueryPageRowCount, rawQueryPages.length);
assert.equal(metrics.gsc.containsDateQueryPageRows, false);
assert.equal(metrics.afterIndexablePages, CONTENT_ROUTES.length);
assert.equal(metrics.experienceArticles, CONTENT_ROUTES.filter(({ source }) => source === "app/[experience]/page.js").length);
assert.equal(metrics.beforeIndexablePages, 2);
assert.equal(metrics.round1IndexablePages, 7);
assert.ok(html.includes("2 → 7 → " + CONTENT_ROUTES.length));
assert.ok(markdown.includes(gsc.localSource.sha256));
assert.ok(markdown.includes("İkinci tur başlangıcına göre farklar"));
assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
const cardPaths = [...html.matchAll(/data-canonical-path="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(cardPaths, CONTENT_ROUTES.map(({ path: route }) => route));
if (draft) {
  assert.equal(metrics.status, "draft_pending_final_evidence");
  assert.equal(metrics.lighthouseAfter, null);
  assert.ok(html.includes("Final Lighthouse ölçümü bekleniyor"));
} else {
  assert.equal(metrics.status, "final_local_qa_passed");
  assert.ok(Object.values(metrics.qa).every(Boolean));
  assert.equal(metrics.pages.length, CONTENT_ROUTES.length);
  for (const page of metrics.pages.filter(({ path: route }) => CONTENT_ROUTES.some((entry) => entry.path === route && entry.source === "app/[experience]/page.js"))) assert.ok(page.articleWords >= 800);
}
// Report self hashes live in an external manifest; final mode also verifies all
// recorded source files against their actual bytes after report generation.
for (const entry of manifest.files.filter(({ file }) => !draft || ["CANEVIM-DEV-BUYUME-RAPORU.html", "TUM-OPERASYON-KANITLARI.md"].includes(file))) {
  if (entry.change === "deleted") { await assert.rejects(fs.stat(entry.file)); continue; }
  const bytes = await fs.readFile(entry.file);
  assert.equal(bytes.length, entry.after_bytes, `Evidence bytes stale: ${entry.file}`);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.after_sha256, `Evidence hash stale: ${entry.file}`);
}
for (const file of ["scripts/generate-growth-report.mjs", "app/growth-content.js", "app/seo-consolidation.mjs"]) assert.ok(manifest.files.some((entry) => entry.file === file), `Missing baseline evidence ${file}`);
assert.ok(round2Manifest.baselineCapturedAt && round2Manifest.baselineCapturedAt !== manifest.baselineCapturedAt);
// Raw user exports and their reconstruction helper must never become published
// source evidence merely because they are present in the working directory.
const tracked = new Set(execFileSync("git", ["ls-files", "--cached", "-z"]).toString().split("\0").filter(Boolean));
const privateSource = (file) => /(?:^|\/)gsc-canevim-[^/]+(?:\/|\.zip$)/i.test(file.replaceAll("\\", "/")) || /(?:^|\/)build-gsc-package\.mjs$/i.test(file) || /(?:^|\/)\.audit\//i.test(file);
for (const evidence of [manifest, round2Manifest]) for (const entry of evidence.files) {
  assert.equal(privateSource(entry.file), false, `Private raw evidence included in publication manifest: ${entry.file}`);
  if (entry.change !== "deleted") assert.ok(tracked.has(entry.file), `Publication evidence must be tracked or staged: ${entry.file}`);
}
const proofHtml = [...html.matchAll(/<table\b[^>]*class="[^"]*\bproof\b[^"]*"[^>]*>[\s\S]*?<\/table>/gi)].map((match) => textOf(match[0])).join(" ");
assert.doesNotMatch(proofHtml, /gsc-canevim-\d|build-gsc-package\.mjs|\.zip\b/i);
assert.doesNotMatch(markdown, /^\|\s*(?:gsc-canevim-[^|]+|scripts\/build-gsc-package\.mjs|[^|]*\.zip)\s*\|/im);
assert.doesNotMatch(html, /href=["'][^"']*(?:gsc-canevim-\d|build-gsc-package\.mjs|\.zip(?:[?#"']))/i);
const gscChecks = { source: metrics.gsc.source, days: daily.length, clicks: actual.clicks, impressions: actual.impressions, joinedQueryPageRows: rawQueryPages.length, sourceManifestFiles: packageManifest.files.length, independentlyAuthenticated: false, dateQueryPageAvailable: false };

if (offline) {
  const result = { testedAt: new Date().toISOString(), status: "passed", mode: draft ? "draft" : "final", scope: "Content, independent raw/normalized GSC, card membership and publication manifest checks only; browser checks were not run.", canonicalCards: cardPaths.length, articleCount: metrics.experienceArticles, gscDays: metrics.gsc.days, gsc: gscChecks };
  await fs.writeFile(".audit/round2/report-content-tests.json", `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result));
  process.exit(0);
}

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:/Users/mert/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const failures = [], screens = [];
try {
  for (const width of [320, 375, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    await context.route(/^https?:\/\//, (route) => route.abort());
    await context.addInitScript(() => { window.open = () => null; });
    const page = await context.newPage(), errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve("CANEVIM-DEV-BUYUME-RAPORU.html")).href);
    await page.waitForFunction(() => window.CanEvimGrowth);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 1) failures.push({ width, overflow });
    await page.locator('input[name="party"][value="family"]').check();
    if (await page.locator('input[name="guests"]').inputValue() !== "4") failures.push({ width, planner: "Family selection did not update guest count." });
    await page.locator('input[name="budget"]').fill("500");
    if (!(await page.locator("[data-planner-budget]").innerText()).includes("2.000")) failures.push({ width, planner: "Budget multiplication did not reflect 4 × 500." });
    if (errors.length) failures.push({ width, errors });
    screens.push({ width, overflow, planner: "tested" });
    if (width === 1440) { await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: ".audit/report-preview.png", fullPage: false }); }
    await context.close();
  }
} finally { await browser.close(); }
const report = { testedAt: new Date().toISOString(), mode: draft ? "draft" : "final", status: failures.length ? "failed" : "passed", canonicalCards: cardPaths.length, articleCount: metrics.experienceArticles, gscDays: metrics.gsc.days, gsc: gscChecks, evidenceRows: manifest.files.length, screens, failures };
await fs.writeFile(".audit/report-tests.json", `${JSON.stringify(report, null, 2)}\n`);
await fs.writeFile(".audit/round2/report-tests.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
if (failures.length) process.exitCode = 1;
