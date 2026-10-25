import { CANONICAL_ORIGIN } from "./seo-routes.mjs";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${CANONICAL_ORIGIN}/sitemap.xml`,
    host: CANONICAL_ORIGIN,
  };
}
