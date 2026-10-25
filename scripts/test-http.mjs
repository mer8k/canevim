import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import nextConfig from "../next.config.mjs";
import { CANONICAL_ORIGIN, CONTENT_ROUTES } from "../app/seo-routes.mjs";
import matcher from "next/dist/compiled/path-to-regexp/index.js";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3100";
const output = resolve(process.env.HTTP_QA_OUTPUT || ".audit/http-tests.json");
const results = [];
const failed = [];
// Node's fetch may discard a supplied Host header. Use the native HTTP client so
// the host normalization assertion exercises the actual requested production host.
const get = (path, host) => new Promise((resolveRequest, reject) => {
  const url = new URL(path, base);
  const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, { headers: host ? { Host: host } : {} }, (response) => {
    const chunks = [];
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("error", reject);
    response.on("end", () => resolveRequest({ status: response.statusCode, headers: { get: (name) => response.headers[name.toLowerCase()] || null }, text: async () => Buffer.concat(chunks).toString("utf8") }));
  });
  request.setTimeout(30000, () => request.destroy(new Error("HTTP QA request timed out.")));
  request.on("error", reject);
  request.end();
});
async function check(name, run) {
  try { const details = await run(); results.push({ name, status: "passed", ...details }); }
  catch (error) { const result = { name, status: "failed", reason: error.message }; results.push(result); failed.push(result); }
}
const matchParams = (source, lang = "en") => Object.fromEntries(matcher.parse(source).filter((token) => typeof token !== "string").map((token) => [token.name, token.name === "lang" ? lang : token.name === "path" ? ["menu"] : "unlisted-legacy-http-qa"]));
const canonicalUrl = (destination, params) => {
  const url = new URL(destination);
  url.pathname = matcher.compile(url.pathname)(params);
  return url.href;
};

for (const [index, rule] of (await nextConfig.redirects()).entries()) {
  const params = matchParams(rule.source);
  const path = matcher.compile(rule.source)(params);
  const host = rule.has?.some(({ type }) => type === "host") ? "canevimsile.com" : "www.canevimsile.com";
  const expected = canonicalUrl(rule.destination, params);
  await check(`redirect-${index + 1}: ${path} @ ${host}`, async () => {
    const response = await get(path, host);
    assert.equal(response.status, 308, `${path} status`);
    assert.equal(response.headers.get("location"), expected, `${path} destination`);
    return { path, host, httpStatus: response.status, location: expected };
  });
}

const additional = [
  ["/menu", "canevimsile.com", `${CANONICAL_ORIGIN}/menu`],
  ["/menu/", "canevimsile.com", `${CANONICAL_ORIGIN}/menu`],
  ["/index.html/", "canevimsile.com", `${CANONICAL_ORIGIN}/`],
  ["/lezzetler/sile-gozleme.html/", "canevimsile.com", `${CANONICAL_ORIGIN}/sile-gozleme`],
  ["/sile/sile-kahvalti/", "canevimsile.com", `${CANONICAL_ORIGIN}/`],
  ["/blog/silede-kahvalti-rehberi/", "canevimsile.com", `${CANONICAL_ORIGIN}/`],
  ["/menu/?utm_source=http-qa", "canevimsile.com", `${CANONICAL_ORIGIN}/menu?utm_source=http-qa`],
  ["/nonexistent-http-qa/", "www.canevimsile.com", `${CANONICAL_ORIGIN}/nonexistent-http-qa`],
  ...["ar", "fa"].map((lang) => [`/${lang}/lezzetler/sile-gozleme/`, "canevimsile.com", `${CANONICAL_ORIGIN}/sile-gozleme`]),
];
for (const [path, host, expected] of additional) await check(`combined-normalization: ${path} @ ${host}`, async () => {
  const response = await get(path, host);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), expected);
  return { path, host, httpStatus: response.status, location: expected };
});

