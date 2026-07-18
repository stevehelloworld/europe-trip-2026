/* 2026 Europe trip handbook — tabs, i18n, copy, day filters */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LANG_KEY = "trip_lang";
  let lang = localStorage.getItem(LANG_KEY) || "zh";
  if (lang !== "zh" && lang !== "en") lang = "zh";

  const dict = () => (window.TRIP_I18N && window.TRIP_I18N[lang]) || {};

  /* ---------- Toast & copy ---------- */
  const toastEl = $("#toast");
  let toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1600);
  }

  async function copyText(text) {
    const t = dict();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast((t.toast_copied || "Copied: ") + text);
    } catch (e) {
      toast(t.toast_copy_fail || "Copy failed");
    }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy]");
    if (btn) {
      e.preventDefault();
      copyText(btn.getAttribute("data-copy"));
    }
  });

  /* ---------- i18n ---------- */
  function applyLang(next) {
    lang = next;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
    document.body.dataset.lang = lang;

    $$(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.langSet === lang));

    const t = dict();
    if (t.meta_title) document.title = t.meta_title;

    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });

    $$("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (t[key] != null) el.setAttribute("title", t[key]);
    });

    // Show/hide language-specific blocks
    $$(".lang-zh").forEach((el) => {
      el.hidden = lang !== "zh";
    });
    $$(".lang-en").forEach((el) => {
      el.hidden = lang !== "en";
    });

    if (fabToday) fabToday.textContent = t.fab_today || "Today";
    buildDayNav();
  }

  $$(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.langSet));
  });

  /* ---------- Tabs ---------- */
  const navBtns = $$(".nav-btn");
  const panels = $$(".panel");

  function showTab(id) {
    navBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
    panels.forEach((p) => p.classList.toggle("active", p.id === "panel-" + id));
    if (id === "days") {
      buildDayNav();
      highlightToday();
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    try {
      history.replaceState(null, "", "#" + id);
    } catch (_) {}
  }

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
  });

  /* ---------- Day filter / nav ---------- */
  const dayCards = $$(".day-card");
  const dayNav = $("#day-nav");
  const phaseChips = $$(".phase-filters .chip");

  function visibleTitle(card) {
    const hZh = card.querySelector("h3.lang-zh");
    const hEn = card.querySelector("h3.lang-en");
    const h = lang === "en" ? hEn || hZh : hZh || hEn;
    return (h && h.textContent) || card.dataset.date || "";
  }

  function buildDayNav() {
    if (!dayNav) return;
    dayNav.innerHTML = "";
    dayCards.forEach((card) => {
      if (card.style.display === "none") return;
      const date = card.dataset.date || "";
      const mmdd = date.slice(5).replace("-", "/");
      const title = visibleTitle(card);
      const short = title.split(/[·•]/)[0].trim().replace(/[（(].*/, "") || mmdd;
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "day-pill";
      pill.dataset.target = card.id;
      const label = short.replace(/^\d{2}\/\d{2}\s*/, "").replace(/^\d{2}\s(Jul|Aug).*/i, mmdd.slice(3)) || mmdd;
      pill.innerHTML = `<strong>${mmdd.slice(3) || short}</strong><span>${mmdd}</span>`;
      if (card.classList.contains("today")) pill.classList.add("today");
      pill.addEventListener("click", () => {
        showTab("days");
        card.classList.remove("collapsed");
        card.scrollIntoView({ behavior: "smooth", block: "start" });
        $$(".day-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
      });
      dayNav.appendChild(pill);
    });
  }

  function filterPhase(phase) {
    phaseChips.forEach((c) => c.classList.toggle("active", c.dataset.phase === phase));
    dayCards.forEach((card) => {
      const phases = (card.dataset.phase || "").split(/\s+/);
      const show = phase === "all" || phases.includes(phase);
      card.style.display = show ? "" : "none";
    });
    buildDayNav();
  }

  phaseChips.forEach((chip) => {
    chip.addEventListener("click", () => filterPhase(chip.dataset.phase));
  });

  dayCards.forEach((card) => {
    const head = card.querySelector(".day-head");
    if (!head) return;
    head.addEventListener("click", () => card.classList.toggle("collapsed"));
  });

  /* ---------- IST plan A/B ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".plan-btn");
    if (!btn) return;
    const wrap = btn.closest(".day-body") || btn.closest(".day-card");
    if (!wrap) return;
    const plan = btn.dataset.plan;
    $$(".plan-btn", wrap).forEach((b) => b.classList.toggle("active", b.dataset.plan === plan));
    $$(".plan-block", wrap).forEach((b) =>
      b.classList.toggle("active", b.dataset.planBlock === plan)
    );
  });

  /* ---------- Today highlight ---------- */
  const fabToday = $("#fab-today");

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function highlightToday() {
    const iso = todayISO();
    let found = null;
    dayCards.forEach((card) => {
      const isToday = card.dataset.date === iso;
      card.classList.toggle("today", isToday);
      if (isToday) found = card;
    });
    if (fabToday) {
      fabToday.classList.toggle("show", !!found);
      fabToday.onclick = () => {
        showTab("days");
        filterPhase("all");
        if (found) {
          found.classList.remove("collapsed");
          setTimeout(() => found.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        }
      };
    }
    buildDayNav();
    return found;
  }

  /* ---------- Hash routing ---------- */
  function applyHash() {
    const hash = (location.hash || "#home").replace("#", "");
    const valid = ["home", "flights", "hotels", "days", "tickets", "cruise", "tips"];
    showTab(valid.includes(hash) ? hash : "home");
  }

  window.addEventListener("hashchange", applyHash);

  /* ---------- Init ---------- */
  applyLang(lang);
  highlightToday();
  applyHash();
})();
