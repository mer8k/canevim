import { CANONICAL_ORIGIN, CONTENT_ROUTES } from "./seo-routes.mjs";
import contentDates from "./content-dates.json";

export default function sitemap() {
  return CONTENT_ROUTES.map(({ path, priority }) => ({
    url: `${CANONICAL_ORIGIN}${path}`,
    ...(contentDates[path]?.lastModified ? { lastModified: contentDates[path].lastModified } : {}),
    changeFrequency: "weekly",
    priority,
  }));
}
