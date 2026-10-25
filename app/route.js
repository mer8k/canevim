import home from "./generated/home-html.json";

// The landing page is a static document generated from the shared JSX sources.
// Detail pages retain the App Router; small native scripts handle landing-page UI.
export const dynamic = "force-static";
export function GET() {
  return new Response(home.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
