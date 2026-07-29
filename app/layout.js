import "./globals.css";
import Header from "./Header";

export const metadata = {
  title: "Can Evim Şile — Doğada Serpme Köy Kahvaltısı & Restoran",
  description: "Alemdağ Şile Yolu üzerinde taptaze menemenli serpme köy kahvaltısı, el açması gözlemeler ve doğa içinde huzurlu ortam.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        {children}
        <footer className="footer">
          <div className="container">
            <div className="footer-inner">
              <div className="footer-brand">
                <span className="footer-title">CAN EVİM.</span>
                <p>&copy; 2026 Can Evim Şile. Tüm hakları saklıdır.</p>
              </div>
              <ul className="footer-links">
                <li><a href="/#anasayfa">Anasayfa</a></li>
                <li><a href="/#hakkimizda">Hakkımızda</a></li>
                <li><a href="/menu">Menü</a></li>
                <li><a href="/#galeri">Galeri</a></li>
                <li><a href="/#iletisim">İletişim</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
