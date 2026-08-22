import "./globals.css";
import Header from "./Header";

export const metadata = {
  metadataBase: new URL("https://www.canevimsile.com"),
  title: "Can Evim Şile | Doğada Serpme Kahvaltı & Restoran",
  description: "Şile Üvezli'de doğayla iç içe serpme kahvaltı ve restoran. Güncel menüyü inceleyin, yol tarifi alın ve rezervasyon yapın.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Can Evim Şile",
    title: "Can Evim Şile | Doğada Serpme Kahvaltı & Restoran",
    description: "Şile Üvezli'de doğayla iç içe serpme köy kahvaltısı ve restoran deneyimi.",
    images: [{ url: "/images/heromasaustu.JPG", width: 1600, height: 1067, alt: "Can Evim Şile" }],
  },
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://www.canevimsile.com/#restaurant",
  name: "Can Evim Şile",
  url: "https://www.canevimsile.com/",
  telephone: "+90 537 497 50 62",
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
  sameAs: ["https://instagram.com/canevimsile"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400&display=swap" rel="stylesheet" />
      </head>
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
