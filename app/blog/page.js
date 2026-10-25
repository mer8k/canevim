import Link from "../components/SiteLink";
import { pageMetadata, experiences } from "../growth-content";

export const metadata = {
  ...pageMetadata("/blog", "Can Evim Ziyaret Rehberleri | Menü, Bahçe & Ulaşım", "Can Evim Şile'de serpme kahvaltı, gözleme, aile ziyareti, restoran ve ulaşım rehberlerini inceleyin."),
  robots: { index: false, follow: true },
};

export default function BlogPage() {
  return <main id="main-content" className="min-h-screen bg-[#fcfaf7] text-[#222] pb-24">
    <header className="bg-[#161615] text-white pt-40 pb-20 px-6"><div className="max-w-[1100px] mx-auto"><p className="font-sans text-xs tracking-[0.3em] uppercase text-[#c39b53] mb-4">Can Evim Günlükleri</p><h1 className="font-serif text-5xl md:text-7xl">Can Evim'den notlar</h1></div></header>
    <div className="max-w-[1100px] mx-auto px-6 pt-16"><p className="font-serif text-xl text-[#555]">Ziyaretinizin ayrıntılarını ilgili rehberde inceleyin.</p><nav className="growth-related" aria-label="Ziyaret rehberleri">{experiences.map(({slug,label})=><Link key={slug} href={`/${slug}`}>{label} →</Link>)}<Link prefetch={false} href="/ulasim">Ulaşım ve yol tarifi →</Link><Link prefetch={false} href="/">Şile kahvaltı: Can Evim →</Link></nav></div>
  </main>;
}
