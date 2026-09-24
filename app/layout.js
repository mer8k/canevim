import "./globals.css";
import "./local-fonts-subset.css";
import Header from "./Header";

export const metadata = {
  metadataBase: new URL("https://www.canevimsile.com"),
  title: "Can Evim Şile | Üvezli Kahvaltı ve Restoran",
  description: "Can Evim Şile, Üvezli'de doğa içinde serpme kahvaltı, gözleme, mantı ve yöresel yemekler sunar. Menüyü inceleyin, yol tarifi alın veya rezervasyon yapın.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Can Evim Şile",
    title: "Can Evim Şile | Üvezli Kahvaltı ve Restoran",
    description: "Üvezli'de doğa içinde serpme kahvaltı, gözleme, mantı ve yöresel yemekler. Can Evim Şile'nin menüsünü, konumunu ve rezervasyon bilgilerini inceleyin.",
    images: [{ url: "/performance/social/can-evim-og.jpg", width: 1200, height: 630, alt: "Can Evim Şile" }],
  },
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://www.canevimsile.com/#restaurant",
  name: "Can Evim Şile",
  url: "https://www.canevimsile.com/",
  telephone: "+90 537 497 50 62",
  image: "https://www.canevimsile.com/performance/social/can-evim-og.jpg",
  hasMenu: "https://www.canevimsile.com/menu",
  servesCuisine: ["Türk mutfağı", "Kahvaltı", "Gözleme"],
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.1104673,
    longitude: 29.4258912,
  },
  hasMap: "https://www.google.com/maps?cid=2837137820972948771",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Üvezli, Alemdağ Şile Yolu No: 193",
    postalCode: "34980",
    addressLocality: "Şile",
    addressRegion: "İstanbul",
    addressCountry: "TR",
  },
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "23:00",
  }],
  sameAs: [
    "https://instagram.com/canevimsile",
    "https://www.google.com/maps?cid=2837137820972948771",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema).replace(/</g, "\\u003c") }}
        />
        <Header />
        {children}
      </body>
    </html>
  );
}
