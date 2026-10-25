import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
assert.equal(metrics.afterIndexablePages, CONTENT_ROUTES.length);
assert.equal(metrics.experienceArticles, CONTENT_ROUTES.filter(({ source }) => source === "app/[experience]/page.js").length);
assert.equal(metrics.beforeIndexablePages, 2);
assert.equal(metrics.round1IndexablePages, 7);
assert.ok(html.includes("2 → 7 → " + CONTENT_ROUTES.length));
assert.ok(html.includes(gsc.localSource.firstAvailableDate) && html.includes(gsc.localSource.lastAvailableDate));
assert.ok(html.includes("19 gün") && html.includes("16 aylık veri veya bugünkü trafik değildir"));
assert.ok(html.includes("2.423") && html.includes("%0,37") && html.includes("44/49"));
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

if (offline) {
  const result = { testedAt: new Date().toISOString(), status: "passed", mode: draft ? "draft" : "final", scope: "Content, GSC, card membership and manifest checks only; browser checks were not run.", canonicalCards: cardPaths.length, articleCount: metrics.experienceArticles, gscDays: metrics.gsc.days };
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
    await context.route("https://**/*", (route) => route.abort());
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
const report = { testedAt: new Date().toISOString(), mode: draft ? "draft" : "final", status: failures.length ? "failed" : "passed", canonicalCards: cardPaths.length, articleCount: metrics.experienceArticles, gscDays: metrics.gsc.days, evidenceRows: manifest.files.length, screens, failures };
await fs.writeFile(".audit/report-tests.json", `${JSON.stringify(report, null, 2)}\n`);
await fs.writeFile(".audit/round2/report-tests.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
if (failures.length) process.exitCode = 1;
