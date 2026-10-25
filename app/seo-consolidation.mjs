import { CONTENT_ROUTES } from "./seo-routes.mjs";

// Historical repository note (2026-09-12 snapshot; NOT live API evidence): the
// homepage was reported around positions 1–2 for generic breakfast queries.
// These redirects consolidate known legacy routes by their present search intent.
export const SEO_CONSOLIDATION_REDIRECTS = [
  { source: "/sile/sile-kahvalti", destination: "/" },
  { source: "/sile/sile-kahvalti-mekanlari", destination: "/" },
  { source: "/sile/uvezli-kahvalti", destination: "/" },
  { source: "/sile/sile-dogada-kahvalti", destination: "/sile-doga-kahvaltisi" },
  { source: "/sile/sile-yolu-kahvalti", destination: "/ulasim" },
  { source: "/sile/sile-restoran", destination: "/sile-restoran" },
  { source: "/sile/sile-serpme-kahvalti-menusu", destination: "/sile-serpme-kahvalti" },
  { source: "/lezzetler/sile-serpme-kahvalti", destination: "/sile-serpme-kahvalti" },
  { source: "/lezzetler/sile-koy-kahvaltisi", destination: "/sile-koy-kahvaltisi" },
  { source: "/lezzetler/sile-gozleme", destination: "/sile-gozleme" },
  { source: "/lezzetler/sile-ev-yapimi-manti", destination: "/sile-ev-yapimi-manti" },
  { source: "/lezzetler/sile-izgara-sac-kavurma", destination: "/sile-restoran" },
  { source: "/lezzetler/sile-aile-restorani", destination: "/sile-doga-kahvaltisi" },
  { source: "/lezzetler/sile-yolu-kahvalti-restoran", destination: "/ulasim" },
  { source: "/blog/mihlama-kuymak-farki", destination: "/sile-mihlama" },
  // Known posts removed from seo-data.js in the previous consolidation.
  { source: "/blog/silede-kahvalti-rehberi", destination: "/" },
  { source: "/blog/serpme-kahvaltida-neler-var", destination: "/sile-serpme-kahvalti" },
  { source: "/blog/uvezlide-hafta-sonu-kahvaltisi", destination: "/ulasim" },
  { source: "/blog/sile-kahvalti-fiyatlari", destination: "/sile-kahvalti-fiyatlari" },
  { source: "/blog/silede-aile-restorani-secimi", destination: "/sile-doga-kahvaltisi" },
  { source: "/blog/sile-gozleme-cesitleri", destination: "/sile-gozleme" },
  // Defensive exact aliases for the user's named former breakfast-list page.
  // Their precise historical URLs / current GSC traffic have not been verified.
  // Keep these explicit; unrelated blog content must not be redirected broadly.
  { source: "/blog/silede-kahvalti-mekanlari", destination: "/" },
  { source: "/silede-kahvalti-mekanlari", destination: "/" },
  { source: "/sile-kahvalti-mekanlari", destination: "/" },
];

// Explicit compatibility aliases for the requested former HTML URL format.
// They are defensive aliases, not a claim that these URLs currently get traffic.
export const LEGACY_HTML_REDIRECTS = [
  { source: "/index.html", destination: "/" },
  { source: "/menu.html", destination: "/menu" },
  { source: "/sile-kahvalti.html", destination: "/" },
  ...CONTENT_ROUTES.filter(({ path }) => path !== "/" && path !== "/menu").map(({ path }) => ({ source: `${path}.html`, destination: path })),
  ...SEO_CONSOLIDATION_REDIRECTS.map(({ source, destination }) => ({ source: `${source}.html`, destination })),
];

const destinationByPath = new Map(
  SEO_CONSOLIDATION_REDIRECTS.map(({ source, destination }) => [
    source,
    destination,
  ]),
);

export function consolidatedDestination(type, slug) {
  return destinationByPath.get(`/${type}/${slug}`) || `/${type}/${slug}`;
}

export function isConsolidated(type, slug) {
  return destinationByPath.has(`/${type}/${slug}`);
}
