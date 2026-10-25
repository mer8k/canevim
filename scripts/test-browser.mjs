import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { CONTENT_ROUTES } from "../app/seo-routes.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:/Users/mert/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { minify } = require("next/dist/compiled/terser");
const base = (process.env.TEST_BASE_URL || "http://127.0.0.1:3100").replace(/\/$/, "");
const localOrigin = new URL(base).origin;
const canonicalOrigin = "https://www.canevimsile.com";
const routes = CONTENT_ROUTES.map(({ path }) => path);
const outputDir = process.env.BROWSER_AUDIT_DIR || ".audit/round2";
const outputPath = name => path.join(outputDir, name);
const result = { testedAt: new Date().toISOString(), base, status: "running", canonicalRoutes: routes, expectedViewportCases: routes.length * 4, pages: [], lazy: [], planner: {}, navigation: {}, analytics: {}, screenshots: [], failures: [] };
function check(condition, label, details) { if (!condition) result.failures.push({ label, ...(details === undefined ? {} : { details }) }); return Boolean(condition); }
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
await fs.mkdir(outputDir, { recursive: true });
async function contextFor(width = 1440, options = {}) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 900 : 1000 }, isMobile: width < 768, deviceScaleFactor: 1, reducedMotion: "reduce", ...options });
  await context.addInitScript(() => { window.__opened = []; window.open = url => { window.__opened.push(String(url)); return null; }; });
  return context;
}
async function loadInteractiveSections(page) {
  await page.waitForFunction(() => Boolean(window.CanEvimLoader && typeof window.CanEvimLoader.load === "function"), null, { timeout: 15000 });
  const sources = await page.locator("[data-interactive-src]").evaluateAll(elements => elements.map(element => element.getAttribute("data-interactive-src")));
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.querySelectorAll("[data-interactive-src]")).map(section => window.CanEvimLoader.load(section)));
  });
  if (sources.some(source => source?.includes("planner"))) {
    await page.locator("[data-breakfast-planner]").waitFor();
    await page.waitForFunction(() => Boolean(window.CanEvimGrowth && document.querySelector("[data-breakfast-planner]")?.__growthReady), null, { timeout: 15000 });
  }
  if (sources.some(source => source?.includes("routes"))) await page.locator(".route-matrix").waitFor();
  return sources;
}
async function revealPlanner(page) {
  const placeholder = page.locator('[data-interactive-src*="planner"]').first();
  await placeholder.waitFor({ state: "attached" });
  await placeholder.scrollIntoViewIfNeeded();
  await page.locator("[data-breakfast-planner]").waitFor();
  await page.waitForFunction(() => Boolean(window.CanEvimGrowth && document.querySelector("[data-breakfast-planner]")?.__growthReady), null, { timeout: 15000 });
}
async function pageReady(page, route, { checkInitialLazy = false } = {}) {
  const response = await page.goto(base + route, { waitUntil: "load", timeout: 45000 });
  await page.locator("h1").waitFor();
  await page.waitForFunction(() => Boolean(window.CanEvimLoader), null, { timeout: 15000 });
  if (checkInitialLazy) {
    const initial = await page.evaluate(() => ({
      runtimePresent: Boolean(window.CanEvimGrowth),
      runtimeRequested: performance.getEntriesByType("resource").some(entry => new URL(entry.name).pathname === "/growth.js"),
      plannerPresent: Boolean(document.querySelector("[data-breakfast-planner]")),
      staticHome: document.body.dataset.staticHome === "true",
      frameworkScriptRequests: performance.getEntriesByType("resource").map(entry => entry.name).filter(url => /\/_next\/.*\.js(?:\?|$)/.test(new URL(url).pathname)),
      frameworkScriptElements: Array.from(document.scripts).map(script => script.getAttribute("src") || "").filter(url => /\/_next\/.*\.js(?:\?|$)/.test(url)),
      nativeUiRequested: performance.getEntriesByType("resource").some(entry => new URL(entry.name).pathname === "/home-ui.js"),
      deferredStyles: Array.from(document.querySelectorAll("link[data-deferred-styles]")).map(link => ({ href: link.getAttribute("href"), media: link.media, loaded: Boolean(link.sheet), ready: link.getAttribute("data-style-ready") })),
      placeholders: Array.from(document.querySelectorAll("[data-interactive-src]")).map(section => ({ id: section.id, source: section.getAttribute("data-interactive-src"), textLength: section.textContent.trim().length })),
      scrollY,
    }));
    check(!initial.runtimePresent && !initial.runtimeRequested, `Home @ ${page.viewportSize().width}: growth runtime absent before scroll`, initial);
    check(!initial.plannerPresent, `Home @ ${page.viewportSize().width}: planner fragment is lazy`, initial);
    check(initial.staticHome && initial.frameworkScriptRequests.length === 0 && initial.frameworkScriptElements.length === 0, `Home @ ${page.viewportSize().width}: genuine static document with zero framework scripts`, initial);
    check(initial.nativeUiRequested, `Home @ ${page.viewportSize().width}: native header/form script loaded`, initial);
    check(initial.deferredStyles.length > 0 && initial.deferredStyles.every(style => style.media === "all" && style.loaded && style.ready === "true"), `Home @ ${page.viewportSize().width}: complete stylesheet loaded and active`, initial.deferredStyles);
    check(initial.placeholders.some(section => section.id === "kahvalti-planla" && section.source === "/interactive/planner-breakfast") && initial.placeholders.some(section => section.id === "rota-matrisi" && section.source === "/interactive/routes"), `Home @ ${page.viewportSize().width}: accessible fragment anchors exist`, initial);
    result.lazy.push({ width: page.viewportSize().width, ...initial });
  }
  await loadInteractiveSections(page);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    images.forEach(image => { image.loading = "eager"; });
    for (const image of images) {
      if (image.complete && image.naturalWidth) continue;
      // Simulate a real visitor reaching native lazy images/content-visibility
      // regions. Changing loading alone does not reliably activate all images.
      image.scrollIntoView({ block: "center" });
      await new Promise(resolve => {
        if (image.complete && image.naturalWidth > 0) return resolve();
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 12000);
      });
    }
    window.scrollTo(0, 0);
  });
  return response;
}
async function measureOverflow(page) {
  return page.evaluate(expectedWidth => {
    const width = expectedWidth;
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - width;
    const offenders = overflow > 1 ? Array.from(document.body.querySelectorAll("*")).filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width && (rect.right > width + 1 || rect.left < -1) && !element.closest(".growth-table-scroll");
    }).slice(0, 15).map(element => ({ tag: element.tagName, id: element.id, class: String(element.className).slice(0, 140), right: Math.round(element.getBoundingClientRect().right), text: element.textContent?.trim().slice(0, 90) })) : [];
    return { width, innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, overflow, offenders };
  }, page.viewportSize().width);
}
async function capturePage(page, filename) {
  // Full-page screenshots do not paint every offscreen content-visibility:auto
  // subtree. Force rendering only for this capture; product CSS and Lighthouse
  // remain unchanged, and the temporary rule is removed even if capture fails.
  const captureStyle = await page.addStyleTag({ content: "*{content-visibility:visible!important;contain-intrinsic-size:none!important}" });
  await captureStyle.evaluate(element => { element.dataset.fullPageCapture = "true"; });
  try {
    await page.evaluate(async () => {
      window.scrollTo(0, 0);
      await document.fonts.ready;
      const images = Array.from(document.images);
      images.forEach(image => { image.loading = "eager"; });
      await Promise.all(images.map(image => new Promise(resolve => {
        if (image.complete) return resolve();
        const finish = () => { clearTimeout(timer); image.removeEventListener("load", finish); image.removeEventListener("error", finish); resolve(); };
        const timer = setTimeout(finish, 12000);
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      })));
      await Promise.all(images.filter(image => image.complete && image.naturalWidth > 0 && image.decode).map(image => image.decode().catch(() => {})));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.screenshot({ path: filename, fullPage: true });
  } finally {
    await captureStyle.evaluate(element => element.remove());
    await page.evaluate(() => new Promise(resolve => { window.scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(resolve)); }));
  }
  check(await page.locator("style[data-full-page-capture]").count() === 0, "Full-page capture: temporary rendering override removed");
}
try {
  for (const width of [320, 375, 768, 1440]) {
    const context = await contextFor(width);
    const outbound = [];
    await context.route("**/*", async request => {
      if (new URL(request.request().url()).origin === localOrigin) await request.continue();
      else { outbound.push(request.request().url()); await request.abort(); }
    });
    const page = await context.newPage();
    let errors = [];
    let consoleErrors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    for (const route of routes) {
      errors = []; consoleErrors = [];
      try {
        const response = await pageReady(page, route, { checkInitialLazy: route === "/" });
        const info = await page.evaluate(() => {
          const meta = selector => document.querySelector(selector)?.getAttribute("content") || "";
          const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(script => { try { return JSON.parse(script.textContent); } catch (error) { return { parseError: error.message }; } });
          const ids = Array.from(document.querySelectorAll("[id]")).map(element => element.id);
          return { title: document.title, description: meta('meta[name="description"]'), canonical: document.querySelector('link[rel="canonical"]')?.href, ogTitle: meta('meta[property="og:title"]'), ogDescription: meta('meta[property="og:description"]'), ogUrl: meta('meta[property="og:url"]'), ogImage: meta('meta[property="og:image"]'), twitterCard: meta('meta[name="twitter:card"]'), twitterTitle: meta('meta[name="twitter:title"]'), twitterDescription: meta('meta[name="twitter:description"]'), h1: Array.from(document.querySelectorAll("h1")).map(element => element.textContent.trim()), ld, duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index), brokenImages: Array.from(document.images).filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute("src")), mobileBarVisible: getComputedStyle(document.querySelector(".ce-mobile-actions")).display !== "none", consentPromptHidden: document.querySelector("[data-growth-consent]").hidden, plannerCount: document.querySelectorAll("[data-breakfast-planner]").length };
        });
        const where = `${route} @ ${width}`;
        check(response.status() === 200, `${where}: HTTP 200`, response.status());
        check(info.h1.length === 1, `${where}: exactly one H1`, info.h1);
        check(info.title && info.description && info.ogTitle && info.ogDescription && info.ogImage && info.twitterTitle && info.twitterDescription && info.twitterCard === "summary_large_image", `${where}: complete metadata`, info);
        check(info.canonical === canonicalOrigin + route, `${where}: canonical`, info.canonical);
        check(new URL(info.ogUrl).href === new URL(canonicalOrigin + route).href, `${where}: OG URL`, info.ogUrl);
        check(info.duplicateIds.length === 0, `${where}: unique HTML IDs`, info.duplicateIds);
        check(info.brokenImages.length === 0, `${where}: images loaded`, info.brokenImages);
        check(info.mobileBarVisible === (width < 768), `${where}: responsive action bar`, info.mobileBarVisible);
        check(info.consentPromptHidden, `${where}: no-ID analytics prompt hidden`);
        check(info.ld.length === 1 && Array.isArray(info.ld[0]["@graph"]), `${where}: one JSON-LD graph`, info.ld.length);
        const graph = info.ld[0]?.["@graph"] || [];
        const definitions = []; const refs = []; const forbidden = [];
        function walk(value) {
          if (!value || typeof value !== "object") return;
          if (Array.isArray(value)) { value.forEach(walk); return; }
          if (value["@id"]) (Object.keys(value).length > 1 ? definitions : refs).push(value["@id"]);
          for (const [key, entry] of Object.entries(value)) { if (["offers", "price", "lowPrice", "highPrice", "aggregateRating", "review"].includes(key)) forbidden.push(key); walk(entry); }
        }
        walk(graph);
        check(graph.length >= 50, `${where}: 50+ graph nodes`, graph.length);
        check(new Set(definitions).size === definitions.length, `${where}: unique graph entity IDs`);
        check(refs.every(id => definitions.includes(id)), `${where}: graph references resolve`, refs.filter(id => !definitions.includes(id)));
        check(forbidden.length === 0, `${where}: no unsupported offers/prices/reviews`, forbidden);
        const closedOverflow = await measureOverflow(page);
        check(closedOverflow.overflow <= 1, `${where}: closed-details horizontal overflow`, closedOverflow);
        if (route === "/" && [320, 1440].includes(width)) {
          if (width === 320) {
            // This viewport capture uses normal product rendering, before any
            // full-page-only override, to verify real scrolled copy is visible.
            const article = page.locator(".growth-home-guide .growth-article-grid > section").first();
            await article.scrollIntoViewIfNeeded();
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const visibleCopy = await article.evaluate(element => { const rect = element.getBoundingClientRect(); return { textLength: element.textContent.trim().length, visible: element.checkVisibility({ contentVisibilityAuto: true }), top: rect.top, bottom: rect.bottom, viewportHeight: innerHeight }; });
            check(visibleCopy.visible && visibleCopy.textLength > 0 && visibleCopy.top < visibleCopy.viewportHeight && visibleCopy.bottom > 0, "Normal mobile scroll: editorial paragraph is visibly rendered", visibleCopy);
            const scrollScreenshot = outputPath("after-mobile-scroll.png");
            await page.screenshot({ path: scrollScreenshot });
            result.screenshots.push(scrollScreenshot);
            result.visualScroll = { ...visibleCopy, screenshot: scrollScreenshot, temporaryRenderingOverride: false };
          }
          const filename = outputPath(`after-${width === 320 ? "mobile" : "desktop"}.png`);
          await capturePage(page, filename);
          result.screenshots.push(filename);
        }
        await page.evaluate(() => { document.querySelectorAll("details").forEach(details => { details.open = true; }); window.scrollTo(0, 0); });
        const openOverflow = await measureOverflow(page);
        check(openOverflow.overflow <= 1, `${where}: open-details horizontal overflow`, openOverflow);
        await page.locator("#menu-toggle").click();
        await page.waitForFunction(() => document.getElementById("menu-toggle").getAttribute("aria-expanded") === "true");
        const menuOverflow = await measureOverflow(page);
        check(menuOverflow.overflow <= 1, `${where}: open navigation horizontal overflow`, menuOverflow);
        check(await page.locator("#site-menu").getAttribute("aria-hidden") === "false", `${where}: menu accessible when open`);
        await page.keyboard.press("Escape");
        await page.waitForFunction(() => document.getElementById("menu-toggle").getAttribute("aria-expanded") === "false");
        check(await page.evaluate(() => document.activeElement?.id === "menu-toggle"), `${where}: Escape returns menu focus`);
        check(errors.length === 0, `${where}: no page errors`, errors);
        check(consoleErrors.length === 0, `${where}: no console errors`, consoleErrors);
        result.pages.push({ route, width, status: response.status(), ...info, ld: undefined, schemaNodes: graph.length, closedOverflow, openOverflow, menuOverflow, errors: [...errors], consoleErrors: [...consoleErrors] });
        console.log(`Checked ${where}: ${graph.length} schema nodes, ${openOverflow.overflow}px open overflow`);
      } catch (error) { check(false, `${route} @ ${width}: browser test completed`, error.stack); console.error(`Failed ${route} @ ${width}: ${error.message.slice(0, 180)}`); }
    }
    check(outbound.length === 0, `${width}: no third-party requests with IDs unconfigured`, outbound);
    result.analytics[`normal_${width}_outbound`] = outbound;
    await context.close();
  }

  result.deferredStyles = [];
  for (const width of [375, 412]) {
    const delayedContext = await contextFor(width);
    let releaseStyles;
    const styleGate = new Promise(resolve => { releaseStyles = resolve; });
    const heldStyles = [];
    await delayedContext.route("**/performance/ui/home-*.css", async route => {
      heldStyles.push({ url: route.request().url(), requestedAt: Date.now() });
      await styleGate;
      await route.continue();
    });
    const delayedPage = await delayedContext.newPage();
    const snapshotBar = () => delayedPage.evaluate(() => {
      const rect = document.querySelector(".ce-mobile-actions").getBoundingClientRect();
      return { innerWidth, documentWidth: document.documentElement.scrollWidth, bar: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }, styles: Array.from(document.querySelectorAll("link[data-deferred-styles]")).map(link => ({ media: link.media, loaded: Boolean(link.sheet) })) };
    });
    try {
      await delayedPage.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 15000 });
      await delayedPage.waitForFunction(() => Boolean(window.CanEvimLoader));
      const before = await snapshotBar();
      await delayedPage.waitForTimeout(500);
      const pending = await snapshotBar();
      const heldForMs = heldStyles.length ? Date.now() - heldStyles[0].requestedAt : 0;
      check(heldStyles.length === 1 && heldForMs >= 500 && pending.styles.some(style => style.media === "print" && !style.loaded), `Critical CSS @ ${width}: full stylesheet genuinely held for 500ms`, { heldStyles, heldForMs, pending });
      releaseStyles();
      await delayedPage.waitForFunction(() => Array.from(document.querySelectorAll("link[data-deferred-styles]")).every(link => link.media === "all" && link.sheet), null, { timeout: 15000 });
      await delayedPage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const after = await snapshotBar();
      const stable = [before, pending, after].every(snapshot => snapshot.innerWidth === width && snapshot.documentWidth <= width + 1 && Math.abs(snapshot.bar.left) <= 1 && Math.abs(snapshot.bar.right - width) <= 1 && Math.abs(snapshot.bar.width - width) <= 1) && Object.keys(before.bar).every(key => Math.abs(before.bar[key] - pending.bar[key]) <= 1 && Math.abs(before.bar[key] - after.bar[key]) <= 1);
      check(stable, `Critical CSS @ ${width}: viewport and fixed action bar stay stable before/after full styles`, { before, pending, after });
      result.deferredStyles.push({ width, heldForMs, before, pending, after, stable });
    } catch (error) {
      check(false, `Critical CSS @ ${width}: delayed stylesheet test completed`, error.stack);
    } finally {
      releaseStyles();
      await delayedContext.close();
    }
  }

  const lazyContext = await contextFor(375);
  const lazyRequests = [];
  lazyContext.on("request", request => { const pathname = new URL(request.url()).pathname; if (pathname.startsWith("/interactive/") || pathname === "/growth.js") lazyRequests.push(pathname); });
  const lazyPage = await lazyContext.newPage();
  await lazyPage.goto(base + "/", { waitUntil: "load" });
  await lazyPage.waitForFunction(() => Boolean(window.CanEvimLoader));
  check(!await lazyPage.evaluate(() => Boolean(window.CanEvimGrowth)), "Lazy planner: runtime absent before scrolling");
  await revealPlanner(lazyPage);
  check(await lazyPage.locator("#kahvalti-planla").count() === 1, "Lazy planner: original deep-link ID retained exactly once");
  await lazyPage.evaluate(async () => { const section = document.getElementById("kahvalti-planla"); await Promise.all([window.CanEvimLoader.load(section), window.CanEvimLoader.load(section)]); });
  check(await lazyPage.locator("[data-breakfast-planner]").count() === 1, "Lazy planner: repeated load is idempotent");
  await lazyPage.locator("#rota-matrisi").scrollIntoViewIfNeeded();
  await lazyPage.locator(".route-matrix a[data-route-id]").first().waitFor({ state: "attached" });
  check(await lazyPage.locator("#rota-matrisi").count() === 1, "Lazy routes: original deep-link ID retained exactly once");
  check(await lazyPage.locator(".route-matrix a[data-route-id]").count() >= 40, "Lazy routes: all 40+ direction links inserted");
  check(lazyRequests.filter(url => url === "/interactive/planner-breakfast").length === 1 && lazyRequests.filter(url => url === "/interactive/routes").length === 1 && lazyRequests.filter(url => url === "/growth.js").length === 1, "Lazy fragments: one request per widget and one runtime", lazyRequests);
  result.lazyAutomatic = { requests: lazyRequests, plannerForms: await lazyPage.locator("[data-breakfast-planner]").count(), routeLinks: await lazyPage.locator("a[data-route-id]").count() };
  await lazyContext.close();

  const plannerContext = await contextFor(375);
  const planner = await plannerContext.newPage();
  const plannerErrors = [];
  planner.on("pageerror", error => plannerErrors.push(error.message));
  await pageReady(planner, "/");
  const form = planner.locator("[data-breakfast-planner]");
  await form.locator('[name="party"][value="family"]').check();
  check(await form.locator('[name="guests"]').inputValue() === "4", "planner: family quicksets 4");
  await form.locator('[name="party"][value="group"]').check();
  check(await form.locator('[name="guests"]').inputValue() === "8", "planner: group quicksets 8");
  await form.locator('[name="guests"]').fill("7");
  await form.locator('[name="concept"][value="gozleme"]').check();
  await form.locator('[name="budget"]').fill("600");
  await form.locator('[name="child_area"]').check();
  await form.locator('[name="garden"]').check();
  const planMessage = await form.locator("[data-planner-message]").inputValue();
  const budget = await planner.locator("[data-planner-budget]").innerText();
  const products = await planner.locator("[data-planner-products]").innerText();
  check(planMessage.includes("7 kişi") && planMessage.includes("gözleme & çay") && planMessage.includes("600 TL") && planMessage.includes("Çocuk alanı hakkında") && planMessage.includes("Bahçede masa") && planMessage.includes("işletme onayıyla kesinleştiğini"), "planner: complete honest WhatsApp message", planMessage);
  check(budget.includes("4.200") && budget.includes("İşletme fiyatı veya teklif değildir"), "planner: clearly labelled visitor budget", budget);
  check(products.includes("Pazılı gözleme") && !products.includes("menemen"), "planner: concept-specific products", products);
  await form.locator('button[type="submit"]').click();
  const opened = await planner.evaluate(() => window.__opened);
  const whatsApp = new URL(opened.at(-1));
  check(whatsApp.hostname === "wa.me" && whatsApp.pathname === "/905374975062" && whatsApp.searchParams.get("text") === planMessage, "planner: popup message matches selection; intercepted without transmission");
  await form.locator('[name="concept"][value="breakfast_grill"]').check();
  check((await planner.locator("[data-planner-products]").innerText()).includes("ızgara köfte"), "planner: breakfast + grill products");
  await planner.setViewportSize({ width: 1200, height: 1000 });
  const plannerScreenshot = outputPath("after-planner.png");
  await planner.locator(".ce-planner").screenshot({ path: plannerScreenshot });
  result.screenshots.push(plannerScreenshot);
  result.planner = { familyQuickset: 4, groupQuickset: 8, customGuests: 7, budget, products, popupIntercepted: true, message: planMessage };

  // Link navigation stays inside Next: a window token survives while a fresh planner initializes.
  await planner.goto(base + "/menu", { waitUntil: "load" });
  await planner.evaluate(() => { window.__navigationToken = "persisted"; window.scrollTo(0, 0); });
  await planner.locator("#menu-toggle").click();
  await planner.locator('#site-menu a[href="/sile-gozleme"]').click();
  await planner.waitForURL("**/sile-gozleme");
  await planner.locator("h1").filter({ hasText: "Şile gözleme molası" }).waitFor();
  await revealPlanner(planner);
  await planner.waitForFunction(() => document.querySelector("[data-breakfast-planner]")?.__growthReady === true);
  await planner.locator("[data-planner-heading]").scrollIntoViewIfNeeded();
  await planner.waitForFunction(() => document.querySelector("[data-planner-heading]")?.innerText.includes("gözleme"));
  check(await planner.evaluate(() => window.__navigationToken === "persisted"), "Next navigation: window preserved");
  check((await planner.locator("[data-planner-heading]").innerText()).includes("gözleme"), "Next navigation: inserted planner initialized");
  await planner.locator('[name="party"][value="family"]').check();
  check(await planner.locator('[name="guests"]').inputValue() === "4", "Next navigation: planner delegation active");
  await planner.locator('.growth-footer nav a[href="/sile-serpme-kahvalti"]').click();
  await planner.waitForURL("**/sile-serpme-kahvalti");
  await planner.locator("h1").filter({ hasText: "Şile serpme kahvaltı:" }).waitFor();
  await revealPlanner(planner);
  await planner.waitForFunction(() => document.querySelector("[data-breakfast-planner]")?.__growthReady === true);
  await planner.locator("[data-planner-heading]").scrollIntoViewIfNeeded();
  await planner.waitForFunction(() => document.querySelector("[data-planner-heading]")?.innerText.includes("2 kişilik serpme"));
  check((await planner.locator("[data-planner-heading]").innerText()).includes("2 kişilik serpme"), "Next navigation: changed dynamic concept resets SSR summary");
  check(await planner.locator('[name="concept"][value="breakfast"]').isChecked(), "Next navigation: dynamic concept radio resets");
  const appWindowPreserved = await planner.evaluate(() => window.__navigationToken === "persisted");
  check(appWindowPreserved, "App detail navigation: window token survives between detail pages");
  await planner.locator('.growth-footer nav a[href="/"]').click();
  await planner.waitForURL(base + "/");
  await planner.locator("h1").filter({ hasText: "Şile Kahvaltı," }).waitFor();
  const nativeHome = await planner.evaluate(() => ({ staticHome: document.body.dataset.staticHome === "true", tokenReset: window.__navigationToken === undefined, frameworkRequests: performance.getEntriesByType("resource").map(entry => entry.name).filter(url => /\/_next\/.*\.js(?:\?|$)/.test(new URL(url).pathname)) }));
  check(nativeHome.staticHome && nativeHome.tokenReset && nativeHome.frameworkRequests.length === 0, "App to home: native document navigation resets window and loads zero framework scripts", nativeHome);
  await revealPlanner(planner);
  await planner.waitForFunction(() => document.querySelector("[data-breakfast-planner]")?.__growthReady === true);
  await planner.locator("[data-planner-heading]").scrollIntoViewIfNeeded();
  await planner.waitForFunction(() => document.querySelector("[data-planner-heading]")?.innerText.includes("serpme"));
  check((await planner.locator("[data-planner-heading]").innerText()).includes("serpme"), "Next navigation: home planner reinitializes");
  result.navigation = { windowPreserved: appWindowPreserved, appWindowPreserved, nativeHome, plannerInitializedAfterMenuToGozleme: true, dynamicGozlemeToBreakfastReset: true, plannerInitializedOnHome: true };

  const reservation = planner.locator('form[data-growth-location="reservation_form"]');
  await reservation.locator('[name="name"]').fill("Browser QA");
  await reservation.locator('[name="date"]').fill("2026-10-27");
  const openedBeforeReservation = await planner.evaluate(() => window.__opened.length);
  await reservation.locator('button[type="submit"]').click();
  check(await planner.evaluate(() => window.__opened.length) === openedBeforeReservation, "Static home reservation: contact checkbox required before WhatsApp");
  await reservation.locator("#contact_permission").check();
  await reservation.locator('button[type="submit"]').click();
  const reservationUrl = await planner.evaluate(() => window.__opened.at(-1));
  const reservationMessage = new URL(reservationUrl).searchParams.get("text");
  check(new URL(reservationUrl).hostname === "wa.me" && new URL(reservationUrl).pathname === "/905374975062" && reservationMessage.includes("Browser QA") && reservationMessage.includes("27/10/2026") && reservationMessage.includes("işletme onayıyla kesinleştiğini"), "Static home reservation: native submit creates truthful WhatsApp inquiry; transmission intercepted", reservationMessage);
  result.nativeHome = { reservationMessage, reservationPopupIntercepted: true, contactPermissionRequired: true };
  check(plannerErrors.length === 0, "Planner and Next navigation: no runtime errors", plannerErrors);
  await plannerContext.close();

  const anchorContext = await contextFor(375);
  const anchorPage = await anchorContext.newPage();
  result.deepAnchors = [];
  for (const target of ["/#fiyat-kapsam", "/sile-gozleme#pazili", "/ulasim#istanbul-rotalari", "/#kahvalti-planla", "/#rota-matrisi"]) {
    await anchorPage.goto(base + target, { waitUntil: "load" });
    await anchorPage.evaluate(() => document.fonts.ready);
    await loadInteractiveSections(anchorPage);
    await anchorPage.waitForFunction(() => { const element = document.getElementById(decodeURIComponent(location.hash.slice(1))); const rect = element?.getBoundingClientRect(); return rect && rect.top < innerHeight - 50 && rect.bottom > 0; }, null, { timeout: 5000 }).catch(() => {});
    const anchor = await anchorPage.evaluate(() => { const element = document.getElementById(decodeURIComponent(location.hash.slice(1))); const rect = element?.getBoundingClientRect(); return { hash: location.hash, top: rect?.top, bottom: rect?.bottom, width: rect?.width, height: rect?.height, viewportHeight: innerHeight, textLength: element?.textContent.trim().length }; });
    check(anchor.width > 0 && anchor.height > 0 && anchor.textLength > 0 && anchor.top < anchor.viewportHeight - 50 && anchor.bottom > 0, `Deep anchor ${target}: content visible at intended position`, anchor);
    result.deepAnchors.push(anchor);
  }
  await anchorPage.goto(base + "/ulasim", { waitUntil: "load" });
  await loadInteractiveSections(anchorPage);
  await anchorPage.evaluate(() => { window.__routeClicked = []; document.addEventListener("click", event => { const anchor = event.target.closest("a[data-route-id]"); if (anchor) { event.preventDefault(); window.__routeClicked.push(anchor.getAttribute("data-route-id")); } }); });
  const group = anchorPage.locator(".route-matrix__group").nth(1);
  await group.locator("summary").click();
  await group.locator("a[data-route-id]").first().click();
  check(await group.getAttribute("open") !== null && await anchorPage.evaluate(() => window.__routeClicked.length === 1), "Performance CSS: opened route details render and route link receives click");
  await anchorContext.close();

  const fakeContext = await contextFor(1440);
  const source = await fs.readFile("scripts/growth-runtime.cjs", "utf8");
  const interceptedGoogle = [];
  const configuredSource = source.replace('var gtmId = script && script.getAttribute("data-gtm-id") || "";', 'var gtmId = "GTM-TEST123";');
  check(configuredSource !== source, "Fake GTM configuration override is applied in test response only");
  const configuredMinified = await minify(configuredSource, { ecma: 2018, compress: { passes: 2 }, mangle: true });
  await fakeContext.route("**/growth.js", route => route.fulfill({ contentType: "application/javascript", body: configuredMinified.code }));
  await fakeContext.route("https://www.googletagmanager.com/**", route => { interceptedGoogle.push(route.request().url()); return route.fulfill({ contentType: "application/javascript", body: "window.__fakeGtmLoaded = true;" }); });
  const analytics = await fakeContext.newPage();
  const analyticsErrors = [];
  const analyticsConsoleErrors = [];
  analytics.on("pageerror", error => analyticsErrors.push(error.message));
  analytics.on("console", message => { if (message.type() === "error") analyticsConsoleErrors.push(message.text()); });
  await pageReady(analytics, "/ulasim");
  // Exercise a configured runtime in the intercepted response, without putting
  // a fake analytics ID into the production loader or contacting Google.
  await analytics.evaluate(() => window.CanEvimLoader.ensureRuntime());
  await analytics.waitForFunction(() => Boolean(window.CanEvimGrowth));
  await analytics.evaluate(() => {
    document.addEventListener("click", event => { if (event.target.closest('a[href^="https://"], a[href^="tel:"]')) event.preventDefault(); });
  });
  check(interceptedGoogle.length === 0, "analytics: zero loader requests before consent");
  await analytics.locator("a[data-route-id]").first().click();
  check(await analytics.evaluate(() => localStorage.getItem("canevim_events_v1") === null), "analytics: no queue before consent");
  await analytics.locator('[data-consent-choice="granted"]').click();
  await analytics.waitForFunction(() => window.__fakeGtmLoaded === true);
  await analytics.locator("a[data-route-id]").first().click();
  const pending = await analytics.evaluate(() => JSON.parse(localStorage.getItem("canevim_events_v1") || "[]"));
  check(pending.length === 1 && pending[0].data.event === "directions_click" && pending[0].data.route_id && !JSON.stringify(pending).includes("https:"), "analytics: route event durably queued while GTM unavailable", pending);
  await analytics.evaluate(() => { window.google_tag_manager = { "GTM-TEST123": {} }; window.CanEvimGrowth.flush(); });
  check(await analytics.evaluate(() => localStorage.getItem("canevim_events_v1") === null), "analytics: recovery drains pending queue");
  await analytics.locator('a[href="tel:+905374975062"]').first().click();
  await analytics.locator('.growth-footer-actions a[href^="https://wa.me/"]').click();
  const analyticsEvents = await analytics.evaluate(() => window.dataLayer.filter(entry => ["directions_click", "phone_click", "whatsapp_click"].includes(entry.event)));
  check(["directions_click", "phone_click", "whatsapp_click"].every(name => analyticsEvents.some(entry => entry.event === name)), "analytics: all conversion-link events reach fake GTM", analyticsEvents);
  check(analyticsEvents.every(entry => !["url", "name", "date", "text", "budget", "phone"].some(key => key in entry)), "analytics: no sensitive/full-URL fields", analyticsEvents);
  await analytics.evaluate(() => { window.CanEvimGrowth.setConsent(false); window.CanEvimGrowth.track("phone_click", { placement: "test" }); });
  check(await analytics.evaluate(() => localStorage.getItem("canevim_events_v1") === null), "analytics: revocation clears queue");
  result.analytics.fakeGtm = { interceptedGoogle, pendingWhileUnavailable: pending.length, events: analyticsEvents, externalNavigationPrevented: true, revoked: true };
  check(analyticsErrors.length === 0, "Fake configured analytics: no runtime errors", analyticsErrors);
  check(analyticsConsoleErrors.length === 0, "Fake configured analytics: no hydration/console errors", analyticsConsoleErrors);
  await fakeContext.close();
} catch (error) { check(false, "Browser suite completed", error.stack); }
finally {
  await browser.close();
  check(result.pages.length === result.expectedViewportCases, "All canonical routes completed at four viewport widths", { expected: result.expectedViewportCases, actual: result.pages.length });
  result.status = result.failures.length ? "failed" : "passed";
  result.completedAt = new Date().toISOString();
  await fs.writeFile(outputPath("browser-tests.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ status: result.status, pageChecks: result.pages.length, screenshots: result.screenshots, failures: result.failures }, null, 2));
  if (result.failures.length) process.exitCode = 1;
}
