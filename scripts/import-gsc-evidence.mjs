import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

// Read the supplied exports, not the package-building script or a browser session.
const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const option = (key, fallback) => {
  const index = args.indexOf(key);
  if (index < 0) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`Missing ${key} value.`);
  return args[index + 1];
};
const input = path.resolve(root, option("--input", "gsc-canevim-2026-10-26"));
const output = path.resolve(root, option("--output", ".audit/round2/gsc-evidence.json"));
const slash = (value) => value.replaceAll("\\", "/");
const inside = (folder, candidate) => candidate === folder || candidate.startsWith(folder + path.sep);
if (inside(input, output)) throw new Error("Output must be outside the read-only source package.");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sourcePath = (name) => {
  const result = path.resolve(input, name);
  if (!inside(input, result) || !inside(fs.realpathSync(input), fs.realpathSync(result))) throw new Error(`Source path escapes package: ${name}`);
  return result;
};
const bytes = (name) => fs.readFileSync(sourcePath(name));
const text = (name) => bytes(name).toString("utf8").replace(/^\uFEFF/, "");

function parseCsv(value, label) {
  const records = []; let record = [], field = "", quoted = false, closed = false;
  const fieldEnd = () => { record.push(field); field = ""; closed = false; };
  const recordEnd = () => { fieldEnd(); if (record.some((cell) => cell !== "")) records.push(record); record = []; };
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (quoted) {
      if (char === '"' && value[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else field += char;
    } else if (char === ",") fieldEnd();
    else if (char === "\r" || char === "\n") { if (char === "\r" && value[i + 1] === "\n") i++; recordEnd(); }
    else if (char === '"' && field === "" && !closed) quoted = true;
    else if (closed && /\s/.test(char)) continue;
    else if (closed || char === '"') throw new Error(`Malformed CSV quote in ${label}.`);
    else field += char;
  }
  if (quoted) throw new Error(`Unclosed CSV quote in ${label}.`);
  if (field !== "" || record.length || closed) recordEnd();
  if (!records.length) throw new Error(`Missing CSV header in ${label}.`);
  const headers = records.shift();
  if (headers.some((header) => !header) || new Set(headers).size !== headers.length) throw new Error(`Invalid CSV headers in ${label}.`);
  return { headers, rows: records.map((cells, index) => {
    if (cells.length !== headers.length) throw new Error(`CSV field count differs in ${label}, record ${index + 2}.`);
    return Object.fromEntries(headers.map((header, column) => [header, cells[column]]));
  }) };
}
const csvCache = new Map();
const csv = (name) => {
  if (!csvCache.has(name)) csvCache.set(name, parseCsv(text(name), name));
  return csvCache.get(name);
};
const count = (value, label) => {
  if (!/^\d+$/.test(String(value))) throw new Error(`Missing or invalid count: ${label}.`);
  const result = Number(value); if (!Number.isSafeInteger(result)) throw new Error(`Count too large: ${label}.`);
  return result;
};
const decimal = (value, label) => {
  if (!/^\d+(?:\.\d+)?$/.test(String(value))) throw new Error(`Missing or invalid number: ${label}.`);
  return Number(value);
};
const ctr = (value, label) => {
  if (!String(value).endsWith("%")) throw new Error(`Missing CTR percentage: ${label}.`);
  return decimal(String(value).slice(0, -1), label) / 100;
};
const isoDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value + "T00:00:00Z").toISOString().slice(0, 10) !== value) throw new Error(`Invalid source date: ${value}`);
  return value;
};
const dayAfter = (value, days) => new Date(Date.parse(value + "T00:00:00Z") + days * 86400000).toISOString().slice(0, 10);
const aggregate = (rows) => {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0), impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions : null };
};
const metric = (row, file, rowNumber) => ({ clicks: count(row["Tıklamalar"], file), impressions: count(row["Gösterimler"], file), exportedCtr: ctr(row.TO, file), averagePosition: decimal(row["Pozisyon"], file), range: `${file}:A${rowNumber}:E${rowNumber}`, sourceFile: file, sourceRow: rowNumber });

