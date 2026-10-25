# Planner and event integration

`LazyInteractive` renders an accessible server-side placeholder; the full planner and home route matrix load as same-origin HTML when needed. `BreakfastPlanner` and `RouteMatrix` render those HTML fragments, while `MobileActions` remains in the initial page. `public/growth-loader.js` coordinates loading; `public/growth.js` supplies the delegated planner and consent-gated analytics. Neither adds a client framework or requires an analytics subscription to operate the planner.

Edit `scripts/growth-loader.cjs` or `scripts/growth-runtime.cjs`, then run `node scripts/build-growth.mjs` to regenerate the shipped minified scripts. The prebuild command runs this automatically using Next's bundled Terser; no package is added. Do not edit the generated public scripts directly.

## Static home document

The home route is an actual static HTML document served by `app/route.js`. `scripts/build-home.cjs` renders the shared `app/home-content.js`, header and mobile actions with React's `renderToStaticMarkup`, then generates `app/generated/home-html.json`. It does not render a Next page and remove framework scripts afterward. The generated document has `body[data-static-home="true"]`, its complete metadata/JSON-LD and editorial content, and no Next/React hydration scripts.

The builder embeds the complete shared home stylesheet in one `<style data-home-styles="complete">` element. There is no separate home stylesheet request, delayed media switch or duplicate `noscript` sheet. The complete editorial layout, header and fixed mobile action bar are styled from the document itself, including when JavaScript is disabled. The helper stylesheets for the planner and route matrix still load with their lazy fragments.

The inline stylesheet retains the existing offscreen `content-visibility` and intrinsic-size rules, including their focus, anchor and print overrides. The CanEvim wordmark, Playfair Display Latin regular and Playfair Display Turkish regular subsets remain separate WOFF2 assets under `/performance/fonts/`. Three HTML font preloads use `as="font"`, `type="font/woff2"` and `crossorigin="anonymous"`; the route does not send font preload response headers. The font-face declarations use `font-display:swap`, and the separate assets can be cached independently of the document. Font bytes are not embedded in the CSS. Other unused font-face declarations do not imply that those font files are downloaded.

The builder embeds the 14 KB WebP hero once as a data URL in the narrow-screen picture source (up to 480px) and omits its external preload. This removes the narrow-screen hero request while retaining the actual image and asynchronous decoding. All devices receive the embedded bytes; wider screens select their external responsive sources and keep their media-specific preloads.

`app/generated/` is ignored by Git and recreated during the build; the generated home JSON contains the complete stylesheet and embedded assets. Do not hand-edit or commit generated files. A separately hashed home CSS asset is no longer required by the document. The content-date fingerprint excludes generated home JSON because bundler/environment output can vary without an editorial change. It instead includes the actual shared JSX, CSS, builder and native UI sources. Text line endings are normalized for the fingerprint while binary assets retain their original bytes. A bundler output difference or Windows/Linux line-ending difference alone must not advance sitemap content dates.

`scripts/home-ui.cjs` builds `/home-ui.js` for the native header, keyboard/focus behavior and reservation form. Its WhatsApp submission validates the required name, date and contact checkbox and retains the message that reservations need business confirmation. Popups are intercepted during automated tests. The deferred `/growth-loader.js` continues to load the planner/routes as needed. Without configured analytics IDs, the initial home viewport requests neither `growth.js` nor widget HTML.

`npm run dev` and `npm run build` regenerate the runtime and static home through their pre-scripts. Changes to shared home content, styling, metadata or native interactions require regeneration. Detail pages retain the Next App Router; links between detail pages use client navigation. A link back to `/` uses a native anchor and starts the independent home document, so window state resets on that transition.

## App integration

On App Router detail pages, keep critical page/mobile-action styling in the root layout and add `<MobileActions />` once. Load the small loader through Next's existing Script component after hydration:

```jsx
<Script
  id="growth-loader"
  src="/growth-loader.js"
  strategy="afterInteractive"
  data-gtm-id={process.env.NEXT_PUBLIC_GTM_ID || ""}
  data-ga4-id={process.env.NEXT_PUBLIC_GA4_ID || ""}
/>
```

