import "./globals.css";
import Header from "./Header";

export const metadata = {
  title: "Can Evim Şile — Doğada Serpme Köy Kahvaltısı & Restoran",
  description: "Can Evim Şile Köy Kahvaltısı ve Restoran resmi web sitesi.",
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
        <Header />
        {children}
      </body>
    </html>
  );
}
