// Every menu item below is present in the public menu. No unconfirmed prices,
// suppliers, cooking methods, facilities or review totals are inferred.
export const SITE_URL = "https://www.canevimsile.com";

export const MENU_SECTIONS = [
  { id: "kahvalti", name: "Kahvaltı", items: [
    { name: "Serpme Kahvaltı", description: "Peynir tabağı, yeşil zeytin, siyah zeytin, çizik zeytin, acuka, çilek reçeli, portakal reçeli, çeri domates, salatalık, tereyağ, bal-kaymak, pişi, muska börek, sahanda yumurta, menemen, sınırsız çay." },
    { name: "Kahvaltı Tabağı", description: "Peynir tabağı, yeşil zeytin, siyah zeytin, çizik zeytin, acuka, çilek reçeli, portakal reçeli, çeri domates, salatalık, tereyağ, haşlanmış yumurta, çay." },
  ] },
  { id: "sicaklar", name: "Ekstra Sıcaklar", items: [
    "Mıhlama", "Menemen", "Sucuklu Omlet", "Peynirli Omlet", "Kıymalı Omlet", "Sade Omlet", "Sahanda Yumurta", "Haşlanmış Yumurta", "Tavada Sucuk", "Patates Kızartması", "Biber Kızartması", "Pişi Tabağı", "Muska Börek", "Mercimek Çorbası",
    { name: "Karışık Kızartma", description: "Kızarmış patates ve biberin üstüne domates sosu." },
  ] },
  { id: "gozleme", name: "Gözleme Çeşitleri", items: ["Patatesli Gözleme", "Kaşarlı Gözleme", "Beyaz Peynirli Gözleme", "Pazılı Gözleme", "Kıymalı Gözleme", "Sucuklu Gözleme"] },
  { id: "ana-yemekler", name: "Ana Yemekler", items: [
    { name: "Izgara Köfte", description: "Pilav, domates ve biber ile." },
    { name: "Izgara Sucuk", description: "Pilav, domates ve biber ile." },
    { name: "Piliç Izgara", description: "Pilav, domates ve biber ile." },
    "Sac Kavurma", "Ev Yapımı Mantı", "Çıtır Mantı", "Çiğbörek",
  ] },
  { id: "tostlar", name: "Tostlar ve Sandviçler", items: ["Kaşarlı Tost", "Sucuklu Tost", "Karışık Tost", "Köfte Ekmek"] },
  { id: "salatalar", name: "Salatalar", items: ["Mevsim Salata", "Çoban Salata"] },
  { id: "tatlilar", name: "Tatlılar", items: ["Traliçe", "Fıstık Rüyası", "Tiramisu"] },
  { id: "sicak-icecekler", name: "Sıcak İçecekler", items: ["Çay", "Fincan Çay", "Termos Çay", "Türk Kahvesi", "Nescafe", "Sütlü Nescafe", "Sıcak Süt"] },
  { id: "soguk-icecekler", name: "Soğuk İçecekler", items: ["Ev Yapımı Limonata", "Kola / Fanta / Cappy", "Gazoz", "Açık Ayran", "Kapalı Ayran", "Maden Suyu", "Churchill", "Su"] },
];

const ref = (id) => ({ "@id": id });
const restaurantId = `${SITE_URL}/#restaurant`;
const menuId = `${SITE_URL}/menu#menu`;

