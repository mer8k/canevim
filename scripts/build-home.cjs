/* Build a static landing document from the same components as the detail pages. */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "..");
process.chdir(root);

async function build() {
  const swc = require("next/dist/build/swc");
  await swc.loadBindings();
  const previousJS = Module._extensions[".js"];
  const previousCSS = Module._extensions[".css"];
  const appRoot = path.join(root, "app") + path.sep;
  Module._extensions[".js"] = function (mod, file) {
    if (!file.startsWith(appRoot)) return previousJS(mod, file);
    const result = swc.transformSync(fs.readFileSync(file, "utf8"), {
      filename: file,
      jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
      module: { type: "commonjs" },
    });
    mod._compile(result.code, file);
  };
  Module._extensions[".css"] = function () {};
  try {
    const React = require("react");
    const { renderToStaticMarkup } = require("react-dom/server");
    const { imageConfigDefault } = require("next/dist/shared/lib/image-config");
    imageConfigDefault.qualities = [55, 65, 75];
    const Home = require("../app/home-content.js").default;
    const Header = require("../app/Header.js").default;
    const MobileActions = require("../app/components/MobileActions.js").default;
    const { metadata } = require("../app/layout.js");
    const postcss = require("postcss");
    const tailwind = require("@tailwindcss/postcss");
    const { optimize } = require("@tailwindcss/node");
    const cssPaths = ["globals.css", "local-fonts-subset.css", "growth-content.css", "mobile-actions.css", "growth-performance.css"];
    const cssSource = cssPaths.map(file => fs.readFileSync(path.join(appRoot, file), "utf8")).join("\n");
    const processed = await postcss([tailwind({ base: root })]).process(cssSource, { from: path.join(appRoot, "globals.css") });
    let css = optimize(processed.css, { minify: true }).code;
    // Keep the brand glyphs exact; use the device's serif face for the landing
    // document so its first screen needs no font requests or large font embeds.
    const wordmark = fs.readFileSync(path.join(root, "public/performance/fonts/canevim-wordmark.woff2")).toString("base64");
    css = css.replaceAll("/performance/fonts/canevim-wordmark.woff2", "data:font/woff2;base64," + wordmark);
    css += 'body[data-static-home="true"]{--font-serif:Georgia,"Times New Roman",serif}';
    const h = React.createElement;
    const origin = metadata.metadataBase.origin;
    const socialImage = origin + metadata.openGraph.images[0].url;
    // One small WebP avoids a round trip for the narrow-screen LCP image.
    // Larger screens retain the responsive external image sources.
    const mobileHeroSrc = "data:image/webp;base64," + fs.readFileSync(path.join(root, "public/performance/hero/home-mobile-480-fast.webp")).toString("base64");
    // Include the entire overlay navigation, not only the initially visible
    // header: it must remain usable while the complete sheet is still loading.
    const headerMarkup = renderToStaticMarkup(h(Header));
    const heroMarkup = renderToStaticMarkup(h(Home, { mobileHeroSrc })).match(/<section class="home-hero[\s\S]*?<\/section>/)?.[0] || "";
    if (!heroMarkup) throw new Error("First-screen hero markup was not found.");
    const criticalMarkup = headerMarkup + heroMarkup + renderToStaticMarkup(h(MobileActions)) + 'class="skip-link"';
    const classes = new Set([...criticalMarkup.matchAll(/\bclass="([^"]+)"/g)].flatMap(match => match[1].split(/\s+/)));
    classes.add("growth-table-scroll");
    const critical = postcss.parse(css);
    critical.walkRules(rule => {
      // Retain the existing containment and its focus/anchor/print exceptions
      // before the complete stylesheet arrives, within their original at-rules.
      if (rule.nodes.some(node => node.type === "decl" && /^(content-visibility|contain-intrinsic-)/.test(node.prop))) return;
      const selectors = rule.selectors.filter(selector => {
        const required = [...selector.matchAll(/\.((?:\\.|[\w-])+)/g)].map(match => match[1].replace(/\\(.)/g, "$1"));
        return !required.length || required.every(name => classes.has(name));
      });
      if (selectors.length) rule.selectors = selectors;
      else rule.remove();
    });
    critical.walkAtRules(rule => { if (rule.nodes && !rule.nodes.length) rule.remove(); });
    const criticalCSS = critical.toString() + 'html,body{max-width:100%;overflow-x:clip}#site-menu[aria-hidden="true"]{visibility:hidden;pointer-events:none}';
    const stylesheet = `home-${createHash("sha256").update(css).digest("hex").slice(0, 16)}.css`;
    const styleDir = path.join(root, "public/performance/ui");
    fs.mkdirSync(styleDir, { recursive: true });
    fs.writeFileSync(path.join(styleDir, stylesheet), css);
    const styleUrl = "/performance/ui/" + stylesheet;
    const meta = (name, content) => h("meta", { name, content });
    const og = (property, content) => h("meta", { property, content });
    const html = "<!DOCTYPE html>" + renderToStaticMarkup(h("html", { lang: "tr" },
      h("head", null,
        h("meta", { charSet: "utf-8" }), meta("viewport", "width=device-width, initial-scale=1"),
        h("title", null, metadata.title), meta("description", metadata.description),
        h("link", { rel: "canonical", href: origin + "/" }),
        og("og:type", "website"), og("og:locale", "tr_TR"), og("og:site_name", metadata.openGraph.siteName),
        og("og:title", metadata.title), og("og:description", metadata.description), og("og:url", origin + "/"),
        og("og:image", socialImage), og("og:image:width", "1200"), og("og:image:height", "630"),
        meta("twitter:card", "summary_large_image"), meta("twitter:title", metadata.title), meta("twitter:description", metadata.description), meta("twitter:image", socialImage),
        h("link", { rel: "icon", href: "/icon.svg", type: "image/svg+xml" }),
        h("link", { rel: "apple-touch-icon", href: "/apple-icon.png" }),
        h("style", { "data-home-styles": "critical", dangerouslySetInnerHTML: { __html: criticalCSS.replace(/<\/style/gi, "<\\/style") } }),
        h("link", { rel: "stylesheet", href: styleUrl, media: "print", "data-deferred-styles": "" }),
        h("noscript", null, h("link", { rel: "stylesheet", href: styleUrl }))
      ),
      h("body", { "data-static-home": "true" },
        h("a", { href: "#main-content", className: "skip-link" }, "İçeriğe geç"),
        h(Header), h(Home, { mobileHeroSrc }), h(MobileActions),
        h("script", { defer: true, src: "/home-ui.js" }),
        h("script", { defer: true, src: "/growth-loader.js", "data-gtm-id": process.env.NEXT_PUBLIC_GTM_ID || "", "data-ga4-id": process.env.NEXT_PUBLIC_GA4_ID || "" })
      )
    ));
    const target = path.join(appRoot, "generated/home-html.json");
    const output = JSON.stringify({ html }) + "\n";
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== output) fs.writeFileSync(target, output);
    console.log(`Static landing: ${Buffer.byteLength(html)} HTML bytes; CSS ${Buffer.byteLength(criticalCSS)} critical / ${Buffer.byteLength(css)} complete; system serif and embedded 1KB wordmark; no framework hydration.`);
  } finally {
    Module._extensions[".js"] = previousJS;
    if (previousCSS) Module._extensions[".css"] = previousCSS;
    else delete Module._extensions[".css"];
  }
}
build().catch(error => { console.error(error); process.exitCode = 1; });
