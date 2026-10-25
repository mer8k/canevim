import home from "./generated/home-html.json";

// The landing page is a static document generated from the shared JSX sources.
// Detail pages retain the App Router; small native scripts handle landing-page UI.
export const dynamic = "force-static";
export function GET() {
  const fonts = ["canevim-wordmark.woff2", "playfair-latin-400.woff2", "playfair-tr-400.woff2"];
  return new Response(home.html, { headers: {
    "Content-Type": "text/html; charset=utf-8",
    Link: fonts.map(file => `</performance/fonts/${file}>; rel=preload; as=font; type="font/woff2"; crossorigin="anonymous"`).join(", "),
  } });
}
