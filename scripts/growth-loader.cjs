/* Deferred, same-origin HTML tools. Searchable editorial pages remain server rendered. */
(function () {
  "use strict";
  var script = document.currentScript || document.querySelector('script[src^="/growth-loader.js"]');
  var gtm = script && script.getAttribute("data-gtm-id") || "";
  var ga4 = script && script.getAttribute("data-ga4-id") || "";
  var runtime;
  var pending = new WeakMap();
  var styles = {};
  function css(name) {
    if (styles[name]) return styles[name];
    return styles[name] = new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet"; link.href = "/performance/ui/" + name + ".css";
      link.onload = resolve; link.onerror = function () { delete styles[name]; link.remove(); reject(new Error("Stil yüklenemedi")); };
      document.head.appendChild(link);
    });
  }
  function ensureRuntime() {
    if (runtime) return runtime;
    return runtime = new Promise(function (resolve, reject) {
      var node = document.createElement("script");
      node.id = "growth-runtime"; node.src = "/growth.js"; node.async = true;
      node.setAttribute("data-gtm-id", gtm); node.setAttribute("data-ga4-id", ga4);
      node.onload = function () { resolve(window.CanEvimGrowth); };
      node.onerror = function () { runtime = null; node.remove(); reject(new Error("Planlayıcı yüklenemedi")); };
      document.body.appendChild(node);
    });
  }
  function load(section) {
    if (pending.has(section)) return pending.get(section);
    var path = section.getAttribute("data-interactive-src");
    if (!/^\/interactive\/(planner-(breakfast|gozleme|breakfast_grill)|routes)$/.test(path || "")) return Promise.reject(new Error("Geçersiz araç"));
    var isRoute = path.endsWith("/routes");
    var status = section.querySelector("[data-interactive-status]");
    if (status) status.textContent = "Yükleniyor…";
    section.setAttribute("aria-busy", "true");
    var task = Promise.all([
      fetch(path, { credentials: "same-origin" }).then(function (res) { if (!res.ok) throw new Error("Araç yüklenemedi"); return res.text(); }),
      css(isRoute ? "routes" : "interactive"),
      isRoute ? Promise.resolve() : ensureRuntime()
    ]).then(function (parts) {
      var parsed = new DOMParser().parseFromString(parts[0], "text/html");
      var content = parsed.querySelector(isRoute ? ".route-matrix" : ".ce-planner");
      if (!content) throw new Error("Araç bulunamadı");
      content.querySelectorAll("script").forEach(function (node) { node.remove(); });
      section.replaceChildren(document.importNode(content, true));
      section.removeAttribute("aria-labelledby");
      section.setAttribute("data-interactive-loaded", "true");
      section.removeAttribute("aria-busy");
      return section;
    }).catch(function (error) {
      pending.delete(section); section.removeAttribute("aria-busy");
      if (status) status.textContent = "Yüklenemedi. Yeniden deneyebilir veya yukarıdaki bağlantıyı kullanabilirsiniz.";
      throw error;
    });
    pending.set(section, task); return task;
  }
  var observer = "IntersectionObserver" in window ? new IntersectionObserver(function (items) {
    items.forEach(function (item) { if (item.isIntersecting) { observer.unobserve(item.target); load(item.target).catch(function () {}); } });
  }, { rootMargin: "300px" }) : null;
  function scan(root) {
    var items = [];
    if (root.matches && root.matches("[data-interactive-src]")) items.push(root);
    if (root.querySelectorAll) items = items.concat(Array.from(root.querySelectorAll("[data-interactive-src]")));
    items.forEach(function (section) { if (observer && !section.hasAttribute("data-interactive-observed")) { section.setAttribute("data-interactive-observed", ""); observer.observe(section); } });
  }
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-load-interactive]");
    if (button) load(button.closest("[data-interactive-src]")).catch(function () {});
  });
  scan(document);
  new MutationObserver(function (records) { records.forEach(function (record) { record.addedNodes.forEach(function (node) { if (node.nodeType === 1) scan(node); }); }); }).observe(document.body, { childList: true, subtree: true });
  window.CanEvimLoader = { load: load, ensureRuntime: ensureRuntime };
  if (gtm || ga4) ensureRuntime().catch(function () {});
})();
