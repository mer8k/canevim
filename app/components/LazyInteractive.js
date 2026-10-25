import { CONTACT } from "../growth-content";

export default function LazyInteractive({ id = "kahvalti-planla", module = "planner-breakfast" }) {
  const routes = module === "routes";
  return <section id={id} className="ce-lazy" data-interactive-src={`/interactive/${module}`} aria-labelledby={`${id}-heading`}>
    <div data-interactive-fallback="">
      <p className="growth-eyebrow">{routes ? "Yola çıkmadan" : "Masayı birlikte planlayalım"}</p>
      <h2 id={`${id}-heading`}>{routes ? "48 başlangıçtan Can Evim'e yol tarifi" : "Kahvaltı & gözleme planlayıcı"}</h2>
      <p>{routes ? "Çıkış noktanızı seçip güncel trafikle rotanızı açın." : "Kişi sayınızı ve menü tercihinizi seçerek WhatsApp talebinizi hazırlayın."}</p>
      <button type="button" className="growth-cta" data-load-interactive="">{routes ? "Rotaları göster" : "Planlayıcıyı aç"}</button>
      <a className="growth-text-link" href={routes ? "/ulasim" : `${CONTACT.whatsapp}?text=${encodeURIComponent("Merhaba, güncel menü, fiyat ve masa uygunluğu bilgisi alabilir miyiz?")}`}>{routes ? "Ulaşım rehberini açın →" : "WhatsApp'tan bilgi alın ↗"}</a>
      <p role="status" data-interactive-status="" />
    </div>
  </section>;
}
