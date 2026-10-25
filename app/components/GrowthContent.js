import Image from "./StaticImage";
import Link from "./SiteLink";
import { CONTACT, experiences, homeSections, intentClusters } from "../growth-content";
import { MENU_SECTIONS } from "../growth-schema";

export function QuickGuide({ home = false, menu = false }) {
  return <nav className="growth-jumps" aria-label="Hızlı sayfa içi rehber">
    <a href={menu ? "#kahvalti" : "#menu-icerigi"}>Menü içeriği</a>
    <a href="#fiyat-kapsam">2026 fiyat / kapsam</a>
    <a href={home ? "#gozleme-cesitleri" : menu ? "#gozleme" : "/sile-gozleme#menu-icerigi"}>Gözleme çeşitleri</a>
    <a href={home ? "#rota-matrisi" : "/ulasim"}>Yol tarifi <span aria-hidden="true">↗</span></a>
  </nav>;
}

export function ComparisonTable({ comparison, id = "fiyat-kapsam" }) {
  return <section id={id} className="growth-comparison">
    <p className="growth-eyebrow">İçeriği bilerek seçin</p>
    <h2>{comparison.caption}</h2>
    <div className="growth-table-scroll" role="region" aria-label={comparison.caption} tabIndex="0">
      <table><caption>{comparison.caption}</caption>
        <thead><tr>{comparison.headers.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
        <tbody>{comparison.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <p className="growth-note">Menü içeriği 24 Ekim 2026 tarihinde kontrol edildi. Yayımlanmış sayısal tarife bulunmadığı için fiyat, porsiyon ve günün uygunluğu işletmeden öğrenilir.</p>
    <a className="growth-cta" href={`${CONTACT.whatsapp}?text=${encodeURIComponent("Merhaba Can Evim Şile, kişi sayımıza ve menü tercihimize göre güncel fiyat ve kapsam bilgisi alabilir miyiz?")}`} target="_blank" rel="noopener noreferrer">Güncel menü ve fiyatı sor <span aria-hidden="true">↗</span></a>
  </section>;
}

export function ExperienceCards() {
  return <section className="growth-experiences" aria-labelledby="deneyimler-title">
    <div className="growth-heading"><p className="growth-eyebrow">Bugün nasıl bir masa?</p><h2 id="deneyimler-title">Bir sabah, bir mola, bir buluşma.</h2><p>Menü içeriğinden bahçe masasına, aradığınız deneyimin ayrıntılarını inceleyin.</p></div>
    <div className="growth-card-grid">{experiences.slice(0, 4).map((item, index) => <Link prefetch={false} href={`/${item.slug}`} key={item.slug} className="growth-card">
      <div className="growth-card-image"><Image loading="lazy" decoding="async" fetchPriority="low" src={item.cardImage || item.image} unoptimized={Boolean(item.cardImage)} alt={item.label} fill sizes="(min-width: 1000px) 25vw, (min-width: 600px) 50vw, 100vw" quality={55} className="object-cover" /></div>
      <div className="growth-card-copy"><span>0{index + 1}</span><h3>{item.label}</h3><p>{item.eyebrow}</p><b aria-hidden="true">↗</b></div>
    </Link>)}</div>
    <nav className="growth-guide-links" aria-label="Diğer ziyaret rehberleri">{experiences.slice(4).map(({ slug, label }) => <Link key={slug} href={`/${slug}`}>{label} →</Link>)}</nav>
  </section>;
}

export function FullMenuSummary() {
  return <section className="growth-menu-summary" id="menu-ozeti" aria-label="Mevcut menünün tamamı">
    <details><summary>Menünün tamamını hızlıca inceleyin <span>54 ürün · 9 bölüm</span></summary>
      <div className="growth-menu-grid">{MENU_SECTIONS.map((section) => <div key={section.id}><h3>{section.name}</h3><ul>{section.items.map((item) => <li key={typeof item === "string" ? item : item.name}>{typeof item === "string" ? item : <>{item.name}<small>{item.description}</small></>}</li>)}</ul></div>)}</div>
    </details>
    <p className="growth-note">Ürün listesi mevcut menüye dayanır; günün bulunurluğu ve fiyatı için işletmeyle görüşün. <Link prefetch={false} href="/menu">Fotoğraflı menüyü açın →</Link></p>
  </section>;
}

export function FaqSection({ faqs }) {
  return <section className="growth-faq" id="sik-sorulanlar" aria-labelledby="faq-heading"><p className="growth-eyebrow">Yola çıkmadan</p><h2 id="faq-heading">Sık sorulanlar</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</section>;
}

export function IntentMatrix() {
  return <section id="ziyaret-secimi" className="growth-intents">
    <p className="growth-eyebrow">Aradığınız bilgiye doğrudan gidin</p><h2>Menü ve ziyaret seçeneklerini karşılaştırın</h2>
    <div className="growth-table-scroll" role="region" aria-label="Menü ve ziyaret karşılaştırması" tabIndex="0"><table><caption>18 arama ve ziyaret ihtiyacı için doğru bilgi</caption><thead><tr><th scope="col">Aradığınız</th><th scope="col">İçerik</th><th scope="col">Karşılaştırma notu</th></tr></thead><tbody>{intentClusters.map(([label, href, content, note]) => <tr key={label}><th scope="row"><Link prefetch={false} href={href}>{label}</Link></th><td>{content}</td><td>{note}</td></tr>)}</tbody></table></div>
  </section>;
}

export function HomeGuide() {
  return <section className="growth-home-guide" aria-labelledby="kahvalti-rehberi-title">
    <div className="growth-heading"><p className="growth-eyebrow">Üvezli · Şile yolu</p><h2 id="kahvalti-rehberi-title">Kahvaltıdan yol tarifine, masanızın bütün ayrıntıları.</h2></div>
    <div className="growth-article-grid">{homeSections.map(([id, title, text]) => <section id={id} key={id}><h3>{title}</h3><p>{text}</p>{id === "koy-sofrasi" && <Link prefetch={false} href="/sile-serpme-kahvalti">Şile serpme kahvaltı içeriği →</Link>}{id === "gozleme-cesitleri" && <Link prefetch={false} href="/sile-gozleme">Şile gözleme çeşitleri →</Link>}{id === "bahcede-kahvalti" && <Link prefetch={false} href="/sile-doga-kahvaltisi">Aile ve bahçe ziyaretini planlayın →</Link>}{id === "ogle-aksam" && <Link prefetch={false} href="/sile-restoran">Şile restoran menüsü →</Link>}{id === "yol-tarifi" && <Link prefetch={false} href="/ulasim">48 çıkış noktası için rota →</Link>}</section>)}</div>
  </section>;
}

export function VisitFooter() {
  return <footer className="growth-footer" id="iletisim"><div><span className="growth-brand">canevim</span><h2>Üvezli'de buluşalım.</h2><p>{CONTACT.address}</p><p>Her gün 08.00–23.00 · Mutfak ve masa uygunluğunu ziyaret öncesi sorun.</p></div><div className="growth-footer-actions"><a href={`tel:${CONTACT.phone}`}>{CONTACT.displayPhone}</a><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp'tan masa sor ↗</a><a href={CONTACT.maps} target="_blank" rel="noopener noreferrer">Yol tarifini aç ↗</a></div><nav aria-label="Alt menü"><Link prefetch={false} href="/">Şile kahvaltı</Link><Link prefetch={false} href="/sile-serpme-kahvalti">Şile serpme kahvaltı</Link><Link prefetch={false} href="/sile-gozleme">Şile gözleme</Link><Link prefetch={false} href="/sile-doga-kahvaltisi">Doğa & aile</Link><Link prefetch={false} href="/sile-restoran">Restoran</Link><Link prefetch={false} href="/menu">Menü</Link><Link prefetch={false} href="/ulasim">Ulaşım</Link></nav><small>© 2026 Can Evim Şile</small></footer>;
}
