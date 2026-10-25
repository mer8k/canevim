const breakfastProducts = [
  "Peynir tabağı, yeşil / siyah / çizik zeytin ve acuka",
  "Çilek reçeli, portakal reçeli, tereyağı ve bal-kaymak",
  "Çeri domates ve salatalık",
  "Pişi, muska börek, sahanda yumurta ve menemen",
  "Menüde serpme kahvaltıyla sunulan sınırsız çay",
];

const conceptDetails = {
  breakfast: { title: "serpme kahvaltı", products: breakfastProducts },
  gozleme: { title: "gözleme & çay", products: ["Patatesli gözleme", "Kaşarlı veya beyaz peynirli gözleme", "Pazılı gözleme", "Kıymalı veya sucuklu gözleme", "Çay, fincan çay veya termos çay (menüden ayrı tercih)"] },
  breakfast_grill: { title: "kahvaltı + ızgara", products: ["Serpme kahvaltı: peynir, zeytin, acuka, reçeller, bal-kaymak ve sebzeler", "Kahvaltı sıcakları: pişi, muska börek, sahanda yumurta ve menemen", "Menüde serpme kahvaltıyla sunulan sınırsız çay", "Ayrı öğün tercihi: ızgara köfte, ızgara sucuk veya piliç ızgara", "Menüde ızgara yanında belirtilen pilav, domates ve biber"] },
};

const initialMessage = "Merhaba Can Evim Şile, güncel menü, fiyat, kapsam ve masa uygunluğu bilgisi alabilir miyiz? Rezervasyonun işletme onayıyla kesinleştiğini biliyoruz.";

/** Server-rendered, progressively enhanced by /growth.js. Use once per page. */
export default function BreakfastPlanner({ id = "kahvalti-planla", initialConcept = "breakfast" }) {
  const concept = ["breakfast", "gozleme", "breakfast_grill"].includes(initialConcept) ? initialConcept : "breakfast";
  return (
    <section key={`${id}-${concept}`} id={id} className="ce-planner" aria-labelledby={`${id}-title`} data-growth-location="planner">
      <div className="ce-planner__intro">
        <p className="ce-eyebrow">Masayı birlikte planlayalım</p>
        <h2 id={`${id}-title`}>Kahvaltı &amp; gözleme planlayıcı</h2>
        <p>Kişi sayısını ve menü tercihlerinizi seçin. Planınızı WhatsApp’tan iletip güncel fiyat ve masa uygunluğunu sorun.</p>
      </div>
      <div className="ce-planner__layout">
        <form className="ce-planner__form" data-breakfast-planner="" data-initial-concept={concept} action="https://wa.me/905374975062" method="get" target="_blank" rel="noopener noreferrer">
          <input type="hidden" name="text" data-planner-message="" defaultValue={initialMessage} />
          <fieldset>
            <legend><span>01</span> Kimlerle geliyorsunuz?</legend>
            <div className="ce-choice-grid">
              <label className="ce-choice"><input type="radio" name="party" value="couple" defaultChecked /><span>2 kişi</span></label>
              <label className="ce-choice"><input type="radio" name="party" value="family" /><span>Aile</span></label>
              <label className="ce-choice"><input type="radio" name="party" value="group" /><span>Kalabalık grup</span></label>
            </div>
            <label className="ce-field" htmlFor={`${id}-guests`}>
              <span>Toplam kişi sayısı</span>
              <input id={`${id}-guests`} name="guests" type="number" min="1" max="100" step="1" defaultValue="2" inputMode="numeric" required />
            </label>
          </fieldset>
          <fieldset>
            <legend><span>02</span> Sofranızın odağı</legend>
            <div className="ce-concepts">
              <label className="ce-choice ce-choice--wide"><input type="radio" name="concept" value="breakfast" defaultChecked={concept === "breakfast"} /><span>Serpme köy kahvaltısı<small>Menüdeki kahvaltı ve sıcaklar</small></span></label>
              <label className="ce-choice ce-choice--wide"><input type="radio" name="concept" value="gozleme" defaultChecked={concept === "gozleme"} /><span>Gözleme &amp; çay<small>Altı gözleme çeşidinden seçiminiz</small></span></label>
              <label className="ce-choice ce-choice--wide"><input type="radio" name="concept" value="breakfast_grill" defaultChecked={concept === "breakfast_grill"} /><span>Kahvaltı + ızgara<small>Ayrı öğünler için menü tercihleri</small></span></label>
            </div>
          </fieldset>
          <fieldset>
            <legend><span>03</span> İşletmeye sorulacaklar</legend>
            <label className="ce-check"><input type="checkbox" name="child_area" /><span>Çocuk alanı hakkında bilgi istiyorum</span></label>
            <label className="ce-check"><input type="checkbox" name="garden" /><span>Bahçede masa uygunluğunu sormak istiyorum</span></label>
            <p className="ce-field-help">Bu tercihler uygunluk veya hizmet garantisi vermez; işletmeden teyit istenir.</p>
          </fieldset>
          <label className="ce-field" htmlFor={`${id}-budget`}>
            <span>Kendi kişi başı bütçeniz (isteğe bağlı, ₺)</span>
            <input id={`${id}-budget`} name="budget" type="number" min="0" max="100000" step="1" placeholder="Örn. kendi ayırdığınız tutar" inputMode="numeric" aria-describedby={`${id}-budget-help`} />
          </label>
          <p className="ce-field-help" id={`${id}-budget-help`}>Yazdığınız tutar yalnızca kişisel bütçe hesabınızdır; Can Evim fiyatı veya teklifi değildir.</p>
          <button className="ce-button ce-button--primary" type="submit">Planımı WhatsApp’tan sor <span aria-hidden="true">↗</span></button>
          <p className="ce-field-help">WhatsApp yeni sekmede açılır. Talebiniz, işletmenin yanıtı ve onayıyla kesinleşir.</p>
          <noscript><p className="ce-field-help">Tercihlere göre otomatik özet için JavaScript gerekir. WhatsApp açıldığında kişi sayısını ve seçimlerinizi mesajınıza ekleyin.</p></noscript>
        </form>
        <aside className="ce-planner__summary" aria-labelledby={`${id}-summary`}>
          <p className="ce-eyebrow">Menüden ilham alan planınız</p>
          <h3 id={`${id}-summary`} data-planner-heading="">{`2 kişilik ${conceptDetails[concept].title}`}</h3>
          <p className="ce-planner__summary-note">Aşağıdaki liste menü seçeneklerini gösterir; sipariş, sabit paket veya tüm ürünlerin birlikte sunulacağı taahhüdü değildir.</p>
          <ul className="ce-product-list" data-planner-products="">{conceptDetails[concept].products.map((product) => <li key={product}>{product}</li>)}</ul>
          <p className="ce-planner__extras" data-planner-extras="">Özel bir uygunluk sorusu seçilmedi.</p>
          <div className="ce-planner__budget" role="status" aria-live="polite" aria-atomic="true" data-planner-budget="">Güncel fiyat için teklif isteyin.</div>
          <a className="ce-button ce-button--outline" href="https://www.google.com/maps?cid=2837137820972948771" target="_blank" rel="noopener noreferrer">Haritada konumu aç <span aria-hidden="true">↗</span></a>
          <a className="ce-text-link" href="/menu">Menünün tamamını inceleyin →</a>
        </aside>
      </div>
    </section>
  );
}
