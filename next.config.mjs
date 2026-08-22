/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{
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
