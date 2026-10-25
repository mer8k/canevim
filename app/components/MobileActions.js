export default function MobileActions() {
  return (
    <>
      <nav className="ce-mobile-actions" aria-label="Hızlı iletişim" data-growth-location="mobile_bar">
        <a href="https://www.google.com/maps?cid=2837137820972948771" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span>Yol tarifi</a>
        <a href="/menu"><span aria-hidden="true">☰</span>Menü</a>
        <a href="https://wa.me/905374975062?text=Merhaba%20Can%20Evim%20%C5%9Eile%2C%20g%C3%BCncel%20men%C3%BC%2C%20fiyat%20ve%20masa%20uygunlu%C4%9Fu%20bilgisi%20alabilir%20miyim%3F" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">◌</span>WhatsApp</a>
      </nav>
      <div className="ce-privacy" data-growth-consent="" hidden>
        <p data-consent-copy="">İsteğe bağlı ölçüm, menü ve iletişim bağlantılarının kullanımını anlamamıza yardımcı olur. Adınız, mesajınız ve rezervasyon tarihiniz ölçüme eklenmez.</p>
        <div className="ce-privacy__buttons">
          <button type="button" data-consent-choice="granted">Ölçüme izin ver</button>
          <button type="button" data-consent-choice="denied">Yalnızca gerekli</button>
        </div>
      </div>
      <button type="button" className="ce-privacy-settings" data-consent-settings="" hidden>Ölçüm tercihi</button>
    </>
  );
}
