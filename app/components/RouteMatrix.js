import { directionsUrl, ROUTE_ADDRESS, routeGroups, routeOrigins } from "../growth-routes";

export default function RouteMatrix({ id = "yol-tarifi", compact = false }) {
  return (
    <section className="route-matrix" id={id} aria-labelledby={`${id}-heading`}>
      <div className="route-matrix__intro">
        <p className="route-matrix__eyebrow">Üvezli'de buluşalım</p>
        <h2 id={`${id}-heading`}>Şile yolu üzerinde kahvaltıya hangi noktadan geliyorsunuz?</h2>
        <p>Can Evim'in adresi <strong>{ROUTE_ADDRESS}</strong>. Şile merkez, Ağva ve sahil mahallelerinden ya da İstanbul'dan çıkış noktanızı seçin; rota doğrudan Üvezli'deki konumumuza açılsın.</p>
        <div className="route-matrix__actions">
          <a href={directionsUrl()} target="_blank" rel="noopener noreferrer" data-event="directions_click" data-origin="current_location" data-location="route_matrix">Bulunduğum yerden yol tarifi al <span aria-hidden="true">↗</span></a>
          <a href="tel:+905374975062" data-event="phone_click" data-location="route_matrix">Konum için ara: 0537 497 50 62</a>
        </div>
        <p className="route-matrix__notice">Kaç km, kaç dakika? Mesafe ve süreyi Google Haritalar, seçtiğiniz başlangıç adresi ve canlı trafikle hesaplar. Otoyol veya Kuzey Marmara seçenekleri ile ücretli yoldan kaçınma tercihinizi rota ekranında karşılaştırabilirsiniz.</p>
      </div>
      <div className="route-matrix__groups">
        {routeGroups.map((group, index) => (
          <details key={group} className="route-matrix__group" open={!compact && index === 0}>
            <summary><span>{group}</span><span className="route-matrix__count">{routeOrigins.filter((route) => route.group === group).length} başlangıç <span aria-hidden="true">+</span></span></summary>
            <div className="route-matrix__grid">
              {routeOrigins.filter((route) => route.group === group).map((route) => (
                <article key={route.id} className="route-matrix__card" id={`rota-${route.id}`}>
                  <h3>{route.name} → Can Evim</h3>
                  <p>{route.context}</p>
                  <dl>
                    <div><dt>Mesafe</dt><dd>Haritalar'da canlı hesaplanır</dd></div>
                    <div><dt>Süre</dt><dd>Güncel trafikle hesaplanır</dd></div>
                  </dl>
                  <a href={route.directions} target="_blank" rel="noopener noreferrer" data-event="directions_click" data-origin={route.name} data-growth-location="route_matrix" data-location="route_matrix" data-route-id={route.id} aria-label={`${route.name} başlangıcından Can Evim Şile'ye araçla yol tarifi al`}>{route.name} rotasını aç <span aria-hidden="true">↗</span></a>
                </article>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