Use `LazyInteractive` on the home and relevant product pages:

```jsx
<LazyInteractive id="kahvalti-planla" module="planner-breakfast" />
<LazyInteractive id="rota-matrisi" module="routes" />
```

Planner modules are `planner-breakfast`, `planner-gozleme` and `planner-breakfast_grill`. Their fragment pages live under `/interactive/…`; these utility pages are excluded from the content sitemap and marked noindex. The 17 public canonical content routes are defined in `app/seo-routes.mjs`.

An IntersectionObserver starts loading when a placeholder comes within 300px of the viewport. Its button also loads the tool, including on browsers without IntersectionObserver. The loader fetches the fragment HTML and its `/performance/ui/interactive.css` or `routes.css` stylesheet. It extracts only `.ce-planner` or `.route-matrix`, removes nested scripts, and inserts the result inside the original anchor section. The placeholder's `kahvalti-planla` or `rota-matrisi` ID remains; the imported fragment uses a different internal ID. Repeated loads share the same pending promise. Failures preserve the information link and expose a retry message.

The planner loads `growth.js` as part of this operation. Loading only the route matrix does not require it when analytics is unconfigured. With neither GTM nor GA4 configured, the initial home viewport does not request `growth.js` or either fragment. Menus and editorial content remain in the initial server HTML. The loader observes newly inserted placeholders after Next client navigation. Give concept-changing page instances a stable distinct key so React can replace the placeholder rather than reconcile externally inserted children.

The runtime remains vanilla JavaScript. Initial planner refresh preserves the fragment's existing text nodes, and later selections update existing product-list nodes in place. Keep after-hydration scheduling on App Router detail pages. The independent static home has no hydration phase and uses native deferred `home-ui.js` and `growth-loader.js`. Do not add a second direct growth runtime script.

Do not load a second GTM/GA4 snippet: this file loads the configured service only after a visitor permits measurement. The script prefers GTM when both IDs exist. Use a real `GTM-…` container or `G-…` measurement ID; no placeholder is included. No analytics UI or remote analytics script appears when IDs are absent. A Content Security Policy must allow this local script and the selected Google service, if configured.

`BreakfastPlanner` itself is rendered by the utility fragment page with an internal ID. `initialConcept` accepts `breakfast`, `gozleme`, or `breakfast_grill`. The fetched HTML is generated from the repository's actual menu; no live pricing service is used. Lists describe menu choices, not a fixed offer or package. There is no invented price, cooking method, semaver service, priority booking, child facility promise, or confirmation guarantee. Optional visitor-entered budget is explicitly the visitor's own estimate.

## Events

The delegated handler recognizes `tel:`, WhatsApp, Google Maps and `/menu` links anywhere in the document, including links inserted by client navigation. The planner emits `planner_interaction` on committed field changes and reservation requests. The static home's native reservation handler calls the same API on its WhatsApp request when the runtime is loaded.

| Event | Meaning |
| --- | --- |
| `phone_click` | A telephone link was clicked |
| `whatsapp_click` | A WhatsApp link/request was opened; not a confirmed reservation |
| `directions_click` | A map/route link was clicked |
| `planner_interaction` | A planner field changed or request was opened |
| `menu_click` | A menu link was clicked |

Place `data-growth-location="route_matrix"` on a parent for placement, and a stable ASCII `data-route-id="kadikoy"` on an individual route anchor. `data-location` is accepted as fallback. Do not pass human-entered strings to tracking. The sanitizer allows only the event name, bounded ASCII labels (`placement`, `route_id`, `page_type`, `action`, `concept`, `party`, `guest_bucket`) and two facility-request booleans. Names, date, message text, entered budget, phone number, complete URL, URL parameters and exact guest count are excluded. `page_type` is a fixed category rather than a pathname. `event_id` identifies a queued event, not a person.

