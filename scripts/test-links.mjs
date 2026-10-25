import assert from "node:assert/strict";
import { compiledPagePath } from "./compiled-pages.mjs";
import fs from "node:fs";
import { CONTENT_ROUTES, CANONICAL_ORIGIN } from "../app/seo-routes.mjs";

const documents = new Map(CONTENT_ROUTES.map(({path}) => {
  const html = fs.readFileSync(compiledPagePath(path), "utf8").replace(/<script\b[\s\S]*?<\/script>/gi, "");
  return [path, {html, ids: new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))}];
}));
const results = [];
const failures = [];
for (const [path, {html}] of documents) {
  for (const [, raw] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = raw.replaceAll("&amp;", "&");
    const url = new URL(href, CANONICAL_ORIGIN + path);
    if (url.origin !== CANONICAL_ORIGIN || !/^https?:$/.test(url.protocol)) continue;
    const target = documents.get(url.pathname);
    const result = {from:path,href:url.pathname+url.hash};
    if (!target) failures.push({...result,reason:"No indexable canonical target"});
    else if (url.hash && !target.ids.has(decodeURIComponent(url.hash.slice(1)))) failures.push({...result,reason:"Anchor does not exist"});
    else results.push(result);
  }
}
const report = {testedAt:new Date().toISOString(),status:failures.length?"failed":"passed",pages:documents.size,links:results.length,failures};
fs.mkdirSync(".audit",{recursive:true});
fs.writeFileSync(".audit/link-tests.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report));
assert.equal(failures.length,0,"All internal links must resolve to canonical pages and existing anchors");
