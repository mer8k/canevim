import { existsSync } from "node:fs";

export function compiledPagePath(route) {
  const prefix = `.next/server/app/${route === "/" ? "index" : route.slice(1)}`;
  return [prefix + ".html", prefix + ".body"].find(existsSync) || prefix + ".html";
}
