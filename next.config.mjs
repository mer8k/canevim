import { SEO_CONSOLIDATION_REDIRECTS, LEGACY_HTML_REDIRECTS } from "./app/seo-consolidation.mjs";
import { CANONICAL_ORIGIN } from "./app/seo-routes.mjs";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // Normalize legacy paths, their slash form and their host in one redirect.
  skipTrailingSlashRedirect: true,
  experimental: {
    inlineCss: true,
  },
  images: {
    qualities: [55, 65, 75],
  },
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  async headers() {
    return [{
      source: "/performance/:path*",
      headers: [{
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      }],
    }];
  },
  async redirects() {
    const legacy = [...SEO_CONSOLIDATION_REDIRECTS, ...LEGACY_HTML_REDIRECTS];
    const localized = SEO_CONSOLIDATION_REDIRECTS.filter(({ source }) => /^\/(sile|lezzetler)\//.test(source)).map(({ source, destination }) => ({ source: `/:lang(en|ar|fa)${source}`, destination }));
    const targets = [...legacy, ...localized,
      { source: "/:lang(en|ar|fa)/sile/:slug", destination: "/" },
      { source: "/:lang(en|ar|fa)/lezzetler/:slug", destination: "/menu" },
    ];
    return [
      ...targets.flatMap(({ source, destination }) => [source, `${source}/`].map((variant) => ({
        source: variant,
        destination: `${CANONICAL_ORIGIN}${destination}`,
        permanent: true,
      }))),
      { source: "/:path+/", destination: `${CANONICAL_ORIGIN}/:path+`, permanent: true },
      { source: "/:path*", has: [{ type: "host", value: "canevimsile\\.com" }], destination: `${CANONICAL_ORIGIN}/:path*`, permanent: true },
    ];
  },
};

export default nextConfig;
