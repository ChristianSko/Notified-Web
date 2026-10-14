(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal on scroll */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Scroll-linked drift for scene devices */
  var drifters = Array.prototype.slice.call(document.querySelectorAll(".parallax"));
  if (drifters.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      drifters.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var progress = Math.min(1, Math.max(-1, (center - vh / 2) / vh));
        el.style.transform = "translateY(" + (progress * 48).toFixed(1) + "px)";
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* Feature list: auto-cycle while visible, hover/focus/tap takes over */
  var list = document.getElementById("feature-list");
  var preview = document.getElementById("feature-preview");
  if (list && preview) {
    var buttons = Array.prototype.slice.call(list.querySelectorAll("button[data-feature]"));
    var panels = Array.prototype.slice.call(preview.querySelectorAll(".feature-panel"));
    var ids = buttons.map(function (b) { return b.getAttribute("data-feature"); });
    var active = ids[0];
    var userTookOver = false;
    var inView = false;
    var timer = null;
    var hideTimer = null;

    var show = function (id) {
      if (id === active) return;
      active = id;
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-feature") === id)); });
      clearTimeout(hideTimer);
      panels.forEach(function (p) {
        var match = p.getAttribute("data-feature") === id;
        if (match) { p.hidden = false; requestAnimationFrame(function () { p.classList.add("is-active"); }); }
        else { p.classList.remove("is-active"); }
      });
      hideTimer = setTimeout(function () {
        panels.forEach(function (p) { if (p.getAttribute("data-feature") !== active) p.hidden = true; });
      }, reduceMotion ? 0 : 750);
    };
    var next = function () { show(ids[(ids.indexOf(active) + 1) % ids.length]); };
    var schedule = function () {
      clearInterval(timer);
      if (userTookOver || reduceMotion || !inView) return;
      timer = setInterval(next, 2800);
    };
    var takeOver = function (id) { userTookOver = true; show(id); schedule(); };

    buttons.forEach(function (b) {
      var id = b.getAttribute("data-feature");
      b.addEventListener("mouseenter", function () { takeOver(id); });
      b.addEventListener("focus", function () { takeOver(id); });
      b.addEventListener("click", function () { takeOver(id); });
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.5 }).observe(preview);
    } else { inView = true; schedule(); }
  }
})();
