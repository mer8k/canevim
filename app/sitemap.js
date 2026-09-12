import { BASE_URL, blogPosts, intentLandings, menuLandings } from "./seo-data";
import { locales, localizedSources } from "./localized-seo-data";
import { isConsolidated } from "./seo-consolidation.mjs";

export default function sitemap() {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/menu`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...intentLandings.filter(({ slug }) => !isConsolidated("sile", slug)).map(({ slug }) => ({ url: `${BASE_URL}/sile/${slug}`, changeFrequency: "monthly", priority: 0.85 })),
    ...menuLandings.filter(({ slug }) => !isConsolidated("lezzetler", slug)).map(({ slug }) => ({ url: `${BASE_URL}/lezzetler/${slug}`, changeFrequency: "monthly", priority: 0.8 })),
    ...locales.flatMap((lang) => localizedSources.map(({ type, slug }) => ({ url: `${BASE_URL}/${lang}/${type}/${slug}`, changeFrequency: "monthly", priority: 0.7 }))),
    ...blogPosts.map(({ slug, date }) => ({ url: `${BASE_URL}/blog/${slug}`, lastModified: date, changeFrequency: "monthly", priority: 0.65 })),
  ];
}
