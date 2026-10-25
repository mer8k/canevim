import Link from "../components/SiteLink";
import { pageMetadata, CONTACT } from "../growth-content";
import { buildPageGraph, safeJsonLd } from "../growth-schema";
import RouteMatrix from "../components/RouteMatrix";
import { FullMenuSummary, FaqSection, VisitFooter } from "../components/GrowthContent";

const title = "Şile Yolu Kahvaltı & Yol Tarifi | 48 Rota — Can Evim";
const description = "Can Evim Şile Üvezli adresi ve 48 başlangıç için canlı Google Haritalar rotası. Şile merkez, Ağva, Çekmeköy, Ümraniye, Kadıköy ve Anadolu Yakası ulaşımı.";
export const metadata = pageMetadata("/ulasim", title, description);
const faqs = [
  ["Can Evim Şile nerede?", CONTACT.address],
  ["Şile merkezde veya Ağva'da mı?", "İşletme Üvezli Mahallesi'nde, Alemdağ Şile Yolu No: 193 adresindedir. Şile merkez ve Ağva bağlantıları bu noktalardan Can Evim'e ulaşmak içindir."],
  ["Kaç kilometre ve kaç dakika sürer?", "Gerçek sürüş mesafesi ve süre, başlangıç konumunuz, trafik ve seçilen yola göre Google Haritalar'da canlı hesaplanır. Bu sayfa doğrulanmamış sabit süre yayımlamaz."],
  ["Kuzey Marmara veya Şile Otoyolu kullanılabilir mi?", "Harita, başlangıcınıza göre alternatif güzergahları gösterir. Ücretli yoldan kaçınma tercihinizi ve trafik durumunu Google Haritalar rota ekranında kontrol edin."],
];
export default function DirectionsPage() {
  return <><main id="main-content" className="growth-page">
    <link rel="stylesheet" href="/performance/ui/routes.css" precedence="routes" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildPageGraph({path:"/ulasim",title,description,faqs})) }} />
    <header className="growth-text-hero"><div><nav aria-label="İçerik yolu"><Link prefetch={false} href="/">Şile kahvaltı</Link> / Ulaşım</nav><p className="growth-eyebrow">Can Evim · Üvezli</p><h1>Yolun sonunda, aynı masada.</h1><p>Şile yolunda kahvaltı, gözleme veya restoran molası için doğru konumu açın. 48 çıkış noktası, tek bir varış: Can Evim Şile.</p><a className="growth-cta" href={CONTACT.maps} target="_blank" rel="noopener noreferrer">Bulunduğum yerden yol tarifi ↗</a></div></header>
    <nav className="growth-jumps" aria-label="Rota rehberi"><a href="#sile-rotalari">Şile ve Ağva çevresi</a><a href="#istanbul-rotalari">İstanbul çıkışları</a><a href="#yol-tarifi">48 rota bağlantısı</a><Link prefetch={false} href="/menu">Menüyü gör</Link></nav>
    <article className="growth-article"><div className="growth-article-grid">
      <section id="sile-rotalari"><h2>Şile merkezden, sahilden ve köylerden geliş</h2><p>Şile Merkez, Çavuş, Balibey, Kumbaba, Sofular, Ahmetli, Doğancılı, Sahilköy, İmrenli, Akçakese, Ovacık, Ağva ve Saklıgöl çevresinden çıkışınızı aşağıdaki kartlarda seçin. Şile Feneri sonrasında kahvaltı veya Ağva–Şile arasında bir mola planlıyorsanız varış adresini kontrol edin. İşletme Üvezli'dedir; her kart ilgili noktadan bu adrese araç rotası açar. Bu bölgelerin tamamı işletmenin hemen yanında değildir.</p></section>
      <section id="istanbul-rotalari"><h2>Anadolu Yakası çıkış noktaları</h2><p>Çekmeköy, Ümraniye, Sancaktepe, Beykoz, Ataşehir, Kadıköy, Pendik ve Kartal dahil İstanbul kartları, ilçenin adıyla bir başlangıç önerir. Mahallenizdeki tam adresi rota ekranında değiştirin. Şile Otoyolu, Kuzey Marmara veya yerel yol seçeneklerini harita önerilerine göre karşılaştırın; güzergah, ücretli geçişler ve hafta sonu trafik koşulları süreyi değiştirebilir.</p></section>
      <section><h2>Yakınımdaki kahvaltı için konumdan başlatın</h2><p>Bulunduğunuz yerden yol tarifi bağlantısı başlangıç adresini Google Haritalar'a bırakır. Bu site cihazınızın konumunu istemez veya kaydetmez. Harita uygulaması konum izni sorarsa tercihinizi orada yapabilirsiniz. Haritada mesafe ve tahmini süreyi gördükten sonra kişi sayınızı, geliş saatinizi ve masa isteğinizi işletmeyle paylaşın.</p></section>
      <section><h2>Yola çıkmadan önce masa ve servis bilgisi</h2><p>Adres ve rota ziyaretin yalnızca bir parçasıdır. Otopark düzeni, giriş koşulları, çocuklu masa ihtiyacı ve belirli ürünlerin servis saati için <a href={`tel:${CONTACT.phone}`}>{CONTACT.displayPhone}</a> hattından bilgi alın. Canlı rota trafik bilgisini gösterir; masa ayırmaz. WhatsApp talebiniz de işletmenin yanıtı ve onayıyla kesinleşir.</p></section>
    </div><FaqSection faqs={faqs} /></article>
    <RouteMatrix /><FullMenuSummary />
  </main><VisitFooter /></>;
}
