// GSC snapshot: 2026-09-12, last three months.
// The homepage already ranks around positions 1-2 for the generic Şile breakfast
// intents below, while these duplicate landings mostly collect branded impressions.
export const SEO_CONSOLIDATION_REDIRECTS = [
  { source: "/sile/sile-kahvalti", destination: "/" },
  { source: "/sile/sile-kahvalti-mekanlari", destination: "/" },
  { source: "/sile/uvezli-kahvalti", destination: "/" },
  { source: "/sile/sile-dogada-kahvalti", destination: "/" },
  { source: "/sile/sile-yolu-kahvalti", destination: "/" },
  { source: "/sile/sile-restoran", destination: "/" },
  { source: "/sile/sile-serpme-kahvalti-menusu", destination: "/menu" },
  { source: "/lezzetler/sile-serpme-kahvalti", destination: "/menu" },
  { source: "/lezzetler/sile-koy-kahvaltisi", destination: "/menu" },
  { source: "/lezzetler/sile-gozleme", destination: "/menu" },
  { source: "/lezzetler/sile-ev-yapimi-manti", destination: "/menu" },
  { source: "/lezzetler/sile-izgara-sac-kavurma", destination: "/menu" },
  { source: "/lezzetler/sile-aile-restorani", destination: "/" },
  { source: "/lezzetler/sile-yolu-kahvalti-restoran", destination: "/" },
  { source: "/blog/mihlama-kuymak-farki", destination: "/menu" },
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
