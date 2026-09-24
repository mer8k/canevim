import { BASE_URL } from "./seo-data";

export default function sitemap() {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/menu`, changeFrequency: "weekly", priority: 0.9 },
  ];
}
