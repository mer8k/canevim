import { readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, dirname, relative, extname } from "node:path";
import { CONTENT_ROUTES } from "../app/seo-routes.mjs";
import { contentBytes } from "./content-fingerprint.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const target = resolve(root, "app/content-dates.json");
const previous = JSON.parse(await readFile(target, "utf8").catch(() => "{}"));
const existing = async (path) => stat(resolve(root, path)).then(() => true).catch(() => false);
const sharedSources = ["app/layout.js"];
const next = {};
let missing = false;

async function dependencies(source, visited = new Set()) {
  if (visited.has(source)) return visited;
  visited.add(source);
  if (![".js", ".jsx", ".mjs", ".ts", ".tsx"].includes(extname(source))) return visited;
  const code = await readFile(resolve(root, source), "utf8");
  // Include local images and scripts referenced by URL, not just ES imports.
  for (const match of code.matchAll(/["'](\/(?!\/)[^"'?#]+\.(?:js|jpg|jpeg|png|webp|avif|svg|woff2))["']/gi)) {
    const asset = `public${match[1]}`;
    if (await existing(asset)) visited.add(asset);
  }
  const imports = [...code.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'](\.[^"']+)["']/g)].map((match) => match[1]);
  for (const specifier of imports) {
    const local = relative(root, resolve(root, dirname(source), specifier)).replace(/\\/g, "/");
    if (local.startsWith("../")) throw new Error("Content dependency escaped the project root.");
    const candidates = [local, ...[".js", ".jsx", ".mjs", ".json", ".css", ".ts", ".tsx"].map((extension) => local + extension), `${local}/index.js`];
    let found;
    for (const candidate of candidates) {
      if (await existing(candidate) && (await stat(resolve(root, candidate))).isFile()) { found = candidate; break; }
    }
    if (!found) throw new Error(`Missing local dependency ${specifier} from ${source}.`);
    await dependencies(found, visited);
  }
  return visited;
}

for (const route of CONTENT_ROUTES) {
  if (!await existing(route.source)) {
    console.warn(`Missing content source: ${route.source}; run again after page creation.`);
    missing = true;
    if (previous[route.path]) next[route.path] = previous[route.path];
    continue;
  }
  const visited = new Set();
  const landingSources = route.path === "/" ? ["app/home-content.js", "scripts/build-home.cjs", "scripts/home-ui.cjs", "public/home-ui.js", "app/globals.css", "app/local-fonts-subset.css", "app/mobile-actions.css", "app/growth-content.css", "app/growth-performance.css"] : [];
  for (const source of [route.source, ...sharedSources, ...landingSources]) await dependencies(source, visited);
  const sources = [...visited].sort();
  const records = await Promise.all(sources.map(async (source) => ({ source, bytes: await readFile(resolve(root, source)), details: await stat(resolve(root, source)) })));
  const fingerprint = createHash("sha256");
  for (const record of records) fingerprint.update(record.source).update("\0").update(contentBytes(record.source, record.bytes)).update("\0");
  const sha256 = fingerprint.digest("hex");
  next[route.path] = previous[route.path]?.sha256 === sha256 ? previous[route.path] : {
    sha256,
    // This is the newest saved content-source mtime, never the build clock.
    lastModified: new Date(Math.max(...records.map(({ details }) => details.mtimeMs))).toISOString(),
    sources,
  };
}

const changed = JSON.stringify(previous) !== JSON.stringify(next);
if (process.argv.includes("--check")) {
  if (changed || missing) { console.error("Content date manifest is stale; run node scripts/update-content-dates.mjs."); process.exitCode = 1; }
} else if (changed) await writeFile(target, `${JSON.stringify(next, null, 2)}\n`);
console.log(JSON.stringify({ manifest: "app/content-dates.json", pages: Object.keys(next).length, changed, missing }));
