// Read-only, post-push verification. This script never commits, pushes, deploys,
// modifies provider settings, reads browser credentials or accesses GSC.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { CONTENT_ROUTES, CANONICAL_ORIGIN } from "../app/seo-routes.mjs";
import { compiledPagePath } from "./compiled-pages.mjs";

const run = promisify(execFile);
const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(name); return index < 0 ? fallback : args[index + 1]; };
if (args.includes("--help")) {
  console.log("Read-only post-push verification\nnode scripts/verify-deployment.mjs --sha <40-char-commit> [--wait-seconds 300] [--interval-seconds 15] [--out .audit/round2/deployment-verification.json]\nRequires authenticated gh, the tested .next production build and ordinary public HTTPS access. No push/deploy operation is performed. Checks the specified SHA's GitHub/Vercel statuses, production deployment records, public canonical pages, metadata/schema and sitemap. Public provider URLs may be inspected without authentication; inaccessible/protected responses are reported without bypass attempts.");
  process.exit(0);
}
const sha = option("--sha", "");
if (!/^[a-f0-9]{40}$/i.test(sha)) throw new Error("Pass the exact pushed commit with --sha <40-character SHA>; verification must not silently target an old HEAD.");
const waitSeconds = Number(option("--wait-seconds", "0"));
const intervalSeconds = Number(option("--interval-seconds", "15"));
if (!Number.isFinite(waitSeconds) || waitSeconds < 0 || waitSeconds > 1800 || !Number.isFinite(intervalSeconds) || intervalSeconds < 5 || intervalSeconds > 60) throw new Error("Polling bounds: wait 0–1800 seconds; interval 5–60 seconds.");
const output = resolve(option("--out", ".audit/round2/deployment-verification.json"));
const repository = "mer8k/canevim";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const decode = (value) => value.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const expected = await Promise.all(CONTENT_ROUTES.map(async ({ path }) => {
  const bytes = await readFile(resolve(compiledPagePath(path)));
  const html = bytes.toString("utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  if (!title) throw new Error(`Tested production HTML lacks a title: ${path}`);
  const graph = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  if (graph.length !== 1 || !graph[0]["@graph"]) throw new Error(`Tested production HTML lacks one graph: ${path}`);
  return { path, title: decode(title), graphNodes: graph[0]["@graph"].length, builtHtmlSha256: hash(bytes) };
}));
const buildId = (await readFile(new URL("../.next/BUILD_ID", import.meta.url), "utf8")).trim();

async function ghApi(path) {
  try { const result = await run("gh", ["api", path], { encoding: "utf8", timeout: 30000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }); return JSON.parse(result.stdout); }
  catch (error) {
    const details = String(error.stderr || "");
    const category = error.code === "ENOENT" ? "GitHub CLI unavailable" : /401|403|auth login/i.test(details) ? "GitHub authorization rejected" : /404|Not Found/i.test(details) ? "GitHub resource unavailable" : "GitHub read request failed";
    throw new Error(`${category}; credentials and raw authentication output are not logged.`);
  }
}
async function deploymentSnapshot() {
  const [commit, deployments] = await Promise.all([ghApi(`repos/${repository}/commits/${sha}/status`), ghApi(`repos/${repository}/deployments?sha=${sha}&per_page=100`)]);
  const contexts = (commit.statuses || []).filter(({ context }) => /^Vercel\b/i.test(context)).map(({ context, state, description, target_url }) => ({ context, state, description, targetUrl: target_url }));
  const latestByEnvironment = new Map();
  for (const entry of deployments.filter((entry) => /production/i.test(entry.environment || "") && entry.sha === sha && entry.creator?.login === "vercel[bot]")) {
    if (!latestByEnvironment.has(entry.environment)) latestByEnvironment.set(entry.environment, entry);
  }
  const production = await Promise.all([...latestByEnvironment.values()].map(async (entry) => {
    const statuses = await ghApi(`repos/${repository}/deployments/${entry.id}/statuses?per_page=1`);
    const latest = statuses[0];
    return { id: entry.id, sha: entry.sha, environment: entry.environment, createdAt: entry.created_at, state: latest?.state || "pending", environmentUrl: latest?.environment_url || null, updatedAt: latest?.created_at || null };
  }));
  // Both integrations were observed before release; verify neither disappears
  // silently from the evidence for the newly pushed SHA.
  const requiredContexts = ["Vercel – canevim", "Vercel – canevim-next"];
  const complete = requiredContexts.every((name) => contexts.some((context) => context.context === name && context.state === "success")) && production.length >= 2 && production.every(({ state }) => state === "success");
  const failed = contexts.some(({ state }) => ["failure", "error"].includes(state)) || production.some(({ state }) => ["failure", "error"].includes(state));
  return { commitState: commit.state, contexts, production, complete, failed };
}
let deployments;
const deadline = Date.now() + waitSeconds * 1000;
let lastState = "";
do {
  deployments = await deploymentSnapshot();
  const state = JSON.stringify({ contexts: deployments.contexts.map(({ context, state }) => ({ context, state })), production: deployments.production.map(({ environment, state }) => ({ environment, state })) });
  if (state !== lastState) { console.log(`Deployment state: ${state}`); lastState = state; }
  if (deployments.complete || deployments.failed || Date.now() >= deadline) break;
  await new Promise((done) => setTimeout(done, Math.min(intervalSeconds * 1000, deadline - Date.now())));
} while (Date.now() <= deadline);

const checks = [];
async function check(name, action) {
  try { const details = await action(); checks.push({ name, status: "passed", ...details }); }
  catch (error) { checks.push({ name, status: "failed", reason: error.message }); }
}
const publicGet = (url) => fetch(url, { redirect: "manual", signal: AbortSignal.timeout(30000), headers: { "User-Agent": "CanEvim-Deployment-Verification/1.0" } });
let homeHash;
for (const page of expected) await check(`canonical ${page.path}`, async () => {
  const response = await publicGet(`${CANONICAL_ORIGIN}${page.path}`);
  if (response.status !== 200) throw new Error(`Expected 200, received ${response.status}.`);
  const html = await response.text();
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
  if (title !== page.title) throw new Error(`Published title differs from tested build: ${title}`);
  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag).find((tag) => /rel="canonical"/.test(tag));
  const canonical = canonicalTag?.match(/href="([^"]+)"/)?.[1];
  if (!canonical || new URL(canonical).href !== `${CANONICAL_ORIGIN}${page.path}`) throw new Error("Published canonical differs from tested route.");
  const graph = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  if (graph.length !== 1 || graph[0]["@graph"]?.length !== page.graphNodes) throw new Error("Published graph count differs from tested build.");
  const publishedHtmlSha256 = hash(html);
  if (page.path === "/") homeHash = publishedHtmlSha256;
  return { httpStatus: 200, title, canonical, graphNodes: page.graphNodes, publishedHtmlSha256, testedHtmlSha256: page.builtHtmlSha256, exactBuiltHtmlMatch: publishedHtmlSha256 === page.builtHtmlSha256 };
});
await check("sitemap canonical set and stable content dates", async () => {
  const response = await publicGet(`${CANONICAL_ORIGIN}/sitemap.xml`);
  if (response.status !== 200) throw new Error(`Sitemap HTTP ${response.status}.`);
  const text = await response.text();
  const blocks = [...text.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  if (blocks.length !== CONTENT_ROUTES.length) throw new Error(`Expected ${CONTENT_ROUTES.length} URLs, found ${blocks.length}.`);
  const dates = JSON.parse(await readFile(new URL("../app/content-dates.json", import.meta.url), "utf8"));
  for (const { path } of CONTENT_ROUTES) {
    const block = blocks.find((item) => item.includes(`<loc>${CANONICAL_ORIGIN}${path}</loc>`));
    if (!block || !block.includes(`<lastmod>${dates[path]?.lastModified}</lastmod>`)) throw new Error(`Sitemap route/date mismatch: ${path}`);
  }
  return { httpStatus: 200, urls: blocks.length };
});
await check("non-www canonical host", async () => {
  const response = await publicGet("https://canevimsile.com/menu");
  if (response.status !== 308 || response.headers.get("location") !== `${CANONICAL_ORIGIN}/menu`) throw new Error("Non-www host did not redirect directly to canonical menu with 308.");
  return { httpStatus: response.status, location: response.headers.get("location") };
});

const providerComparisons = [];
for (const deployment of deployments.production) {
  const url = deployment.environmentUrl ? new URL(deployment.environmentUrl) : null;
  if (!url || url.protocol !== "https:" || !url.hostname.endsWith(".vercel.app")) continue;
  try {
    const response = await publicGet(url.href);
    const protectedOrUnavailable = response.status !== 200;
    providerComparisons.push({ deploymentId: deployment.id, environment: deployment.environment, url: url.href, httpStatus: response.status, publicHomeHtmlMatchesCustomDomain: protectedOrUnavailable || !homeHash ? null : hash(await response.text()) === homeHash, note: protectedOrUnavailable ? "Public deployment response is unavailable/protected. No authentication bypass attempted." : "A matching public body shows matching content, not ownership of the custom domain." });
  } catch { providerComparisons.push({ deploymentId: deployment.id, url: url.href, note: "Ordinary unauthenticated public request failed; no alternate authentication attempted." }); }
}
const failedChecks = checks.filter(({ status }) => status === "failed").length;
const report = { checkedAt: new Date().toISOString(), repository, pushedCommitSha: sha, testedBuildId: buildId, expectedCanonicalPages: CONTENT_ROUTES.length, deploymentComplete: deployments.complete, deploymentFailed: deployments.failed, deploymentSnapshot: deployments, publicSite: CANONICAL_ORIGIN, publicChecksPassed: checks.length - failedChecks, publicChecksFailed: failedChecks, status: deployments.failed ? "failed" : !deployments.complete ? "pending" : failedChecks ? "failed" : "verified", domainProjectAttribution: "Public HTTP headers and matching deployment bodies do not uniquely prove which of the two Vercel projects owns the custom domain. No private Vercel API or authenticated dashboard was accessed.", providerComparisons, checks, scope: "Read-only post-push verification. No commit, push, deploy, settings mutation, GSC access or browser credential inspection." };
await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, sha, deploymentComplete: report.deploymentComplete, publicChecksPassed: report.publicChecksPassed, publicChecksFailed: report.publicChecksFailed, output }));
if (report.status !== "verified") process.exitCode = 1;
