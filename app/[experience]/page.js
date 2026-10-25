import Image from "../components/StaticImage";
import Link from "../components/SiteLink";
import { notFound } from "next/navigation";
import { experiences, pageMetadata } from "../growth-content";
import { buildPageGraph, safeJsonLd } from "../growth-schema";
import LazyInteractive from "../components/LazyInteractive";
import { QuickGuide, ComparisonTable, FaqSection, FullMenuSummary, VisitFooter } from "../components/GrowthContent";

export const dynamicParams = false;
export function generateStaticParams() { return experiences.map(({ slug }) => ({ experience: slug })); }
export async function generateMetadata({ params }) {
  const { experience } = await params;
  const item = experiences.find(({ slug }) => slug === experience);
  return item ? pageMetadata(`/${item.slug}`, item.title, item.description) : {};
}

export default async function ExperiencePage({ params }) {
  const { experience } = await params;
  const item = experiences.find(({ slug }) => slug === experience);
  if (!item) notFound();
  const graph = buildPageGraph({ path: `/${item.slug}`, title: item.h1, description: item.description, faqs: item.faqs });
  return <>
    <main id="main-content" className="growth-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(graph) }} />
      <header className="growth-hero"><Image src={item.image} unoptimized={item.image.startsWith("/performance/")} alt={item.label} fill sizes="100vw" quality={65} loading="eager" fetchPriority="high" className="object-cover" /><div className="growth-hero-shade" /><div className="growth-hero-copy"><nav aria-label="İçerik yolu"><Link prefetch={false} href="/">Şile kahvaltı</Link><span aria-hidden="true"> / </span><span>{item.label}</span></nav><p className="growth-eyebrow">{item.eyebrow}</p><h1>{item.h1}</h1></div></header>
      <QuickGuide />
      <article className="growth-article">
        <div className="growth-article-intro" id="menu-icerigi"><p>{item.intro}</p><a href={item.planner ? "#kahvalti-planla" : "#fiyat-kapsam"} className="growth-text-link">{item.planner ? "Masanızı birlikte planlayın ↓" : "Menü kapsamını karşılaştırın ↓"}</a></div>
        <nav className="growth-section-nav" aria-label="Bu rehberde">{item.sections.map(([id, title]) => <a href={`#${id}`} key={id}>{title}</a>)}</nav>
        <div className="growth-article-grid">{item.sections.map(([id, title, text]) => <section key={id} id={id}><h2>{title}</h2><p>{text}</p></section>)}</div>
        <ComparisonTable comparison={item.comparison} />
        <FaqSection faqs={item.faqs} />
        <aside className="growth-related"><p>Bir sonraki adımınız</p><Link prefetch={false} href="/">Şile kahvaltı: Can Evim'i tanıyın →</Link>{experiences.filter(({ slug }) => slug !== item.slug).map(({ slug, label }) => <Link prefetch={false} href={`/${slug}`} key={slug}>{label} →</Link>)}<Link prefetch={false} href="/ulasim">Ulaşım ve canlı rota →</Link></aside>
      </article>
      {item.planner && <LazyInteractive key={`${item.slug}-${item.planner}`} module={`planner-${item.planner}`} />}
      <FullMenuSummary />
    </main><VisitFooter />
  </>;
}
