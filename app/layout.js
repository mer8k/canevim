import "./globals.css";
import "./local-fonts-subset.css";
import "./growth-content.css";
import "./mobile-actions.css";
import "./growth-performance.css";
import Header from "./Header";
import Script from "next/script";
import MobileActions from "./components/MobileActions";
import { pageMetadata } from "./growth-content";

export const metadata = {
  metadataBase: new URL("https://www.canevimsile.com"),
  ...pageMetadata("/", "Şile Kahvaltı | Serpme, Gözleme & Menü 2026 — Can Evim", "Şile Üvezli'de bahçede serpme köy kahvaltısı, altı gözleme çeşidi ve restoran menüsü. İçeriği karşılaştırın, masanızı planlayın, canlı yol tarifini açın."),
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preload" href="/performance/fonts/playfair-latin-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/performance/fonts/playfair-tr-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">İçeriğe geç</a>
        <Header />
        {children}
        <MobileActions />
        <Script id="growth-loader" src="/growth-loader.js" strategy="afterInteractive" data-gtm-id={process.env.NEXT_PUBLIC_GTM_ID || ""} data-ga4-id={process.env.NEXT_PUBLIC_GA4_ID || ""} />
      </body>
    </html>
  );
}
