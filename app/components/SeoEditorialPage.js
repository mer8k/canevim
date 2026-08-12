import Image from "next/image";
import Link from "next/link";

export default function SeoEditorialPage({ item }) {
  return (
    <main className="min-h-screen bg-[#fcfaf7] text-[#222]">
      <section className="relative min-h-[72vh] flex items-end overflow-hidden">
        <Image src={item.image} alt={item.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/25" />
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 pb-16 md:pb-24 text-white">
          <nav aria-label="İçerik yolu" className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/75 mb-7">
            <Link href="/">Can Evim Şile</Link><span className="mx-3">/</span><Link href="/menu">Menü</Link><span className="mx-3">/</span><span>{item.menuName}</span>
          </nav>
          <p className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase mb-5">Üvezli · Şile</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[86px] leading-[1.05] max-w-4xl">{item.name}</h1>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-28 grid md:grid-cols-[1.35fr_.65fr] gap-12 md:gap-20">
        <div>
          <p className="font-serif text-2xl md:text-4xl leading-relaxed text-[#333]">{item.intro}</p>
          <p className="font-serif text-base md:text-lg leading-[1.9] text-[#555] mt-8">Can Evim Şile, Üvezli Mahallesi'ndeki doğa içindeki atmosferinde kahvaltıdan ana yemeğe uzanan menüsünü her gün 08:00–23:00 arasında sunar. Güncel içerik ve diğer seçenekler için menümüzdeki ilgili bölümü inceleyebilirsiniz.</p>
          <Link href={`/menu#${item.anchor}`} className="inline-flex mt-10 border-b border-[#222] pb-2 font-sans text-sm tracking-[0.12em] uppercase">{item.menuName} menüsüne git →</Link>
        </div>
        <aside className="border-l border-[#d8d2c8] pl-8 md:pl-12">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-[#9a793d] mb-7">Can Evim deneyimi</p>
          <ul className="space-y-5 font-serif text-lg text-[#444]">{item.highlights.map((highlight) => <li key={highlight} className="border-b border-[#e5e3dc] pb-5">{highlight}</li>)}</ul>
        </aside>
      </section>

      <section className="bg-[#161615] text-white px-6 py-16 md:py-24 text-center">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-white/55 mb-5">Sofranızı planlayın</p>
        <h2 className="font-serif text-4xl md:text-6xl mb-9">Doğada sakin bir mola</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/#rezervasyon" className="border border-white/40 px-7 py-4 font-sans text-sm tracking-wider">Rezervasyon</Link>
          <a href="https://www.google.com/maps/search/?api=1&query=Can+Evim+Şile" target="_blank" rel="noreferrer" className="border border-white/40 px-7 py-4 font-sans text-sm tracking-wider">Yol Tarifi</a>
        </div>
      </section>
    </main>
  );
}
