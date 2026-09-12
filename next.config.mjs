import { SEO_CONSOLIDATION_REDIRECTS } from "./app/seo-consolidation.mjs";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  async redirects() {
    return [...SEO_CONSOLIDATION_REDIRECTS.map((redirect) => ({
      ...redirect,
      permanent: true,
    })), {
      source: '/:lang(ar|fa)/:type(sile|lezzetler)/:slug',
      destination: '/:type/:slug',
      permanent: true,
    }, {
      source: '/blog/mihlama-kuymak-farki',
      destination: '/blog/sile-kahvalti-fiyatlari',
      permanent: true,
    }];
  },
};

export default nextConfig;
