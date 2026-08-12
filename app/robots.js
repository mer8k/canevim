const BASE_URL = "https://www.canevimsile.com";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
