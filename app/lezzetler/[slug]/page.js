import { notFound } from "next/navigation";
import SeoEditorialPage from "../../components/SeoEditorialPage";
import { BASE_URL, getMenuLanding, menuLandings } from "../../seo-data";

export const dynamicParams = false;
export function generateStaticParams() { return menuLandings.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getMenuLanding(slug);
  if (!item) return {};
  const path = `/lezzetler/${item.slug}`;
  return {
    title: `${item.name} | Can Evim Şile`,
    description: item.description,
    alternates: { canonical: path },
    openGraph: { title: `${item.name} | Can Evim Şile`, description: item.description, url: path, type: "website", images: [{ url: item.image, alt: item.name }] },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const item = getMenuLanding(slug);
  if (!item) notFound();
  const url = `${BASE_URL}/lezzetler/${item.slug}`;
  const schema = [
    { "@context": "https://schema.org", "@type": "MenuItem", "@id": `${url}#menu-item`, name: item.menuName, description: item.description, image: `${BASE_URL}${item.image}`, url, inMenu: { "@type": "Menu", "@id": `${BASE_URL}/menu#menu`, name: "Can Evim Şile Menü" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Can Evim Şile", item: `${BASE_URL}/` }, { "@type": "ListItem", position: 2, name: "Menü", item: `${BASE_URL}/menu` }, { "@type": "ListItem", position: 3, name: item.name, item: url }] },
  ];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><SeoEditorialPage item={item} /></>;
}
