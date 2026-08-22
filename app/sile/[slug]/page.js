import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE_URL, getIntentLanding, intentLandings } from "../../seo-data";

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

  return (
    <main className="min-h-screen bg-[#fcfaf7] text-[#222]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <section className="relative min-h-[68vh] flex items-end overflow-hidden">
        <Image src={item.image} alt={item.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
        <header className="relative z-10 w-full max-w-[1100px] mx-auto px-6 md:px-12 pb-16 md:pb-24 text-white">
          <nav aria-label="İçerik yolu" className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/75 mb-7">
            <Link href="/">Can Evim Şile</Link><span className="mx-3">/</span><span>{item.name}</span>
          </nav>
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-5">{item.eyebrow}</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[82px] leading-[1.05] max-w-5xl">{item.name}</h1>
        </header>
      </section>

      <article className="max-w-[900px] mx-auto px-6 py-16 md:py-24">
        <p className="font-serif text-2xl md:text-4xl leading-relaxed text-[#333] mb-16">{item.intro}</p>
        {item.sections.map(([heading, body]) => (
          <section key={heading} className="mb-12 border-t border-[#ddd8cf] pt-10">
            <h2 className="font-serif text-3xl md:text-4xl mb-5">{heading}</h2>
            <p className="font-serif text-lg leading-[1.9] text-[#555]">{body}</p>
          </section>
        ))}
        <aside className="mt-16 bg-[#f0ece4] p-7 md:p-10">
          <h2 className="font-serif text-3xl mb-6">İlgili Şile rehberleri</h2>
          <div className="flex flex-wrap gap-3">
            {item.related.map((relatedSlug) => {
              const related = getIntentLanding(relatedSlug);
              return <Link key={relatedSlug} href={`/sile/${relatedSlug}`} className="border border-[#aaa195] px-5 py-3 font-serif">{related.name}</Link>;
            })}
          </div>
        </aside>
      </article>

      <section className="bg-[#161615] text-white px-6 py-16 md:py-24 text-center">
        <h2 className="font-serif text-4xl md:text-6xl mb-9">Menüyü ve sofranızı planlayın</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/menu" className="border border-white/40 px-7 py-4 font-sans text-sm tracking-wider">Güncel Menü</Link>
          <Link href="/#rezervasyon" className="border border-white/40 px-7 py-4 font-sans text-sm tracking-wider">Rezervasyon</Link>
          <a href="https://www.google.com/maps/search/?api=1&query=Can+Evim+Şile" target="_blank" rel="noreferrer" className="border border-white/40 px-7 py-4 font-sans text-sm tracking-wider">Yol Tarifi</a>
        </div>
      </section>
    </main>
  );
}
