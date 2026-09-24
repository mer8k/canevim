import { SEO_CONSOLIDATION_REDIRECTS } from "./app/seo-consolidation.mjs";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return [...SEO_CONSOLIDATION_REDIRECTS.map((redirect) => ({
      ...redirect,
      permanent: true,
    })), {
      source: '/:lang(en|ar|fa)/sile/:slug',
      destination: '/',
      permanent: true,
    }, {
      source: '/:lang(en|ar|fa)/lezzetler/:slug',
      destination: '/menu',
      permanent: true,
    }];
  },
};

export default nextConfig;
