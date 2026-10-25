/* Can Evim: progressive planner + consent-gated, best-effort analytics. No dependencies. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) api.mount(root);
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";
  var QUEUE_KEY = "canevim_events_v1";
  var CONSENT_KEY = "canevim_analytics_consent_v1";
  var MAX_EVENTS = 60;
  var MAX_AGE = 24 * 60 * 60 * 1000;
  var CONCEPTS = {
    breakfast: { title: "serpme kahvaltı", products: ["Peynir tabağı, yeşil / siyah / çizik zeytin ve acuka", "Çilek reçeli, portakal reçeli, tereyağı ve bal-kaymak", "Çeri domates ve salatalık", "Pişi, muska börek, sahanda yumurta ve menemen", "Menüde serpme kahvaltıyla sunulan sınırsız çay"] },
    gozleme: { title: "gözleme & çay", products: ["Patatesli gözleme", "Kaşarlı veya beyaz peynirli gözleme", "Pazılı gözleme", "Kıymalı veya sucuklu gözleme", "Çay, fincan çay veya termos çay (menüden ayrı tercih)"] },
    breakfast_grill: { title: "kahvaltı + ızgara", products: ["Serpme kahvaltı: peynir, zeytin, acuka, reçeller, bal-kaymak ve sebzeler", "Kahvaltı sıcakları: pişi, muska börek, sahanda yumurta ve menemen", "Menüde serpme kahvaltıyla sunulan sınırsız çay", "Ayrı öğün tercihi: ızgara köfte, ızgara sucuk veya piliç ızgara", "Menüde ızgara yanında belirtilen pilav, domates ve biber"] }
  };
  var EVENT_NAMES = ["phone_click", "whatsapp_click", "directions_click", "planner_interaction", "menu_click"];
  function bounded(value, fallback, min, max) {
    var number = Number(value);
    return Number.isFinite(number) && String(value).trim() !== "" ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
  }
  function normalisePlan(value) {
    value = value || {};
    return {
      party: ["couple", "family", "group"].indexOf(value.party) >= 0 ? value.party : "couple",
      guests: bounded(value.guests, 2, 1, 100),
      concept: Object.prototype.hasOwnProperty.call(CONCEPTS, value.concept) ? value.concept : "breakfast",
      childArea: Boolean(value.childArea), garden: Boolean(value.garden),
      budget: value.budget === "" || value.budget == null ? null : bounded(value.budget, null, 0, 100000)
    };
  }
  function planProducts(plan) { return CONCEPTS[normalisePlan(plan).concept].products.slice(); }
  function buildMessage(value) {
    var plan = normalisePlan(value);
    var lines = ["Merhaba Can Evim Şile, " + plan.guests + " kişi için " + CONCEPTS[plan.concept].title + " düşünüyoruz."];
    if (plan.childArea) lines.push("Çocuk alanı hakkında bilgi almak istiyoruz.");
    if (plan.garden) lines.push("Bahçede masa uygunluğunu sormak istiyoruz.");
    if (plan.budget !== null) lines.push("Kendi ayırdığımız kişi başı bütçe " + plan.budget + " TL (işletme fiyatı veya teklifi değildir).");
    lines.push("Güncel fiyat, kapsam ve masa uygunluğu bilgisini paylaşabilir misiniz?", "Bu mesaj bir taleptir; rezervasyonun işletme onayıyla kesinleştiğini biliyoruz.");
    return lines.join("\n");
  }
  function budgetText(value) {
    var plan = normalisePlan(value);
    if (plan.budget === null) return "Güncel fiyat için teklif isteyin.";
    return "Sizin bütçe hesabınız: " + (plan.guests * plan.budget).toLocaleString("tr-TR") + " TL toplam (" + plan.guests + " kişi × " + plan.budget.toLocaleString("tr-TR") + " TL). İşletme fiyatı veya teklif değildir.";
  }
  function guestBucket(count) { return count <= 2 ? "1_2" : count <= 5 ? "3_5" : count <= 10 ? "6_10" : "11_plus"; }
  function safeLabel(value) { return typeof value === "string" && /^[a-z0-9_-]{1,64}$/.test(value) ? value : undefined; }
  function sanitizeEvent(name, details) {
    if (EVENT_NAMES.indexOf(name) < 0) return null;
    details = details || {};
    var event = { event: name };
    ["placement", "route_id", "page_type", "action", "concept", "party", "guest_bucket"].forEach(function (key) {
      var label = safeLabel(details[key]);
      if (label) event[key] = label;
    });
    ["child_area", "garden"].forEach(function (key) { if (typeof details[key] === "boolean") event[key] = details[key]; });
    return event;
  }
  /** Durable only after consent. Enqueue first, hand off when ready; no delivery guarantee. */
  function createQueue(options) {
    var storage = options.storage;
    var now = options.now || Date.now;
    var consent = options.consent === true;
    var entries = [];
    function read() {
      try { return JSON.parse(storage.getItem(QUEUE_KEY) || "[]"); } catch (_) { return []; }
    }
    function prune() {
      entries = entries.filter(function (entry) {
        return entry && typeof entry.id === "string" && Number.isFinite(entry.at) && entry.at <= now() && now() - entry.at < MAX_AGE && (entry.attempts || 0) < 20 && sanitizeEvent(entry.data && entry.data.event, entry.data);
      }).slice(-MAX_EVENTS).map(function (entry) {
        return { id: entry.id.slice(0, 80), at: entry.at, attempts: entry.attempts || 0, next: Number.isFinite(entry.next) ? entry.next : 0, data: sanitizeEvent(entry.data.event, entry.data) };
      });
    }
    function persist() {
      try {
        if (consent && entries.length) storage.setItem(QUEUE_KEY, JSON.stringify(entries));
        else storage.removeItem(QUEUE_KEY);
      } catch (_) { /* Private mode/quota: retain this page's in-memory queue. */ }
    }
    if (consent) { entries = read(); if (!Array.isArray(entries)) entries = []; prune(); persist(); }
    else { try { storage.removeItem(QUEUE_KEY); } catch (_) {} }
    function flush() {
      if (!consent) return 0;
      prune();
      var sent = 0;
      if (options.ready()) {
        entries = entries.filter(function (entry) {
          if (entry.next > now()) return true;
          try {
            if (options.send(Object.assign({}, entry.data, { event_id: entry.id })) === false) throw new Error("not ready");
            sent += 1;
            return false;
          } catch (_) {
            entry.attempts += 1;
            entry.next = now() + Math.min(300000, 5000 * Math.pow(2, entry.attempts));
            return true;
          }
        });
      }
      persist();
      return sent;
    }
    return {
      enqueue: function (name, details) {
        var data = sanitizeEvent(name, details);
        if (!consent || !data) return false;
        entries.push({ id: now().toString(36) + "-" + Math.random().toString(36).slice(2, 12), at: now(), attempts: 0, next: 0, data: data });
        prune(); persist(); flush(); return true;
      },
      flush: flush,
      setConsent: function (allowed) { consent = allowed === true; if (!consent) entries = []; persist(); },
      size: function () { prune(); return entries.length; }
    };
  }
  function mount(win) {
    if (win.CanEvimGrowth) { win.CanEvimGrowth.refresh(); return; }
    var doc = win.document;
    var script = doc.currentScript || doc.querySelector('script[src^="/growth.js"]');
    var gtmId = script && script.getAttribute("data-gtm-id") || "";
    var gaId = script && script.getAttribute("data-ga4-id") || "";
    gtmId = /^GTM-[A-Z0-9]+$/.test(gtmId) ? gtmId : "";
    gaId = /^G-[A-Z0-9]+$/.test(gaId) ? gaId : "";
    var configured = Boolean(gtmId || gaId);
    var storage;
    try { storage = win.localStorage; } catch (_) { storage = { getItem: function () {}, setItem: function () {}, removeItem: function () {} }; }
    var consent = null;
    try { var savedConsent = storage.getItem(CONSENT_KEY); if (savedConsent === "granted" || savedConsent === "denied") consent = savedConsent; } catch (_) {}
    var gaReady = false;
    var analyticsLoading = false;
    function ready() {
      if (consent !== "granted" || win.navigator.onLine === false) return false;
      return gtmId ? Boolean(win.google_tag_manager && win.google_tag_manager[gtmId]) : gaReady;
    }
    function send(event) {
      if (!ready()) return false;
      if (gtmId) { win.dataLayer = win.dataLayer || []; win.dataLayer.push(event); }
      else {
        var parameters = Object.assign({}, event);
        delete parameters.event;
        win.gtag("event", event.event, parameters);
      }
      return true;
    }
    var queue = createQueue({ storage: storage, consent: configured && consent === "granted", ready: ready, send: send });
    function gtag() { (win.dataLayer = win.dataLayer || []).push(arguments); }
    function loadAnalytics() {
      if (!configured || consent !== "granted" || analyticsLoading) return;
      analyticsLoading = true;
      win.dataLayer = win.dataLayer || [];
      win.gtag = win.gtag || gtag;
      win.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      var external = doc.createElement("script");
      external.async = true;
      external.onerror = function () { analyticsLoading = false; };
      if (gtmId) {
        win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
        external.src = "https://www.googletagmanager.com/gtm.js?id=" + gtmId;
        external.onload = function () { queue.flush(); };
      } else {
        win["ga-disable-" + gaId] = false;
        external.src = "https://www.googletagmanager.com/gtag/js?id=" + gaId;
        external.onload = function () {
          gaReady = true;
          win.gtag("js", new Date());
          // Do not send page titles, full URLs, query strings or automatic form/link data.
          win.gtag("config", gaId, { send_page_view: false, page_location: "https://www.canevimsile.com/", page_referrer: "", page_title: "Can Evim Şile", allow_google_signals: false, allow_ad_personalization_signals: false });
          queue.flush();
        };
      }
      doc.head.appendChild(external);
    }
    function consentUi() {
      doc.querySelectorAll("[data-growth-consent]").forEach(function (panel) { panel.hidden = !configured || consent !== null; });
      doc.querySelectorAll("[data-consent-settings]").forEach(function (button) { button.hidden = !configured; });
    }
    function setConsent(allowed) {
      allowed = allowed === true;
      consent = allowed ? "granted" : "denied";
      try { storage.setItem(CONSENT_KEY, consent); } catch (_) {}
      queue.setConsent(configured && allowed);
      if (gaId) win["ga-disable-" + gaId] = !allowed;
      if (win.gtag) win.gtag("consent", "update", { analytics_storage: allowed ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      if (allowed) { loadAnalytics(); queue.flush(); }
      consentUi();
    }
    function pageType() {
      var path = win.location.pathname;
      if (path === "/") return "home";
      if (path === "/menu") return "menu";
      if (/gozleme/.test(path)) return "gozleme";
      if (/kahvalti/.test(path)) return "breakfast";
      if (/restoran/.test(path)) return "restaurant";
      if (/doga/.test(path)) return "nature";
      return "other";
    }
    function track(name, details) { return queue.enqueue(name, Object.assign({ page_type: pageType() }, details)); }
    function selection(form) {
      function field(name) { return form.querySelector('[name="' + name + '"]'); }
      var party = form.querySelector('[name="party"]:checked');
      var concept = form.querySelector('[name="concept"]:checked');
      return normalisePlan({ party: party && party.value, guests: field("guests").value, concept: concept && concept.value, childArea: field("child_area").checked, garden: field("garden").checked, budget: field("budget").value });
    }
    function updatePlanner(form) {
      var section = form.closest(".ce-planner");
      if (!section) return;
      var plan = selection(form);
      section.querySelector("[data-planner-heading]").textContent = plan.guests + " kişilik " + CONCEPTS[plan.concept].title;
      var list = section.querySelector("[data-planner-products]");
      // Every concept intentionally uses five SSR list items. Preserve these
      // host nodes so later Next navigation can reconcile them safely.
      planProducts(plan).forEach(function (product, index) {
        if (list.children[index]) list.children[index].textContent = product;
      });
      var extras = [];
      if (plan.childArea) extras.push("Çocuk alanı hakkında bilgi talebi");
      if (plan.garden) extras.push("Bahçede masa uygunluğu sorusu");
      section.querySelector("[data-planner-extras]").textContent = extras.length ? extras.join(" · ") + ". İşletmeden teyit istenir." : "Özel bir uygunluk sorusu seçilmedi.";
      section.querySelector("[data-planner-budget]").textContent = budgetText(plan);
      form.querySelector("[data-planner-message]").value = buildMessage(plan);
    }
    function plannerDetails(form, action) {
      var plan = selection(form);
      return { placement: "planner", action: action, concept: plan.concept, party: plan.party, guest_bucket: guestBucket(plan.guests), child_area: plan.childArea, garden: plan.garden };
    }
    function refresh() {
      doc.querySelectorAll("[data-breakfast-planner]").forEach(function (form) {
        // SSR already contains the correct initial concept and product list.
        // Keep its text/comment nodes intact while React hydrates. A property
        // avoids adding an unexpected HTML attribute before hydration as well.
        if (form.__growthReady) return;
        form.__growthReady = true;
      });
      consentUi();
    }
    doc.addEventListener("input", function (event) {
      var form = event.target.closest && event.target.closest("[data-breakfast-planner]");
      if (form) updatePlanner(form);
    });
    doc.addEventListener("change", function (event) {
      var form = event.target.closest && event.target.closest("[data-breakfast-planner]");
      if (!form) return;
      if (event.target.name === "party") {
        var guests = { couple: 2, family: 4, group: 8 }[event.target.value];
        if (guests) form.querySelector('[name="guests"]').value = guests;
      }
      updatePlanner(form);
      track("planner_interaction", plannerDetails(form, safeLabel(event.target.name) || "selection"));
    });
    doc.addEventListener("submit", function (event) {
      var form = event.target.closest && event.target.closest("[data-breakfast-planner]");
      if (!form) return;
      if (!form.checkValidity()) { event.preventDefault(); form.reportValidity(); return; }
      event.preventDefault();
      updatePlanner(form);
      track("planner_interaction", plannerDetails(form, "request"));
      track("whatsapp_click", { placement: "planner", action: "reservation_request" });
      win.open("https://wa.me/905374975062?text=" + encodeURIComponent(buildMessage(selection(form))), "_blank", "noopener,noreferrer");
    });
    doc.addEventListener("click", function (event) {
      var target = event.target.closest && event.target.closest("[data-consent-choice], [data-consent-settings], a[href]");
      if (!target) return;
      if (target.hasAttribute("data-consent-choice")) { setConsent(target.getAttribute("data-consent-choice") === "granted"); return; }
      if (target.hasAttribute("data-consent-settings")) { doc.querySelectorAll("[data-growth-consent]").forEach(function (panel) { panel.hidden = !panel.hidden; }); return; }
      var href = target.getAttribute("href") || "";
      var name = /^tel:/i.test(href) ? "phone_click" : /^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href) ? "whatsapp_click" : /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+\/)/i.test(href) ? "directions_click" : /^\/menu(?:$|#|\?)/.test(href) ? "menu_click" : null;
      if (!name) return;
      var placement = target.closest("[data-growth-location], [data-location]");
      track(name, { placement: safeLabel(target.getAttribute("data-growth-location")) || (placement && safeLabel(placement.getAttribute("data-growth-location") || placement.getAttribute("data-location"))) || "site", route_id: safeLabel(target.getAttribute("data-route-id")) });
    });
    win.addEventListener("online", function () { loadAnalytics(); queue.flush(); });
    win.addEventListener("storage", function (event) {
      if (event.key === CONSENT_KEY) setConsent(event.newValue === "granted");
    });
    win.addEventListener("pagehide", function () { queue.flush(); });
    doc.addEventListener("visibilitychange", function () { if (doc.visibilityState === "visible") { loadAnalytics(); queue.flush(); } });
    win.setInterval(function () { if (doc.visibilityState !== "hidden") queue.flush(); }, 5000);
    if (win.MutationObserver) {
      new win.MutationObserver(function (records) {
        if (records.some(function (record) { return Array.from(record.addedNodes).some(function (node) { return node.nodeType === 1 && (node.matches("[data-breakfast-planner], [data-growth-consent]") || node.querySelector("[data-breakfast-planner], [data-growth-consent]")); }); })) refresh();
      }).observe(doc.body, { childList: true, subtree: true });
    }
    win.CanEvimGrowth = { version: "1.0.0", track: track, setConsent: setConsent, getConsent: function () { return consent; }, flush: queue.flush, refresh: refresh };
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", refresh, { once: true });
    else refresh();
    loadAnalytics();
  }
  return { normalisePlan: normalisePlan, planProducts: planProducts, buildMessage: buildMessage, budgetText: budgetText, guestBucket: guestBucket, sanitizeEvent: sanitizeEvent, createQueue: createQueue, mount: mount };
});