Configure GTM Custom Event triggers for the above names and map only the documented fields to GA4 event parameters. Disable automatic form-interaction tracking, link-text/URL collection, enhanced measurement and unneeded page data. For a Google tag, set fixed `page_location=https://www.canevimsile.com/`, empty `page_referrer`, fixed `page_title=Can Evim Şile`, disable automatic pageviews and Google signals. Route category is supplied by the event. Honor Consent Mode `analytics_storage`; ad storage/personalization remain denied. Container configuration can introduce additional collection and therefore must be reviewed before enabling it. Do not count `whatsapp_click` as a completed sale/reservation.

## Consent, queue and limits

No events are collected or queued before consent, or after refusal. When IDs are configured, the loader initializes the analytics runtime without waiting for a planner visit; the selected Google service still waits for consent. The preference control is rendered beside the mobile bar and remains available on desktop. A visitor can revoke consent and clear pending events. A connected consent manager can await `window.CanEvimLoader.ensureRuntime()` before calling `window.CanEvimGrowth.setConsent(true | false)`; avoid rendering a second conflicting consent prompt.

After consent, the queue persists in localStorage (key `canevim_events_v1`), keeps at most 60 events, expires events after 24 hours, and waits while the browser is offline or GTM/GA4 is unavailable. Exceptions during handoff back off with a five-minute ceiling and at most 20 attempts. Storage restrictions fall back to page memory. The queue retries on online/visibility changes and every five seconds on a visible page. Events are removed after successful handoff to the loaded GTM dataLayer/gtag API. That is a handoff, not proof of server receipt: blockers, browser termination, quotas, concurrent-tab storage races, network loss after handoff, expiry or refusal can lose events. Zero loss and zero performance cost are not claimed. There is no form message or PII in analytics storage. WhatsApp message text necessarily leaves the site when the visitor submits the request.

Loader API: `window.CanEvimLoader.load(sectionElement)` and `.ensureRuntime()`, both returning promises. Runtime API, after it loads: `window.CanEvimGrowth.track(name, allowedFields)`, `.setConsent(boolean)`, `.getConsent()`, `.flush()`, `.refresh()`. `refresh` initializes inserted planner nodes; its MutationObserver ignores product-summary DOM changes. Runtime initialization uses an internal DOM property instead of modifying server HTML attributes.

## Verification

Run `node scripts/build-growth.mjs`, syntax checks for both public scripts, and `node scripts/test-growth.mjs`. Unit tests load the actual minified runtime and cover nine party/concept variants, message confirmation language, personal budget math, invalid input, privacy allowlist, no collection before consent, persistence/reload, queue cap, backoff/recovery, expiration, consent revocation and restricted-storage fallback.

Run `node scripts/test-browser.mjs` against `TEST_BASE_URL` (default `http://127.0.0.1:3100`). It imports the 17 canonical content routes and checks 320, 375, 768 and 1440px widths: 68 route/viewport cases. It verifies metadata/schema, images, open/closed details and navigation, overflow, planner/popup interception, detail-to-detail Next navigation, native navigation to home, native home reservation validation, deep anchors, lazy initial requests, automatic fragment loading, idempotence and a fake GTM context with external transmission intercepted. Static-home checks require the body marker, native UI script, zero framework-script requests and no initial growth runtime. Window state persists between detail pages and resets on home navigation. It writes `.audit/round2/browser-tests.json` and screenshots; `BROWSER_AUDIT_DIR` can select another output directory. The fake ID exists only in intercepted test responses.

The suite also requires the complete inline home stylesheet, three external primary font-face sources, exactly the three expected WOFF2 requests and CORS HTML preloads, loaded computed heading/wordmark fonts, and no external home stylesheet request. Separate 375px and 412px cases await `document.fonts.ready`, compare the viewport and fixed action-bar rectangle through menu opening, resource loading and normal scrolling, and verify styled below-fold editorial copy. These cases do not simulate a delayed CSS request because the full home CSS arrives in the document. Normal scrolled copy is captured with product CSS unchanged. Full-page screenshots temporarily force offscreen rendering, then remove that screenshot-only override; neither product styles nor Lighthouse settings are modified.

Without JavaScript, the page retains its editorial menu content and the placeholder's direct WhatsApp or `/ulasim` information link. The interactive form and route cards are not part of the initial home HTML; they require loading the fragment. The full `/ulasim` page keeps its server-rendered route matrix.
