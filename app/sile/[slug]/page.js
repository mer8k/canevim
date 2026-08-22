import { notFound } from "next/navigation";
import { BASE_URL, getIntentLanding, intentLandings } from "../../seo-data";
import Home from "../../page";

export const dynamicParams = false;

export function generateStaticParams() {
  return intentLandings.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getIntentLanding(slug);
  if (!item) return {};
  const path = `/sile/${item.slug}`;
  return {
    title: `${item.name} | Can Evim Şile`,
    description: item.description,
    alternates: { canonical: path, languages: { 'tr-TR': path, en: `/en/sile/${item.slug}`, 'x-default': path } },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: path,
      title: `${item.name} | Can Evim Şile`,
      description: item.description,
      images: [{ url: item.image, alt: item.name }],
    },
  };
}

export default async function IntentPage({ params }) {
  const { slug } = await params;
  const item = getIntentLanding(slug);
  if (!item) notFound();
  const url = `${BASE_URL}/sile/${item.slug}`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: item.name,
      description: item.description,
      url,
      about: { "@id": `${BASE_URL}/#restaurant` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Can Evim Şile", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: item.name, item: url },
      ],
    },
  ];

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><Home heroTitle={item.name} /></>;
}
