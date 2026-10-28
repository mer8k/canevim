// Read-only, post-push verification. This script never commits, pushes, deploys,
// modifies provider settings, reads browser credentials or accesses GSC.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname, join } from "node:path";
import { CONTENT_ROUTES, CANONICAL_ORIGIN } from "../app/seo-routes.mjs";
import { compiledPagePath } from "./compiled-pages.mjs";

const run = promisify(execFile);
const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(name); return index < 0 ? fallback : args[index + 1]; };
if (args.includes("--help")) {
  console.log("Read-only post-push verification\nnode scripts/verify-deployment.mjs --sha <40-char-commit> [--wait-seconds 300] [--interval-seconds 15] [--out .audit/round2/deployment-verification.json]\nOptional authoritative provider mode: --vercel-project <prj_ID> --vercel-deployment <dpl_ID> --vercel-scope <team-slug>\nDefault mode requires authenticated gh and retains both observed Vercel integration contexts. Provider mode uses the installed Vercel CLI's existing authentication for GET-only deployment, project and domain checks; it requires the exact project, Git SHA, production target, READY state and custom-domain aliases. Both modes require all public canonical/metadata/schema/sitemap/host checks against the tested .next build. Body hashes are informative, not an acceptance condition. No push/deploy/settings operation, credential-file inspection or protection bypass is performed.");
  process.exit(0);
}
const sha = option("--sha", "");
if (!/^[a-f0-9]{40}$/i.test(sha)) throw new Error("Pass the exact pushed commit with --sha <40-character SHA>; verification must not silently target an old HEAD.");
const vercelProject = option("--vercel-project", ""), vercelDeployment = option("--vercel-deployment", ""), vercelScope = option("--vercel-scope", "");
const providerMode = Boolean(vercelProject || vercelDeployment || vercelScope);
if (providerMode && (!/^prj_[A-Za-z0-9]{8,80}$/.test(vercelProject) || !/^dpl_[A-Za-z0-9]{8,80}$/.test(vercelDeployment) || !/^[a-z0-9][a-z0-9-]{0,62}$/.test(vercelScope))) throw new Error("Provider mode requires explicit valid --vercel-project prj_ID, --vercel-deployment dpl_ID and --vercel-scope team-slug.");
const verificationMode = providerMode ? "authenticated_vercel_provider" : "github_contexts";
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
let vercelCommand;
async function vercelApi(endpoint) {
  // IDs/scope are validated above and arguments never pass through a shell. On
  // Windows, run the installed npm CLI entry with Node rather than executing a
  // .cmd file through execFile or composing cmd.exe command text.
  try {
    if (!vercelCommand) {
      if (process.platform === "win32") {
        const found = await run("where.exe", ["vercel.cmd"], { encoding: "utf8", timeout: 10000, windowsHide: true });
        for (const wrapper of found.stdout.split(/\r?\n/).filter(Boolean)) {
          const entry = join(dirname(wrapper.trim()), "node_modules", "vercel", "dist", "vc.js");
          try { await access(entry); vercelCommand = { file: process.execPath, prefix: [entry] }; break; } catch { /* Try the next installed npm wrapper. */ }
        }
        if (!vercelCommand) throw new Error("Installed Vercel Node CLI entry unavailable");
      } else vercelCommand = { file: "vercel", prefix: [] };
    }
    const response = await run(vercelCommand.file, [...vercelCommand.prefix, "api", endpoint, "--method", "GET", "--scope", vercelScope, "--raw", "--non-interactive"], { encoding: "utf8", timeout: 45000, windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
    return JSON.parse(response.stdout);
  } catch (error) {
    const details = String(error.stderr || "");
    const category = error.code === "ENOENT" || /entry unavailable/.test(error.message) ? "Vercel CLI unavailable" : /401|403|unauthorized|forbidden|not logged|login/i.test(details) ? "Vercel authorization rejected" : /404|not found/i.test(details) ? "Vercel resource unavailable" : "Vercel read request failed";
    throw new Error(`${category}; credentials and raw provider/authentication responses are not logged.`);
  }
}
const canonicalHost = new URL(CANONICAL_ORIGIN).hostname;
const expectedDomains = [...new Set([canonicalHost, canonicalHost.replace(/^www\./, "")])];
async function providerSnapshot() {
  const [deployment, project, firstDomains] = await Promise.all([
    vercelApi(`/v13/deployments/${vercelDeployment}?withGitRepoInfo=true`),
    vercelApi(`/v9/projects/${vercelProject}`),
    vercelApi(`/v9/projects/${vercelProject}/domains?limit=100`),
  ]);
  const domainRows = [...(firstDomains.domains || [])];
  let next = firstDomains.pagination?.next;
  const cursors = new Set();
  while (expectedDomains.some((name) => !domainRows.some((domain) => domain.name === name)) && next != null && !cursors.has(String(next)) && cursors.size < 20) {
    cursors.add(String(next));
    const page = await vercelApi(`/v9/projects/${vercelProject}/domains?limit=100&until=${encodeURIComponent(next)}`);
    domainRows.push(...(page.domains || [])); next = page.pagination?.next;
  }
  const aliases = Array.isArray(deployment.alias) ? deployment.alias.filter((alias) => typeof alias === "string").map((alias) => alias.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase()) : [];
  const currentProduction = project.targets?.production || project.productionDeployment || null;
  const currentProductionId = currentProduction?.id || currentProduction?.uid || null;
  const mappedDomains = expectedDomains.map((name) => {
    const domain = domainRows.find((row) => row.name === name);
    return { name, listed: Boolean(domain), projectId: domain?.projectId || null, verified: domain?.verified === true, redirect: domain?.redirect || null, gitBranch: domain?.gitBranch || null, customEnvironmentId: domain?.customEnvironmentId || null };
  });
  const criteria = {
    deploymentId: deployment.id === vercelDeployment,
    deploymentProject: deployment.projectId === vercelProject,
    projectId: project.id === vercelProject,
    exactGitCommit: deployment.gitSource?.sha?.toLowerCase() === sha.toLowerCase(),
    productionTarget: deployment.target === "production",
    deploymentReady: deployment.readyState === "READY",
    noAliasError: !deployment.aliasError,
    aliasesAssigned: deployment.aliasAssigned === true,
    customDomainsAssignedToDeployment: expectedDomains.every((name) => aliases.includes(name)),
    customDomainsMappedToProject: mappedDomains.every((domain) => domain.listed && domain.projectId === vercelProject && domain.verified && !domain.gitBranch && !domain.customEnvironmentId),
    currentProductionWhenAvailable: !currentProductionId || currentProductionId === vercelDeployment,
  };
  const identityMismatch = (deployment.id && deployment.id !== vercelDeployment) || (deployment.projectId && deployment.projectId !== vercelProject) || (project.id && project.id !== vercelProject) || (deployment.gitSource?.sha && deployment.gitSource.sha.toLowerCase() !== sha.toLowerCase()) || (deployment.target && deployment.target !== "production") || mappedDomains.some((domain) => domain.projectId && domain.projectId !== vercelProject);
  const complete = Object.values(criteria).every(Boolean);
  const failed = Boolean(identityMismatch || ["ERROR", "CANCELED"].includes(deployment.readyState) || deployment.aliasError);
  // Record selected non-secret provider facts only. In particular, do not persist
  // the full project response, environment configuration or CLI auth output.
  const facts = {
    checkedAt: new Date().toISOString(), scope: vercelScope,
    project: { id: project.id || null, name: project.name || null, accountId: project.accountId || null },
    deployment: { id: deployment.id || null, projectId: deployment.projectId || null, gitSource: { type: deployment.gitSource?.type || null, sha: deployment.gitSource?.sha || null, ref: deployment.gitSource?.ref || null }, target: deployment.target || null, readyState: deployment.readyState || null, url: deployment.url || null, aliasAssigned: deployment.aliasAssigned === true, aliases, aliasErrorCode: deployment.aliasError ? String(deployment.aliasError.code || "present") : null },
    domains: mappedDomains,
    currentProduction: { evidenceAvailable: Boolean(currentProductionId), deploymentId: currentProductionId },
    criteria, unmetCriteria: Object.entries(criteria).filter(([, passed]) => !passed).map(([name]) => name),
    endpoints: ["GET /v13/deployments/{id}?withGitRepoInfo=true", "GET /v9/projects/{id}", "GET /v9/projects/{id}/domains"],
    authentication: "Installed Vercel CLI resolver; no token or credential files read by this verifier.",
  };
  return { complete, failed, contexts: [], production: [{ id: deployment.id || vercelDeployment, sha: deployment.gitSource?.sha || null, environment: "production", state: complete ? "success" : failed ? "failure" : "pending", environmentUrl: deployment.url ? `https://${deployment.url}` : null }], provider: facts };
}
let deployments;
const deadline = Date.now() + waitSeconds * 1000;
let lastState = "";
do {
  deployments = await (providerMode ? providerSnapshot() : deploymentSnapshot());
  const state = JSON.stringify({ mode: verificationMode, contexts: deployments.contexts.map(({ context, state }) => ({ context, state })), production: deployments.production.map(({ environment, state }) => ({ environment, state })), ...(providerMode ? { unmetProviderCriteria: deployments.provider.unmetCriteria } : {}) });
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
await check("static home interactions match tested source", async () => {
  const expectedScript = await readFile(new URL("../public/home-ui.js", import.meta.url));
  const response = await publicGet(`${CANONICAL_ORIGIN}/home-ui.js`);
  if (response.status !== 200) throw new Error(`Home UI script HTTP ${response.status}.`);
  const publishedScript = Buffer.from(await response.arrayBuffer());
  const expectedSha256 = hash(expectedScript), publishedSha256 = hash(publishedScript);
  if (publishedSha256 !== expectedSha256) throw new Error("Published home interactions differ from the tested script.");
  return { httpStatus: 200, expectedSha256, publishedSha256 };
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
const domainProjectAttribution = providerMode
  ? deployments.provider.criteria.customDomainsMappedToProject ? `Authenticated Vercel project-domain records attribute ${expectedDomains.join(" and ")} to ${vercelProject} (${deployments.provider.project.name}). Deployment aliases and the project's current production target are checked separately; another Git integration is not required to prove this project's release.` : "Authenticated provider mode did not confirm both custom-domain mappings to the requested project; see unmetProviderCriteria."
  : "Public HTTP headers and matching deployment bodies do not uniquely prove which of the two Vercel projects owns the custom domain. No private Vercel API or authenticated dashboard was accessed.";
const report = { checkedAt: new Date().toISOString(), verificationMode, repository, pushedCommitSha: sha, testedBuildId: buildId, expectedCanonicalPages: CONTENT_ROUTES.length, deploymentComplete: deployments.complete, deploymentFailed: deployments.failed, deploymentSnapshot: deployments, ...(providerMode ? { provider: deployments.provider } : {}), publicSite: CANONICAL_ORIGIN, publicChecksPassed: checks.length - failedChecks, publicChecksFailed: failedChecks, status: deployments.failed ? "failed" : !deployments.complete ? "pending" : failedChecks ? "failed" : "verified", domainProjectAttribution, providerComparisons, checks, scope: "Read-only post-push verification. No commit, push, deploy, settings mutation, GSC access or browser credential inspection. Exact HTML hashes remain informative only; all public checks are required." };
await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, sha, deploymentComplete: report.deploymentComplete, publicChecksPassed: report.publicChecksPassed, publicChecksFailed: report.publicChecksFailed, output }));
if (report.status !== "verified") process.exitCode = 1;
