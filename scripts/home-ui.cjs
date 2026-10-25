/* Native interactions for the static landing document. No framework runtime. */
(function () {
  "use strict";
  document.querySelectorAll("link[data-deferred-styles]").forEach(function (link) {
    function applyStyles() { link.media = "all"; link.setAttribute("data-style-ready", "true"); }
    if (link.sheet) applyStyles();
    else link.addEventListener("load", applyStyles, { once: true });
  });
  var button = document.getElementById("menu-toggle");
  var menu = document.getElementById("site-menu");
  var header = button && button.closest("header");
  var opened = false, lastY = window.scrollY, previousOverflow = "";
  function toggle(next) {
    opened = next;
    button.setAttribute("aria-expanded", String(next));
    button.setAttribute("aria-label", next ? "Menüyü kapat" : "Menüyü aç");
    menu.setAttribute("aria-hidden", String(!next)); menu.inert = !next;
    menu.style.opacity = next ? "1" : "0"; menu.style.visibility = next ? "visible" : "hidden";
    header.style.background = next || window.scrollY > 30 ? "#213326" : "";
    header.style.transform = "translateY(0)";
    if (next) { previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = previousOverflow; button.focus({ preventScroll: true }); }
    var bars = button.querySelectorAll("span");
    bars[0].style.transform = next ? "translateY(6.5px) rotate(45deg)" : "";
    bars[1].style.opacity = next ? "0" : "1";
    bars[2].style.transform = next ? "translateY(-6.5px) rotate(-45deg)" : "";
  }
  if (button && menu) {
    button.addEventListener("click", function () { toggle(!opened); });
    menu.addEventListener("click", function (event) { if (event.target.closest("a")) toggle(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && opened) toggle(false);
      if (event.key === "Tab" && opened) {
        var focusable = [button].concat(Array.from(menu.querySelectorAll("a[href],button")));
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      header.style.background = opened || y > 30 ? "#213326" : "";
      header.style.transform = opened || y < 10 || y < lastY ? "translateY(0)" : "translateY(-100%)";
      lastY = y;
    }, { passive: true });
  }
  var form = document.querySelector('form[data-growth-location="reservation_form"]');
  if (form) form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var name = form.elements.name.value.trim(), date = form.elements.date.value.split("-");
    var text = "Merhaba Can Evim, ben " + name + ". " + date[2] + "/" + date[1] + "/" + date[0] + " tarihi için masa uygunluğunu sormak istiyorum. Rezervasyonun işletme onayıyla kesinleştiğini biliyorum.";
    if (window.CanEvimGrowth) window.CanEvimGrowth.track("whatsapp_click", { placement: "reservation_form", action: "reservation_request" });
    window.open("https://wa.me/905374975062?text=" + encodeURIComponent(text), "_blank", "noopener,noreferrer");
  });
})();
