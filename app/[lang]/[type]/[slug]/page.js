import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BASE_URL } from '../../../seo-data';
import { getLocalizedPage, locales, localizedSources } from '../../../localized-seo-data';

export const dynamicParams = false;
export function generateStaticParams() { return locales.flatMap((lang) => localizedSources.map(({ type, slug }) => ({ lang, type, slug }))); }

export async function generateMetadata({ params }) {
  const { lang, type, slug } = await params;
  const item = getLocalizedPage(lang, type, slug);
  if (!item) return {};
  const canonical = `/${lang}/${type}/${slug}`;
  const languages = { 'tr-TR': `/${type}/${slug}`, en: `/en/${type}/${slug}`, 'x-default': `/${type}/${slug}` };
  return { title: `${item.localizedTitle} | Can Evim Şile`, description: item.copy.intro(item.localizedTitle), alternates: { canonical, languages }, openGraph: { type: 'website', locale: lang, url: canonical, title: item.localizedTitle, description: item.copy.intro(item.localizedTitle), images: [{ url: item.image, alt: item.localizedTitle }] } };
}

export default async function LocalizedPage({ params }) {
  const { lang, type, slug } = await params;
  const item = getLocalizedPage(lang, type, slug);
  if (!item) notFound();
  const rtl = lang === 'ar' || lang === 'fa';
  const url = `${BASE_URL}/${lang}/${type}/${slug}`;
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: item.localizedTitle, description: item.copy.intro(item.localizedTitle), url, about: { '@id': `${BASE_URL}/#restaurant` } };
  return <main lang={lang} dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#fcfaf7] text-[#222]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <section className="relative min-h-[72vh] flex items-end overflow-hidden"><Image src={item.image} alt={item.localizedTitle} fill priority className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" /><header className="relative z-10 w-full max-w-[1100px] mx-auto px-6 md:px-12 pb-16 md:pb-24 text-white"><p className="font-sans text-xs tracking-[0.2em] uppercase mb-5">{item.copy.eyebrow}</p><h1 className="font-serif text-5xl md:text-7xl lg:text-[82px] leading-[1.05]">{item.localizedTitle}</h1></header></section>
    <article className="max-w-[900px] mx-auto px-6 py-16 md:py-24"><p className="font-serif text-2xl md:text-4xl leading-relaxed mb-16">{item.copy.intro(item.localizedTitle)}</p><section className="border-t border-[#ddd8cf] pt-10"><h2 className="font-serif text-3xl md:text-4xl mb-5">{item.copy.detailTitle}</h2><p className="font-serif text-lg leading-[1.9] text-[#555]">{item.copy.detail}</p></section><aside className="mt-14"><h2 className="font-serif text-2xl mb-5">{item.copy.related}</h2><nav className="flex flex-wrap gap-3"><Link href={`/${type}/${slug}`} className="border px-4 py-3">Türkçe</Link>{locales.map((code) => <Link key={code} href={`/${code}/${type}/${slug}`} className="border px-4 py-3">{code.toUpperCase()}</Link>)}</nav></aside></article>
    <section className="bg-[#161615] text-white px-6 py-16 text-center"><div className="flex flex-wrap gap-4 justify-center"><Link href="/menu" className="border border-white/40 px-7 py-4">{item.copy.menu}</Link><Link href="/#rezervasyon" className="border border-white/40 px-7 py-4">{item.copy.reserve}</Link><a href="https://www.google.com/maps/search/?api=1&query=Can+Evim+Şile" className="border border-white/40 px-7 py-4">{item.copy.route}</a></div></section>
  </main>;
}
