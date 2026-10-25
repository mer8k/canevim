import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const growth = require("../public/growth.js");

const groups = { couple: 2, family: 4, group: 8 };
for (const [party, guests] of Object.entries(groups)) {
  for (const concept of ["breakfast", "gozleme", "breakfast_grill"]) {
    const plan = { party, guests, concept, garden: true, childArea: true, budget: 500 };
    const message = growth.buildMessage(plan);
    assert.match(message, new RegExp(`${guests} kişi`));
    assert.match(message, /işletme onayıyla kesinleştiğini/);
    assert.match(message, /işletme fiyatı veya teklifi değildir/);
    assert.match(message, /Çocuk alanı hakkında bilgi/);
    assert.match(message, /Bahçede masa uygunluğunu/);
    assert.equal(growth.planProducts(plan).length, 5);
    assert.ok(growth.budgetText(plan).includes((guests * 500).toLocaleString("tr-TR")));
  }
}
assert.equal(growth.normalisePlan({ guests: "wrong", concept: "prototype" }).guests, 2);
assert.equal(growth.normalisePlan({ guests: -4 }).guests, 1);
assert.equal(growth.normalisePlan({ guests: 101 }).guests, 100);
assert.equal(growth.normalisePlan({ budget: "" }).budget, null);
assert.equal(growth.budgetText({}), "Güncel fiyat için teklif isteyin.");
assert.equal(growth.guestBucket(12), "11_plus");
assert.equal(growth.sanitizeEvent("arbitrary", {}), null);
const sanitized = growth.sanitizeEvent("whatsapp_click", { placement: "planner", name: "PRIVATE NAME", date: "2026-10-24", url: "https://site.test/?name=private", text: "PRIVATE MESSAGE", budget: 1234, concept: "breakfast", route_id: "kadikoy", action: "https://leak.test/" });
assert.deepEqual(sanitized, { event: "whatsapp_click", placement: "planner", route_id: "kadikoy", concept: "breakfast" });

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
let clock = 100000;
let ready = false;
let shouldThrow = false;
const delivered = [];
const storage = memoryStorage();
const options = { storage, now: () => clock, consent: false, ready: () => ready, send: value => { if (shouldThrow) throw Error("transport unavailable"); delivered.push(value); } };
let queue = growth.createQueue(options);
assert.equal(queue.enqueue("phone_click", {}), false, "No collection without consent");
assert.equal(storage.getItem("canevim_events_v1"), null);
queue.setConsent(true);
for (let index = 0; index < 80; index++) queue.enqueue("directions_click", { route_id: "kadikoy", url: "PRIVATE URL" });
assert.equal(queue.size(), 60, "Bounded queue keeps latest 60 events while GTM unavailable");
assert.equal(JSON.parse(storage.getItem("canevim_events_v1")).length, 60);
assert.ok(!storage.getItem("canevim_events_v1").includes("PRIVATE"));
queue = growth.createQueue({ ...options, consent: true });
assert.equal(queue.size(), 60, "Queue survives reload");
ready = true;
shouldThrow = true;
assert.equal(queue.flush(), 0);
shouldThrow = false;
assert.equal(queue.flush(), 0, "Transport exceptions use backoff");
clock += 10001;
assert.equal(queue.flush(), 60);
assert.equal(delivered.length, 60);
assert.ok(delivered.every(value => typeof value.event_id === "string"));
assert.equal(storage.getItem("canevim_events_v1"), null);
assert.equal(queue.flush(), 0, "No repeat after successful handoff");
ready = false;
queue.enqueue("phone_click", {});
clock += 24 * 60 * 60 * 1000 + 1;
assert.equal(queue.size(), 0, "Expired events are discarded");
queue.enqueue("phone_click", {});
queue.setConsent(false);
assert.equal(queue.size(), 0, "Revocation removes pending events");
assert.equal(storage.getItem("canevim_events_v1"), null);
const failingStorage = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
const privateQueue = growth.createQueue({ ...options, storage: failingStorage, consent: true });
assert.equal(privateQueue.enqueue("phone_click", {}), true, "Private storage failure retains an in-memory fallback");
assert.equal(privateQueue.size(), 1);

function fakeBrowser(config = {}) {
  const listeners = {};
  const externalScripts = [];
  const doc = {
    currentScript: { getAttribute: key => config[key] || "" },
    querySelectorAll: () => [], querySelector: () => null,
    addEventListener: (name, callback) => { listeners[`doc:${name}`] = callback; },
    createElement: () => ({}),
    head: { appendChild: script => { externalScripts.push(script); script.onload?.(); } },
    body: {}, readyState: "complete", visibilityState: "visible",
  };
  return {
    document: doc, localStorage: memoryStorage(), navigator: { onLine: true },
    location: { pathname: "/", href: "https://www.canevimsile.com/?private=secret" },
    addEventListener: (name, callback) => { listeners[name] = callback; },
    setInterval: () => 0, externalScripts, listeners,
  };
}
const browser = fakeBrowser({ "data-ga4-id": "G-TEST1234" });
growth.mount(browser);
assert.equal(browser.externalScripts.length, 0, "No Google script before consent");
assert.equal(browser.CanEvimGrowth.track("phone_click", {}), false);
browser.CanEvimGrowth.setConsent(true);
assert.equal(browser.externalScripts.length, 1);
assert.equal(browser["ga-disable-G-TEST1234"], false);
assert.equal(browser.CanEvimGrowth.track("phone_click", { name: "PRIVATE", url: browser.location.href }), true);
const firstEvent = Array.from(browser.dataLayer.find(item => Array.from(item)[0] === "event"));
assert.deepEqual(Object.keys(firstEvent[2]).sort(), ["event_id", "page_type"]);
const gaConfig = Array.from(browser.dataLayer.find(item => Array.from(item)[0] === "config"))[2];
assert.equal(gaConfig.page_location, "https://www.canevimsile.com/");
assert.equal(gaConfig.send_page_view, false);
browser.CanEvimGrowth.setConsent(false);
assert.equal(browser["ga-disable-G-TEST1234"], true);
assert.equal(browser.CanEvimGrowth.track("phone_click", {}), false);
browser.CanEvimGrowth.setConsent(true);
assert.equal(browser["ga-disable-G-TEST1234"], false, "Consent can be granted again after revocation");
assert.equal(browser.externalScripts.length, 1, "Regrant does not load duplicate analytics script");
const consentUpdates = browser.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "consent");
assert.equal(consentUpdates.at(-1)[2].analytics_storage, "granted");
browser.listeners.storage({ key: "canevim_analytics_consent_v1", newValue: "denied" });
assert.equal(browser.CanEvimGrowth.getConsent(), "denied", "Revocation in another tab is honored");
const noAnalytics = fakeBrowser();
growth.mount(noAnalytics);
noAnalytics.CanEvimGrowth.setConsent(true);
assert.equal(noAnalytics.CanEvimGrowth.track("phone_click", {}), false, "No event queue without an analytics destination");
assert.equal(noAnalytics.externalScripts.length, 0);
console.log("PASS: planner variants, honest budget/message, privacy allowlist, consent/regrant/cross-tab, bounded durable queue, retry/expiry, restricted storage, gated GA4 loader and safe page data");
