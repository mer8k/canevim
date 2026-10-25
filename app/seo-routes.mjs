export const CANONICAL_ORIGIN = "https://www.canevimsile.com";

export const CONTENT_ROUTES = [
  { path: "/", source: "app/route.js", priority: 1 },
  { path: "/menu", source: "app/menu/page.js", priority: 0.9 },
  { path: "/sile-serpme-kahvalti", source: "app/[experience]/page.js", priority: 0.9 },
  { path: "/sile-gozleme", source: "app/[experience]/page.js", priority: 0.8 },
  { path: "/sile-doga-kahvaltisi", source: "app/[experience]/page.js", priority: 0.8 },
  { path: "/sile-restoran", source: "app/[experience]/page.js", priority: 0.8 },
  { path: "/ulasim", source: "app/ulasim/page.js", priority: 0.8 },
  { path: "/sile-koy-kahvaltisi", source: "app/[experience]/page.js", priority: 0.8 },
  { path: "/sile-cocuk-oyun-alanli-kahvalti", source: "app/[experience]/page.js", priority: 0.8 },
  { path: "/sile-grup-ve-organizasyon-kahvaltisi", source: "app/[experience]/page.js", priority: 0.7 },
  { path: "/agva-sile-yolu-kahvalti-molasi", source: "app/[experience]/page.js", priority: 0.7 },
  { path: "/sile-kumbaba-cavus-kahvalti", source: "app/[experience]/page.js", priority: 0.7 },
  { path: "/cekmekoy-umraniye-sile-kahvalti-rotasi", source: "app/[experience]/page.js", priority: 0.7 },
  { path: "/sile-kahvalti-fiyatlari", source: "app/[experience]/page.js", priority: 0.8 },
  { path: "/sile-mihlama", source: "app/[experience]/page.js", priority: 0.7 },
  { path: "/sile-ev-yapimi-manti", source: "app/[experience]/page.js", priority: 0.7 },
  { path: "/sile-cay-tatli-molasi", source: "app/[experience]/page.js", priority: 0.7 },
];
