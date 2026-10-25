import assert from "node:assert/strict";
import nextConfig from "../next.config.mjs";
import { buildPageGraph, safeJsonLd, MENU_SECTIONS } from "../app/growth-schema.js";
import { experiences } from "../app/growth-content.js";
import { CONTENT_ROUTES, CANONICAL_ORIGIN } from "../app/seo-routes.mjs";
import { SEO_CONSOLIDATION_REDIRECTS, LEGACY_HTML_REDIRECTS } from "../app/seo-consolidation.mjs";
import { parseCsv, normalizeRows, auditRows, fetchDay, buildImportAudit } from "./gsc-audit.mjs";
import matcher from "next/dist/compiled/path-to-regexp/index.js";
import { contentBytes } from "./content-fingerprint.mjs";

assert.deepEqual(contentBytes("page.js", Buffer.from("a\r\nb\r\n")), contentBytes("page.js", Buffer.from("a\nb\n")), "Windows/Linux checkout line endings must not change lastmod fingerprints");
assert.deepEqual(contentBytes("menu.json", Buffer.from("\uFEFF{\r\n}")), Buffer.from("{\n}"));
const binaryExample = Buffer.from([0, 13, 10, 255]);
assert.equal(contentBytes("photo.webp", binaryExample), binaryExample, "Binary asset fingerprints preserve every byte");

function objects(value, result = []) {
  if (value && typeof value === "object") {
    if (!Array.isArray(value)) result.push(value);
    Object.values(value).forEach((child) => objects(child, result));
  }
  return result;
}