const manifestBytes = bytes("manifest.json"), manifest = JSON.parse(manifestBytes.toString("utf8").replace(/^\uFEFF/, ""));
if (manifest.property !== "sc-domain:canevimsile.com" || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error("Expected a Can Evim manifest with source files.");
const listed = new Set(), fileChecks = [];
for (const entry of manifest.files) {
  if (listed.has(entry.file)) throw new Error(`Duplicate manifest path: ${entry.file}`);
  listed.add(entry.file);
  const source = bytes(entry.file), digest = sha(source);
  if (source.length !== entry.bytes || digest !== entry.sha256) throw new Error(`Source bytes/hash differ: ${entry.file}`);
  const rows = entry.file.endsWith(".csv") ? csv(entry.file).rows.length : null;
  if (entry.rows !== null && rows !== entry.rows) throw new Error(`Source CSV row count differs: ${entry.file}`);
  fileChecks.push({ file: entry.file, bytes: source.length, sha256: digest, rows });
}
const copies = [["performans-gunluk.csv", "Grafik.csv"], ["sorgular.csv", "Sorgular.csv"], ["sayfalar.csv", "Sayfa sayısı.csv"], ["cihazlar.csv", "Cihazlar.csv"], ["ulkeler.csv", "Ülkeler.csv"], ["arama-gorunumu.csv", "Arama görünümü.csv"]];
for (const [copy, original] of copies) if (!bytes(copy).equals(bytes("kaynak-16-ay/" + original))) throw new Error(`Performance copy differs from source: ${copy}`);
const filters = Object.fromEntries(csv("kaynak-16-ay/Filtreler.csv").rows.map((row) => [row["Filtre uygula"], row["Değer"]]));
const daily = csv("performans-gunluk.csv").rows.map((row, index) => ({ date: isoDate(row.Tarih), ...metric(row, "performans-gunluk.csv", index + 2) })).sort((a, b) => a.date.localeCompare(b.date));
if (!daily.length || new Set(daily.map((row) => row.date)).size !== daily.length) throw new Error("Daily dates must be nonempty and unique.");
const first = daily[0].date, last = daily.at(-1).date, observedDates = new Set(daily.map((row) => row.date)), missingDates = [];
for (let date = first; date <= last; date = dayAfter(date, 1)) if (!observedDates.has(date)) missingDates.push(date);
const whole = aggregate(daily);
const queryFile = "sorgular.csv", pageFile = "sayfalar.csv";
const queries = csv(queryFile).rows, pages = csv(pageFile).rows;
if (new Set(queries.map((row) => row["En çok yapılan sorgular"])).size !== queries.length) throw new Error("Duplicate query source key.");
if (new Set(pages.map((row) => row["En alakalı sayfalar"])).size !== pages.length) throw new Error("Duplicate page source key.");
const findMetric = (rows, key, value, file) => {
  const index = rows.findIndex((row) => row[key] === value);
  if (index < 0) throw new Error(`Required source row absent: ${value}`);
  return metric(rows[index], file, index + 2);
};
const devices = csv("cihazlar.csv").rows.map((row, index) => ({ device: row.Cihaz, ...metric(row, "cihazlar.csv", index + 2) }));
const mobile = devices.find((row) => row.device === "Mobil");
if (!mobile || aggregate(devices).clicks !== whole.clicks || aggregate(devices).impressions !== whole.impressions) throw new Error("Device totals do not reconcile with the daily property total.");

const comparisonFile = "kaynak-28gun-onceki/Sorgular.csv", comparison = csv(comparisonFile);
const clickColumns = comparison.headers.filter((header) => /\d{2}\.\d{2}\.\d{4} - \d{2}\.\d{2}\.\d{4} Tıklamalar$/.test(header));
if (clickColumns.length !== 2) throw new Error("Expected two dated click columns in comparison source.");
const parsePeriod = (column) => {
  const match = column.match(/^(\d{2})\.(\d{2})\.(\d{4}) - (\d{2})\.(\d{2})\.(\d{4}) Tıklamalar$/);
  const start = isoDate(`${match[3]}-${match[2]}-${match[1]}`), end = isoDate(`${match[6]}-${match[5]}-${match[4]}`);
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  if (days !== 28 || start < first || end > last) throw new Error("Comparison must cover 28 observed calendar days.");
  const selected = daily.filter((row) => row.date >= start && row.date <= end);
  if (selected.length !== days) throw new Error("Comparison daily rows are incomplete.");
  return { start, end, days, ...aggregate(selected), clickColumn: column, impressionColumn: column.replace(/Tıklamalar$/, "Gösterimler") };
};
const current = parsePeriod(clickColumns[0]), previous = parsePeriod(clickColumns[1]);
if (dayAfter(previous.end, 1) !== current.start) throw new Error("Comparison periods are not consecutive.");
const periodRows = (period) => comparison.rows.map((row) => ({ query: row[comparison.headers[0]], clicks: count(row[period.clickColumn], comparisonFile), impressions: count(row[period.impressionColumn], comparisonFile) }));
const branded = (query) => /(?:^|\s)(?:can\s*evim|canevim)(?:\s|$)/iu.test(query);
const splitPeriod = (period) => {
  const rows = periodRows(period), brand = aggregate(rows.filter((row) => branded(row.query))), nonbrand = aggregate(rows.filter((row) => !branded(row.query)));
  const visible = aggregate(rows), clicks = period.clicks - visible.clicks, impressions = period.impressions - visible.impressions;
  if (clicks < 0 || impressions < 0) throw new Error("Visible query rows exceed the matching property period.");
  return { brand, nonbrand, unrepresented: { clicks, impressions, ctr: impressions ? clicks / impressions : null } };
};
const currentSplit = splitPeriod(current), previousSplit = splitPeriod(previous);

const jointFile = "sorgu-sayfa.csv", joint = csv(jointFile).rows, sourceJoint = [], zeroResultFilters = [];
const folders = fs.readdirSync(sourcePath("kaynak-sorgu-sayfa"), { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort();
for (const folder of folders) {
  const prefix = `kaynak-sorgu-sayfa/${folder}/`, query = text(prefix + "sorgu.txt").trim();
  const ownFilters = Object.fromEntries(csv(prefix + "Filtreler.csv").rows.map((row) => [row["Filtre uygula"], row["Değer"]]));
  if (ownFilters.Sorgu !== query || ownFilters.Tarih !== filters.Tarih || ownFilters["Arama türü"] !== filters["Arama türü"]) throw new Error(`Query filter/source mismatch: ${folder}`);
  const rows = csv(prefix + "Sayfa sayısı.csv").rows;
  if (!rows.length) zeroResultFilters.push(query);
  rows.forEach((row, index) => sourceJoint.push({ query, page: row["En alakalı sayfalar"], ctr: ctr(row.TO, prefix), ...metric(row, prefix + "Sayfa sayısı.csv", index + 2) }));
}
const jointKey = (row) => row.query + "\n" + row.page;
const sourceMap = new Map(sourceJoint.map((row) => [jointKey(row), row]));
if (sourceMap.size !== sourceJoint.length || joint.length !== sourceJoint.length) throw new Error("Duplicate or incomplete source query/page pairs.");
const seenJoint = new Set();
for (const row of joint) {
  const key = row.sorgu + "\n" + row.url, source = sourceMap.get(key);
  if (seenJoint.has(key) || !source || count(row.tiklamalar, jointFile) !== source.clicks || count(row.gosterimler, jointFile) !== source.impressions || ctr(row.to, jointFile) !== source.exportedCtr || decimal(row.ortalama_konum, jointFile) !== source.averagePosition || row.donem !== `${first}/${last}`) throw new Error(`Query/page source metrics differ: ${key}`);
  seenJoint.add(key);
}
const inspection = csv("url-denetimi.csv").rows, canonicalRows = inspection.filter((row) => row.url_grubu === "canli_sitemap_17");
const duplicateFieldPairs = [];
for (let i = 0; i < inspection.length; i++) for (let j = i + 1; j < inspection.length; j++) {
  const left = inspection[i], right = inspection[j];
  if (left.son_tarama && left.kullanici_canonical && Object.keys(left).filter((key) => key !== "url").every((key) => left[key] === right[key]) && left.url !== right.url) duplicateFieldPairs.push({ urls: [left.url, right.url], sourceRows: [i + 2, j + 2], lastCrawlAsTranscribed: left.son_tarama, declaredCanonicalAsTranscribed: left.kullanici_canonical });
}
const queryTotals = aggregate(queries.map((row, index) => metric(row, queryFile, index + 2)));
const historyStart = new Date(last + "T00:00:00Z"); historyStart.setUTCMonth(historyStart.getUTCMonth() - 16);
const nominalSixteenMonthStart = dayAfter(historyStart.toISOString().slice(0, 10), 1);
const evidence = {
  analyzedAtUtc: new Date().toISOString(), timezoneForReport: "Europe/Istanbul", status: "user_provided_ui_export_reviewed", property: "canevimsile.com",
  sourceDataDirectory: slash(input),
  localSource: { path: slash(sourcePath("manifest.json")), sourceDataDirectory: slash(input), displayName: path.basename(input), bytes: manifestBytes.length, sha256: sha(manifestBytes), unchanged: true, analysis: ".audit/gsc-review-2026-10-26/GSC-INCELEME.md", sourceExportDate: manifest.created_at?.slice(0, 10) || null, sourceExportDateEvidence: "Package-declared date, not authenticated capture time.", firstAvailableDate: first, lastAvailableDate: last, dailyRows: daily.length, queryRows: queries.length, pageRows: pages.length, filterLabel: filters.Tarih, searchType: filters["Arama türü"], contains16Months: first <= nominalSixteenMonthStart && !missingDates.length, sixteenMonthFilterSelected: /16\s*ay/iu.test(filters.Tarih), containsJoinedQueryPageRows: sourceJoint.length > 0, joinedQueryPageRows: sourceJoint.length, queryFilterCount: folders.length, queryFilterOperatorVerified: false, containsDateQueryPageRows: false },
  sourceVerifiedMetrics: { verificationScope: "Derived and reconciled against the supplied CSV files; not authenticated against live GSC.", propertyClicks: whole.clicks, propertyImpressions: whole.impressions, propertyCalculatedCtr: whole.ctr, mobileClicks: mobile.clicks, mobileClickShare: whole.clicks ? mobile.clicks / whole.clicks : null, home: findMetric(pages, "En alakalı sayfalar", "https://www.canevimsile.com/", pageFile), menu: findMetric(pages, "En alakalı sayfalar", "https://www.canevimsile.com/menu", pageFile), httpHome: findMetric(pages, "En alakalı sayfalar", "http://www.canevimsile.com/", pageFile), sileKahvaltiQuery: findMetric(queries, "En çok yapılan sorgular", "şile kahvaltı", queryFile), serpmeQuery: findMetric(queries, "En çok yapılan sorgular", "şile serpme kahvaltı", queryFile), gozlemeQuery: findMetric(queries, "En çok yapılan sorgular", "şile gözleme", queryFile) },
  periods: { current, previous, change: { clicks: current.clicks - previous.clicks, clicksPercent: previous.clicks ? (current.clicks / previous.clicks - 1) * 100 : null, impressions: current.impressions - previous.impressions, impressionsPercent: previous.impressions ? (current.impressions / previous.impressions - 1) * 100 : null, ctrPercentagePoints: (current.ctr - previous.ctr) * 100 } },
  brandBreakdown: { classificationRule: "Contains the case-insensitive words can evim or canevim; local text rule, not a verified GSC brand classifier.", scope: "visible query rows only", sourceFile: comparisonFile, brand: { current: currentSplit.brand, previous: previousSplit.brand }, nonbrand: { current: currentSplit.nonbrand, previous: previousSplit.nonbrand }, unrepresented: { current: currentSplit.unrepresented, previous: previousSplit.unrepresented } },
  queryPage: { rows: sourceJoint, filterCount: folders.length, nonemptyFilterCount: folders.length - zeroResultFilters.length, zeroResultFilters, operatorVerified: false, hasDateDimension: false, reconciliation: "All exported pairs and four metrics match the corresponding query-filtered source page tables." },
  coverage: { observedRange: { first, last, days: daily.length, missingDates }, nominalSixteenMonthStart, latestObservedDatePreliminaryFlagAvailable: false, comparisonExcludesLatestObservedDate: current.end < last, queryTotals, unrepresentedQueryTotals: { clicks: whole.clicks - queryTotals.clicks, impressions: whole.impressions - queryTotals.impressions }, pageTotals: aggregate(pages.map((row, index) => metric(row, pageFile, index + 2))), propertyAndPageTotalsAreNotForcedToMatch: true },
  provenance: { mode: "user_provided_ui_export", independentlyAuthenticated: false, manifestEntries: fileChecks.length, allBytesAndHashesMatch: true, allCsvRowCountsMatch: true, performanceCopiesMatchRawSource: true, sourceUnchanged: true, manifestTimestampAsSupplied: manifest.created_at, manifestTimestampIsAuthenticatedCaptureTime: false, checks: fileChecks },
  manualInspectionUnverified: { independentlyVerified: false, source: "User transcription CSV; no individual URL Inspection screenshot/API response authenticated by this importer.", sourceFile: "url-denetimi.csv", reportedRows: inspection.length, reportedCounts: { canonicalRows: canonicalRows.length, indexed: canonicalRows.filter((row) => row.dizine_ekleme === "Sayfa dizine eklendi").length, unknown: canonicalRows.filter((row) => row.dizine_ekleme === "URL Google tarafından bilinmiyor").length }, duplicateFieldPairs, sitemapClaimIndependentlyVerified: false, limits: ["The three paired records share all fields other than URL; stale-panel/transcription ambiguity must be checked.", "The supplied sitemap screenshot does not show the reported discovered-URL count.", "Crawl timestamps have no timezone; date-only before-update labels do not prove that the final deployment was seen."] },
  liveApi: { callsMade: 0, reason: "This importer uses user-supplied files only and performs no GSC browser/API request.", browserCookiesOrProfilesRead: false },
  missingScope: manifest.missing_scope || [],
  limits: ["The supplied 16-month filter contains only the observed daily history, not 16 months of nonempty data.", "Separate property and page aggregation totals must not be forced to agree.", "Joined query/page rows cover selected filters and contain no date dimension; filter operators are not recorded.", "The source period ends before the 25 October deployment and cannot establish its effect.", "Manual index/canonical/sitemap observations remain unverified claims; package hash agreement is not GSC authentication."]
};
// Recheck every source after analysis, before writing any derived evidence.
for (const entry of fileChecks) if (sha(bytes(entry.file)) !== entry.sha256) throw new Error(`Source changed during import: ${entry.file}`);
if (!bytes("manifest.json").equals(manifestBytes)) throw new Error("Manifest changed during import.");
fs.mkdirSync(path.dirname(output), { recursive: true });
let preservedLegacyEvidence = null;
if (fs.existsSync(output)) {
  const old = JSON.parse(fs.readFileSync(output, "utf8").replace(/^\uFEFF/, ""));
  if (old.localSource?.dailyRows === 19 && old.localSource?.lastAvailableDate === "2026-08-19") {
    const backup = path.join(path.dirname(output), "gsc-evidence-2026-08-19.json");
    if (!fs.existsSync(backup)) fs.copyFileSync(output, backup);
    preservedLegacyEvidence = slash(backup);
  }
}
fs.writeFileSync(output, JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify({ output: slash(output), preservedLegacyEvidence, sourceFilesChecked: fileChecks.length, sourceUnchanged: true, observedStart: first, observedEnd: last, dailyRows: daily.length, clicks: whole.clicks, impressions: whole.impressions, queryPageRows: sourceJoint.length, filterCount: folders.length, duplicateInspectionPairs: duplicateFieldPairs.length, liveApiCalls: 0 }, null, 2));