const flatten = (value, nodes = []) => {
  if (value && typeof value === "object") {
    if (!Array.isArray(value)) nodes.push(value);
    Object.values(value).forEach((child) => flatten(child, nodes));
  }
  return nodes;
};
const decode = (value) => value.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
for (const { path } of CONTENT_ROUTES) await check(`canonical: ${path}`, async () => {
  const response = await get(path, "www.canevimsile.com");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  const html = await response.text();
  const expected = `${CANONICAL_ORIGIN}${path}`;
  assert.match(html, /<html[^>]*lang="tr"/);
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag);
  const canonical = links.filter((tag) => /rel="canonical"/.test(tag));
  assert.equal(canonical.length, 1);
  const canonicalHref = canonical[0].match(/href="([^"]+)"/)?.[1];
  assert.equal(new URL(canonicalHref).href, expected);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  assert.ok(title && title.length >= 15);
  assert.match(html, /name="description" content="[^"]{30,}"/);
  const ogUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];
  assert.equal(new URL(ogUrl).href, expected);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  assert.equal(scripts.length, 1, "Exactly one JSON-LD graph per page");
  const graph = scripts[0]["@graph"];
  assert.ok(graph?.length >= 50);
  const nodes = flatten(scripts[0]);
  const definitions = nodes.filter((node) => node["@id"] && node["@type"]);
  const ids = new Set(definitions.map((node) => node["@id"]));
  assert.equal(ids.size, definitions.length, "All graph @ids must be unique");
  for (const node of nodes.filter((node) => node["@id"] && !node["@type"])) assert.ok(ids.has(node["@id"]), `Unresolved reference ${node["@id"]}`);
  assert.equal(definitions.filter((node) => [].concat(node["@type"]).includes("Restaurant")).length, 1);
  const visible = decode(html.replace(/<script\b[\s\S]*?<\/script>/g, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " "));
  for (const node of nodes.filter((node) => node["@type"] === "Question")) {
    assert.ok(visible.includes(node.name), `FAQ question absent from visible HTML: ${node.name}`);
    assert.ok(visible.includes(node.acceptedAnswer.text), "FAQ answer absent from visible HTML");
  }
  for (const node of nodes.filter((node) => node["@type"] === "MenuItem")) {
    const name = node.name.replace(/ Gözleme$/, "");
    assert.ok(visible.toLocaleLowerCase("tr-TR").includes(name.toLocaleLowerCase("tr-TR")), `Menu item absent from HTML: ${node.name}`);
  }
  assert.ok(!nodes.some((node) => node.offers || node.aggregateRating || node.review || node.areaServed));
  return { path, httpStatus: 200, canonical: expected, title: decode(title), graphNodes: graph.length, htmlBytes: Buffer.byteLength(html) };
});

await check("sitemap: canonical membership and content dates", async () => {
  const response = await get("/sitemap.xml");
  assert.equal(response.status, 200);
  const xml = await response.text();
  const dates = JSON.parse(await readFile(new URL("../app/content-dates.json", import.meta.url), "utf8"));
  const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  assert.equal(blocks.length, CONTENT_ROUTES.length);
  for (const { path } of CONTENT_ROUTES) {
    const block = blocks.find((entry) => entry.includes(`<loc>${CANONICAL_ORIGIN}${path}</loc>`));
    assert.ok(block, `Missing sitemap canonical ${path}`);
    assert.ok(dates[path]?.lastModified, `Missing content date ${path}`);
    assert.ok(block.includes(`<lastmod>${dates[path].lastModified}</lastmod>`));
    assert.ok(!Number.isNaN(Date.parse(dates[path].lastModified)));
  }
  assert.ok(!xml.includes("/blog") && !xml.includes(".html"));
  return { httpStatus: 200, urls: blocks.length, lastmodSource: "content-dates.json fingerprints" };
});
await check("robots: canonical sitemap and crawl permission", async () => {
  const response = await get("/robots.txt");
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.match(text, /User-Agent: \*/i);
  assert.match(text, /Allow: \/(?:\r?\n|$)/);
  assert.ok(text.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`));
  assert.ok(!/Disallow: \/(?:\r?\n|$)/.test(text));
  return { httpStatus: 200 };
});
for (const path of ["/scripts/gsc-audit.mjs", "/scripts/test-http.mjs", "/app/growth-schema.js", "/.env", "/.git/config", "/.audit/gsc/access.json", "/AGENTS.md", "/nonexistent-http-qa"]) await check(`source-protection: ${path}`, async () => {
  const response = await get(path, "www.canevimsile.com");
  assert.equal(response.status, 404);
  const text = await response.text();
  assert.ok(!text.includes("GSC_ACCESS_TOKEN") && !text.includes("export function buildPageGraph") && !text.includes("[core]"));
  return { path, httpStatus: response.status };
});

const report = { testedAt: new Date().toISOString(), baseUrl: base, configuredRedirectRules: (await nextConfig.redirects()).length, totalChecks: results.length, passed: results.length - failed.length, failed: failed.length, status: failed.length ? "failed" : "passed", scope: "Local production build; does not claim deployed production behavior or live Search Console results.", results };
await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, results: undefined, output }));
if (failed.length) { failed.forEach((failure) => console.error(`${failure.name}: ${failure.reason}`)); process.exitCode = 1; }