for (const { path } of CONTENT_ROUTES) {
  const graph = buildPageGraph({ path, title: "Can Evim Şile", description: "Menü ve adres", faqs: [{ question: "Neredeyiz?", answer: "Üvezli, Şile." }] });
  assert.ok(graph["@graph"].length >= 50);
  const definitions = objects(graph).filter((node) => node["@id"] && node["@type"]);
  const ids = new Set(definitions.map((node) => node["@id"]));
  assert.equal(ids.size, definitions.length, `Duplicate @id at ${path}`);
  for (const node of objects(graph).filter((entry) => entry["@id"] && !entry["@type"])) assert.ok(ids.has(node["@id"]), `Unresolved graph reference ${node["@id"]}`);
  assert.equal(definitions.filter((node) => [].concat(node["@type"]).includes("Restaurant")).length, 1);
  assert.ok(!objects(graph).some((node) => node.offers || node.aggregateRating || node.review || node.areaServed));
  assert.equal(graph["@graph"].find((node) => node["@type"] === "WebPage").url, `${CANONICAL_ORIGIN}${path}`);
}
assert.ok(safeJsonLd({ text: "</script>" }).includes("\\u003c/script>"));
assert.equal(MENU_SECTIONS.reduce((sum, section) => sum + section.items.length, 0), 54);
for (const experience of experiences) {
  const graph = buildPageGraph({ path: `/${experience.slug}`, title: experience.title, description: experience.description, faqs: experience.faqs });
  const faq = graph["@graph"].find((node) => node["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, experience.faqs.length);
  faq.mainEntity.forEach((question, index) => {
    assert.equal(question.name, experience.faqs[index][0]);
    assert.equal(question.acceptedAnswer.text, experience.faqs[index][1]);
  });
}

const redirects = await nextConfig.redirects();
const canonicalPaths = new Set(CONTENT_ROUTES.map(({ path }) => path));
assert.equal(canonicalPaths.size, CONTENT_ROUTES.length, "Canonical paths must be unique");
const experiencePaths = new Set(experiences.map(({ slug }) => `/${slug}`));
assert.equal(experiencePaths.size, experiences.length, "Experience slugs must be unique");
for (const { path, source } of CONTENT_ROUTES) {
  if (source === "app/[experience]/page.js") assert.ok(experiencePaths.has(path), `Canonical experience lacks content/static params: ${path}`);
}
for (const path of experiencePaths) assert.ok(canonicalPaths.has(path), `Experience missing from canonical sitemap list: ${path}`);
assert.equal(new Set(redirects.map((rule) => `${rule.source}:${JSON.stringify(rule.has || [])}`)).size, redirects.length, "Redirect rules must not duplicate a source/condition");
for (const path of canonicalPaths) {
  if (path === "/") continue;
  assert.ok(LEGACY_HTML_REDIRECTS.some((rule) => rule.source === `${path}.html` && rule.destination === path), `Missing direct canonical HTML alias: ${path}`);
}
assert.equal(nextConfig.trailingSlash, false);
assert.equal(nextConfig.skipTrailingSlashRedirect, true);
for (const rule of redirects) matcher.pathToRegexp(rule.source);
for (const rule of [...SEO_CONSOLIDATION_REDIRECTS, ...LEGACY_HTML_REDIRECTS]) {
  assert.ok(canonicalPaths.has(rule.destination), `Noncanonical target ${rule.destination}`);
  assert.notEqual(rule.source, rule.destination);
  assert.ok(!SEO_CONSOLIDATION_REDIRECTS.some(({ source }) => source === rule.destination));
  for (const path of [rule.source, `${rule.source}/`]) {
    const match = redirects.find((entry) => !entry.has && matcher.match(entry.source, { strict: true })(path));
    assert.ok(match, `Missing redirect ${path}`);
    assert.equal(match.permanent, true);
    assert.equal(match.destination, `${CANONICAL_ORIGIN}${rule.destination}`);
  }
}
for (const { path } of CONTENT_ROUTES) {
  assert.ok(!redirects.some((rule) => !rule.has && matcher.match(rule.source, { strict: true })(path)), `Canonical path redirects: ${path}`);
}
const hostRule = redirects.find((rule) => rule.has?.some((condition) => condition.type === "host"));
assert.ok(hostRule);
assert.ok(new RegExp(`^${hostRule.has[0].value}$`).test("canevimsile.com"));
assert.ok(!new RegExp(`^${hostRule.has[0].value}$`).test("www.canevimsile.com"));

// Synthetic values only exercise the importer; they are never written as metrics.
const csv = 'Query,Page,Clicks,Impressions,Position\r\n"şile, kahvaltı",https://www.canevimsile.com/,10,"1,000",2\r\n"şile, kahvaltı",https://www.canevimsile.com/menu,5,500,4\r\n';
const normalized = normalizeRows(parseCsv(csv));
assert.equal(normalized[0].query, "şile, kahvaltı");
assert.equal(normalized[0].impressions, 1000);
assert.equal(auditRows(normalized).overlappingQueries, 1);
const weighted = auditRows([...normalized, { ...normalized[0], clicks: 2, impressions: 500, position: 8 }]);
assert.equal(weighted.queryPages[0].pages.find(({ page }) => page.endsWith(".com/")).position, 4);
assert.throws(() => normalizeRows([{ Query: "şile kahvaltı", Clicks: 10, Impressions: 100, Position: 1 }]), /both query and absolute page/);
assert.throws(() => normalizeRows([{ query: "test", page: "https://www.canevimsile.com/", clicks: 2, impressions: 1, position: 1 }]), /more clicks/);
const offsets = [];
const paginated = await fetchDay({ day: "2026-10-01", site: `${CANONICAL_ORIGIN}/`, token: "synthetic-unit-test-token", fetchJson: async (_url, _token, body) => {
  offsets.push(body.startRow);
  return { rows: body.startRow === 0 ? [{ keys: ["test", `${CANONICAL_ORIGIN}/`], clicks: 1, impressions: 2, position: 1 }] : [] };
} });
assert.deepEqual(offsets, [0, 25000]);
assert.equal(paginated.rows.length, 1);
assert.equal(paginated.rows[0].date, "2026-10-01");
assert.equal(paginated.reachedDailyCap, false);
const turkish = normalizeRows(parseCsv('Sorgu;Sayfa;Tıklamalar;Gösterimler;Konum\nşile;https://www.canevimsile.com/;10;1.000;2,5\n'));
assert.equal(turkish[0].impressions, 1000);
assert.equal(turkish[0].position, 2.5);
const swapped = normalizeRows([{ keys: [`${CANONICAL_ORIGIN}/menu`, "test", "2026-10-01"], clicks: 1, impressions: 2, position: 3 }], ["page", "query", "date"]);
assert.equal(swapped[0].date, "2026-10-01");
const undated = buildImportAudit({ rows: normalized, start: "2026-10-01", end: "2026-10-21", sourceFile: "synthetic-tests-only" });
assert.equal(undated.exportRangeVerified, false);
assert.equal(undated.undatedRowsNotRangeFiltered, 2);
assert.equal(undated.completeDatasetGuaranteed, false);
const dated = buildImportAudit({ rows: [...swapped, { ...swapped[0], date: "2026-09-01" }], start: "2026-10-01", end: "2026-10-21", sourceFile: "synthetic-tests-only" });
assert.equal(dated.exportRangeVerified, true);
assert.equal(dated.rows, 1);
assert.throws(() => parseCsv('query,page\n"test,url'), /unclosed/);
assert.throws(() => normalizeRows([{ query: "test", page: `${CANONICAL_ORIGIN}/`, clicks: 0.5, impressions: 10, position: 1 }]), /integers/);
const capOffsets = [];
const cap = await fetchDay({ day: "2026-10-01", site: `${CANONICAL_ORIGIN}/`, token: "synthetic-unit-test-token", fetchJson: async (_url, _token, body) => {
  capOffsets.push(body.startRow);
  return { rows: Array.from({ length: 25000 }, () => ({ keys: ["test", `${CANONICAL_ORIGIN}/`], clicks: 0, impressions: 1, position: 1 })) };
} });
assert.deepEqual(capOffsets, [0, 25000]);
assert.equal(cap.rows.length, 50000);
assert.equal(cap.reachedDailyCap, true);
console.log(JSON.stringify({ passed: true, canonicalPages: CONTENT_ROUTES.length, graphNodesPerPage: buildPageGraph()["@graph"].length, menuItems: 54, redirectRules: redirects.length, checks: ["unique schema identities", "resolved graph references", "truthful menu graph", "canonical redirect targets", "no canonical redirect loops", "HTML and slash aliases", "host isolation", "CSV quoting", "Turkish CSV locale", "JSON dimension order", "query-page requirement", "weighted position", "API pagination", "API 50k cap flag", "dated export filtering", "undated range limitation"] }));
