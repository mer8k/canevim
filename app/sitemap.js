import { BASE_URL, blogPosts, menuLandings } from "./seo-data";

export default function sitemap() {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/menu`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...menuLandings.map(({ slug }) => ({ url: `${BASE_URL}/lezzetler/${slug}`, changeFrequency: "monthly", priority: 0.8 })),
    ...blogPosts.map(({ slug, date }) => ({ url: `${BASE_URL}/blog/${slug}`, lastModified: date, changeFrequency: "monthly", priority: 0.65 })),
  ];
}