function slug(value) {
  return value.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function canonicalUrl(path = "/") {
  if (!path.startsWith("/") || path.startsWith("//") || /[?#]/.test(path)) {
    throw new Error("Canonical path must be a local pathname without query or fragment.");
  }
  return `${SITE_URL}${path === "/" ? "/" : path.replace(/\/+$/, "")}`;
}

export function buildSharedGraph() {
  const sectionNodes = MENU_SECTIONS.map((section) => ({
    "@type": "MenuSection",
    "@id": `${SITE_URL}/menu#section-${section.id}`,
    name: section.name,
    hasMenuItem: section.items.map((item) => ref(`${SITE_URL}/menu#item-${slug(typeof item === "string" ? item : item.name)}`)),
  }));
  const itemNodes = MENU_SECTIONS.flatMap((section) => section.items.map((item) => {
    const entry = typeof item === "string" ? { name: item } : item;
    return {
      "@type": "MenuItem",
      "@id": `${SITE_URL}/menu#item-${slug(entry.name)}`,
      ...entry,
    };
  }));

  return [
    {
      "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
      "@id": restaurantId,
      name: "Can Evim Şile",
      url: `${SITE_URL}/`,
      telephone: "+90 537 497 50 62",
      image: ref(`${SITE_URL}/#restaurant-image`),
      hasMenu: ref(menuId),
      servesCuisine: ["Türk Mutfağı", "Serpme Kahvaltı", "Köy Kahvaltısı", "Gözleme"],
      address: ref(`${SITE_URL}/#address`),
      geo: ref(`${SITE_URL}/#geo`),
      hasMap: "https://www.google.com/maps?cid=2837137820972948771",
      openingHoursSpecification: ref(`${SITE_URL}/#opening-hours`),
      acceptsReservations: true,
      amenityFeature: ref(`${SITE_URL}/#garden`),
      sameAs: ["https://instagram.com/canevimsile", "https://www.google.com/maps?cid=2837137820972948771"],
    },
    { "@type": "PostalAddress", "@id": `${SITE_URL}/#address`, streetAddress: "Üvezli, Alemdağ Şile Yolu No: 193", postalCode: "34980", addressLocality: "Şile", addressRegion: "İstanbul", addressCountry: "TR" },
    { "@type": "GeoCoordinates", "@id": `${SITE_URL}/#geo`, latitude: 41.1104673, longitude: 29.4258912 },
    { "@type": "OpeningHoursSpecification", "@id": `${SITE_URL}/#opening-hours`, dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => `https://schema.org/${day}`), opens: "08:00", closes: "23:00" },
    { "@type": "LocationFeatureSpecification", "@id": `${SITE_URL}/#garden`, name: "Bahçe", value: true },
    { "@type": "ImageObject", "@id": `${SITE_URL}/#restaurant-image`, url: `${SITE_URL}/performance/social/can-evim-og.jpg`, contentUrl: `${SITE_URL}/performance/social/can-evim-og.jpg`, caption: "Can Evim Şile" },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Can Evim Şile", inLanguage: "tr-TR", publisher: ref(restaurantId) },
    { "@type": "Menu", "@id": menuId, name: "Can Evim Şile Menüsü", url: `${SITE_URL}/menu`, inLanguage: "tr-TR", hasMenuSection: sectionNodes.map((node) => ref(node["@id"])) },
    ...sectionNodes,
    ...itemNodes,
  ];
}

// Call once per page. Shared entities keep the same @id across canonical pages.
// FAQ entries must also appear as visible questions and answers in that page.
export function buildPageGraph({ path = "/", title = "Can Evim Şile", description = "", faqs = [] } = {}) {
  const url = canonicalUrl(path);
  const pageId = `${url}#webpage`;
  const breadcrumbsId = `${url}#breadcrumbs`;
  const faqId = `${url}#faq`;
  const hasFaq = faqs.length > 0;
  const questionNodes = faqs.map((entry, index) => ({
    "@type": "Question",
    "@id": `${url}#question-${index + 1}`,
    name: Array.isArray(entry) ? entry[0] : entry.question || entry.q,
    acceptedAnswer: { "@type": "Answer", "@id": `${url}#answer-${index + 1}`, text: Array.isArray(entry) ? entry[1] : entry.answer || entry.a },
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...buildSharedGraph(),
      { "@type": "WebPage", "@id": pageId, url, name: title, description, inLanguage: "tr-TR", isPartOf: ref(`${SITE_URL}/#website`), about: ref(restaurantId), mainEntity: ref(path === "/menu" ? menuId : restaurantId), breadcrumb: ref(breadcrumbsId), ...(hasFaq ? { hasPart: ref(faqId) } : {}) },
      { "@type": "BreadcrumbList", "@id": breadcrumbsId, itemListElement: [{ "@type": "ListItem", position: 1, name: "Şile Kahvaltı · Can Evim", item: `${SITE_URL}/` }, ...(path === "/" ? [] : [{ "@type": "ListItem", position: 2, name: title.split("|")[0].trim(), item: url }])] },
      ...(hasFaq ? [{ "@type": "FAQPage", "@id": faqId, isPartOf: ref(pageId), mainEntity: questionNodes }] : []),
    ],
  };
}

export function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
