/* 2026 Europe trip handbook — tabs, i18n, checklist, copy, day filters */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LANG_KEY = "trip_lang";
  const CL_KEY = "trip_checklist_v1";
  let lang = localStorage.getItem(LANG_KEY) || "zh";
  if (lang !== "zh" && lang !== "en") lang = "zh";
  let clFilter = "all";

  const dict = () => (window.TRIP_I18N && window.TRIP_I18N[lang]) || {};

  /* Checklist items (aligned with Excel「出發前待辦」) */
  const CHECKLIST = [
    { id: "p0_passport", p: "P0", cat: { zh: "證件簽證", en: "Docs / visa" },
      zh: "六人護照效期與拼音核對（對機票／聖家堂票）",
      en: "Check all 6 passports: validity + spelling vs tickets / Sagrada",
      when: { zh: "出發前 14 天", en: "By 14 days before" }, note: { zh: "影本加密備份", en: "Encrypted copies" } },
    { id: "p0_evisa", p: "P0", cat: { zh: "證件簽證", en: "Docs / visa" },
      zh: "土耳其 e-Visa × 6 申請並下載核准頁",
      en: "Türkiye e-Visa ×6 — apply & save approvals",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "08/11–13 Stopover", en: "11–13 Aug stopover" } },
    { id: "p0_schengen", p: "P0", cat: { zh: "證件簽證", en: "Docs / visa" },
      zh: "再確認 2026 申根／過境規定",
      en: "Re-check 2026 Schengen / entry rules",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "官方資訊", en: "Official sources" } },
    { id: "p0_oceanready", p: "P0", cat: { zh: "郵輪", en: "Cruise" },
      zh: "Princess OceanReady® 線上報到（六人）",
      en: "Princess OceanReady® online check-in (all 6)",
      when: { zh: "出發前 7–14 天", en: "7–14 days before" }, note: { zh: "護照、緊急聯絡", en: "Passport & emergency contacts" } },
    { id: "p0_tags", p: "P0", cat: { zh: "郵輪", en: "Cruise" },
      zh: "列印／下載行李吊牌 Luggage Tags",
      en: "Print / save luggage tags",
      when: { zh: "出發前 3 天", en: "By 3 days before" }, note: { zh: "大件行李", en: "Checked bags" } },
    { id: "p0_medallion", p: "P0", cat: { zh: "郵輪", en: "Cruise" },
      zh: "確認 Medallion 寄送或碼頭領；下載 Princess App",
      en: "Medallion mail-or-pickup plan + Princess App",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "勿放託運", en: "Not in checked bag" } },
    { id: "p0_cruise_pdf", p: "P0", cat: { zh: "郵輪", en: "Cruise" },
      zh: "補齊郵輪確認信（艙房號、確認號）",
      en: "Save cruise confirmation (cabin + booking no.)",
      when: { zh: "出發前 14 天", en: "By 14 days before" }, note: { zh: "PDF 備份", en: "PDF backup" } },
    { id: "p0_checkin", p: "P0", cat: { zh: "航空", en: "Flights" },
      zh: "土航線上報到 + 再查航班／航廈",
      en: "TK online check-in + recheck flights/terminals",
      when: { zh: "出發前 24–72 小時", en: "24–72h before" }, note: "PNR TFFSDH" },
    { id: "p0_airport", p: "P0", cat: { zh: "航空", en: "Flights" },
      zh: "07/30 提前 ≥3 小時到桃園 T2",
      en: "30 Jul: arrive TPE T2 ≥3 hours early",
      when: { zh: "出發當天", en: "Departure day" }, note: "TK0125 09:35" },
    { id: "p1_ath_transfer", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "ATH 機場 → ibis Styles 8–9 人座（07/30 晚）",
      en: "ATH airport → ibis Styles van (30 Jul evening)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "20:30 抵 ATH", en: "Arrive ATH 20:30" } },
    { id: "p1_piraeus", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "雅典 → 派里厄斯 Terminal B／Gate E12（08/01，15:00 前）",
      en: "Athens → Piraeus Terminal B / Gate E12 (01 Aug, by 15:00)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "登船", en: "Embark" } },
    { id: "p1_santorini", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "聖托里尼包車 ± Water Taxi（08/02）",
      en: "Santorini private car ± water taxi (02 Aug)",
      when: { zh: "出發前 7–14 天", en: "7–14 days before" }, note: { zh: "16:30 前回程", en: "Return queue by 16:30" } },
    { id: "p1_sicily", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "西西里陶爾米納交通（火車或包車，08/06）",
      en: "Sicily/Taormina transport — train or car (06 Aug)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "16:00 啟航", en: "Sail 16:00" } },
    { id: "p1_bcn_port", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "巴塞港口 D/E → Tres Torres（08/08 ~09:00）",
      en: "BCN port D/E → Tres Torres (~09:00 on 08 Aug)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "下船", en: "Disembark" } },
    { id: "p1_bcn_airport", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "巴塞 → BCN 機場（08/11 早）",
      en: "Barcelona → BCN airport (11 Aug morning)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: "TK1854 12:10" },
    { id: "p1_ist_in", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "IST 機場 → Eresin Topkapi（08/11 晚，必訂）",
      en: "IST airport → Eresin Topkapi (11 Aug — must prebook)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "防坑車", en: "Avoid taxi scams" } },
    { id: "p1_ist_out", p: "P1", cat: { zh: "包車", en: "Transfers" },
      zh: "Eresin → IST 機場（08/13 午）",
      en: "Eresin → IST airport (13 Aug midday)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: "TK0124 15:50" },
    { id: "p1_batllo", p: "P1", cat: { zh: "門票", en: "Tickets" },
      zh: "巴特略之家 約 13:30（08/08）",
      en: "Casa Batlló ~13:30 (08 Aug)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "銜接聖家堂 16:30", en: "Before Sagrada 16:30" } },
    { id: "p1_hagia", p: "P1", cat: { zh: "門票", en: "Tickets" },
      zh: "聖索菲亞電子票（08/12）",
      en: "Hagia Sophia e-ticket (12 Aug)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "官網購", en: "Official site" } },
    { id: "p1_museum", p: "P1", cat: { zh: "門票", en: "Tickets" },
      zh: "（可選）衛城博物館票約 €20（07/31）",
      en: "(Optional) Acropolis Museum ~€20 (31 Jul)",
      when: { zh: "出發前或現場", en: "Before or on site" }, note: { zh: "暑期建議先買", en: "Better prebook in summer" } },
    { id: "p1_ist_plan", p: "P1", cat: { zh: "決策", en: "Decide" },
      zh: "08/12 伊斯坦堡方案 A 經典 / B 夜間音樂會",
      en: "12 Aug Istanbul Plan A classic / B night concert",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "B 約 €70–75/人", en: "B ~€70–75/pp" } },
    { id: "p1_santo_mode", p: "P1", cat: { zh: "決策", en: "Decide" },
      zh: "聖托里尼：纜車 vs Water Taxi 定案",
      en: "Santorini: cable car vs water taxi decision",
      when: { zh: "出發前 7–14 天", en: "7–14 days before" }, note: { zh: "與包車一併", en: "With car booking" } },
    { id: "p1_bar", p: "P1", cat: { zh: "決策", en: "Decide" },
      zh: "巴爾是否只逛老城（或冒險去科托）",
      en: "Bar: old town only or attempt Kotor?",
      when: { zh: "出發前", en: "Before trip" }, note: { zh: "時間緊", en: "Tight timing" } },
    { id: "p1_package", p: "P1", cat: { zh: "郵輪消費", en: "Cruise spend" },
      zh: "是否加購飲料／網路／確認服務費",
      en: "Drinks / Wi‑Fi packages + gratuity rules",
      when: { zh: "出發前或登船日", en: "Before or embark day" }, note: { zh: "App 或櫃檯", en: "App or Guest Services" } },
    { id: "p2_insurance", p: "P2", cat: { zh: "保險裝備", en: "Gear" },
      zh: "旅行保險（醫療＋行李）",
      en: "Travel insurance (medical + bags)",
      when: { zh: "出發前 7 天", en: "By 7 days before" }, note: { zh: "保單電子檔", en: "Policy PDF" } },
    { id: "p2_cash", p: "P2", cat: { zh: "保險裝備", en: "Gear" },
      zh: "歐元現金小鈔（含雅典 €60、巴塞 €138.60）",
      en: "EUR cash (incl. Athens €60 + BCN tax €138.60)",
      when: { zh: "出發前 3 天", en: "By 3 days before" }, note: { zh: "現場必付", en: "Must pay on site" } },
    { id: "p2_adapter", p: "P2", cat: { zh: "保險裝備", en: "Gear" },
      zh: "轉接頭 Type C/F、藥、暈船藥、行動電源",
      en: "Adapter C/F, meds, motion sickness, power bank",
      when: { zh: "出發前 3 天", en: "By 3 days before" }, note: { zh: "隨身", en: "Carry-on" } },
    { id: "p2_offline", p: "P2", cat: { zh: "文件", en: "Files" },
      zh: "機票／住宿／門票 PDF 離線備份",
      en: "Offline PDFs: flights, hotels, tickets",
      when: { zh: "出發前 3 天", en: "By 3 days before" }, note: { zh: "含網頁 EN 海關頁", en: "Incl. EN customs view" } },
    { id: "p2_privacy", p: "P2", cat: { zh: "文件", en: "Files" },
      zh: "（可選）公開網頁敏感資料遮碼或改 private",
      en: "(Optional) redact public site or make repo private",
      when: { zh: "出發前", en: "Before trip" }, note: { zh: "PNR/PIN/票號", en: "PNR/PIN/ticket nos." } },
    { id: "site_athens60", p: "現場", cat: { zh: "現場付款", en: "Pay on site" },
      zh: "雅典 ibis 尾款 €60",
      en: "Athens ibis balance €60",
      when: { zh: "07/30 check-in", en: "30 Jul check-in" }, note: { zh: "不可退改", en: "Non-refundable rate" } },
    { id: "site_bcn_tax", p: "現場", cat: { zh: "現場付款", en: "Pay on site" },
      zh: "巴塞隆納城市稅 €138.60",
      en: "Barcelona city tax €138.60",
      when: { zh: "08/08–11", en: "08–11 Aug" }, note: { zh: "約 TWD 5,094", en: "~TWD 5,094" } },
    { id: "site_muster", p: "現場", cat: { zh: "郵輪", en: "Cruise" },
      zh: "08/01 安全演練 Muster 必到",
      en: "01 Aug muster / safety drill (mandatory)",
      when: { zh: "登船日", en: "Embark day" }, note: { zh: "App/船上通知", en: "App / ship notice" } },
    { id: "site_settle", p: "現場", cat: { zh: "郵輪", en: "Cruise" },
      zh: "下船前結清艙房帳、確認行李標色／時段",
      en: "Settle folio; confirm luggage tag color/time",
      when: { zh: "08/07 晚–08/08", en: "07–08 Aug" }, note: { zh: "護照隨身", en: "Passport on you" } },
  ];

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
    const jump = e.target.closest("[data-tab-jump]");
    if (jump) {
      e.preventDefault();
      showTab(jump.getAttribute("data-tab-jump"));
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

    $$(".lang-zh").forEach((el) => {
      el.hidden = lang !== "zh";
    });
    $$(".lang-en").forEach((el) => {
      el.hidden = lang !== "en";
    });

    if (fabToday) fabToday.textContent = t.fab_today || "Today";
    buildDayNav();
    renderChecklist();
  }

  $$(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.langSet));
  });

  /* ---------- Tabs ---------- */
  const navBtns = $$(".nav-btn");
  const panels = $$(".panel");
  const VALID_TABS = ["home", "flights", "hotels", "days", "tickets", "cruise", "checklist", "tips"];

  function showTab(id) {
    if (!VALID_TABS.includes(id)) id = "home";
    navBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
    panels.forEach((p) => p.classList.toggle("active", p.id === "panel-" + id));
    if (id === "days") {
      buildDayNav();
      highlightToday();
    }
    if (id === "checklist") renderChecklist();
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
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "day-pill";
      pill.dataset.target = card.id;
      pill.innerHTML = `<strong>${mmdd.slice(3)}</strong><span>${mmdd}</span>`;
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

  /* ---------- Checklist ---------- */
  function loadChecks() {
    try {
      return JSON.parse(localStorage.getItem(CL_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveChecks(map) {
    localStorage.setItem(CL_KEY, JSON.stringify(map));
  }

  function prioBadgeClass(p) {
    if (p === "P0") return "badge-danger-soft";
    if (p === "P1") return "badge-warn";
    if (p === "P2") return "badge-info";
    return "badge-soft";
  }

  function renderChecklist() {
    const root = $("#checklist-root");
    const progress = $("#cl-progress");
    if (!root) return;
    const t = dict();
    const checks = loadChecks();
    const items = clFilter === "all" ? CHECKLIST : CHECKLIST.filter((i) => i.p === clFilter);

    const doneCount = CHECKLIST.filter((i) => checks[i.id]).length;
    if (progress) progress.textContent = `${doneCount}/${CHECKLIST.length}`;

    // group by priority order
    const order = ["P0", "P1", "P2", "現場"];
    const groups = {};
    order.forEach((p) => (groups[p] = []));
    items.forEach((i) => {
      if (!groups[i.p]) groups[i.p] = [];
      groups[i.p].push(i);
    });

    root.innerHTML = "";
    order.forEach((p) => {
      const list = groups[p];
      if (!list || !list.length) return;
      const section = document.createElement("div");
      section.className = "cl-group";
      const titles = {
        P0: lang === "en" ? "P0 · Must complete" : "P0 · 必須完成",
        P1: lang === "en" ? "P1 · Strongly recommended" : "P1 · 強烈建議出發前完成",
        P2: lang === "en" ? "P2 · Suggested" : "P2 · 建議",
        現場: lang === "en" ? "On site" : "現場",
      };
      section.innerHTML = `<h4>${titles[p] || p}</h4>`;
      list.forEach((item) => {
        const done = !!checks[item.id];
        const row = document.createElement("label");
        row.className = "cl-item" + (done ? " done" : "");
        row.dataset.clId = item.id;
        const title = lang === "en" ? item.en : item.zh;
        const cat = lang === "en" ? item.cat.en : item.cat.zh;
        const when = typeof item.when === "string" ? item.when : item.when[lang] || item.when.zh;
        const note = typeof item.note === "string" ? item.note : item.note[lang] || item.note.zh;
        row.innerHTML = `
          <input type="checkbox" ${done ? "checked" : ""} data-cl-check="${item.id}" />
          <div>
            <div class="cl-meta">
              <span class="badge ${prioBadgeClass(item.p)}">${item.p}</span>
              <span class="badge badge-soft">${cat}</span>
            </div>
            <p class="cl-title">${title}</p>
            <p class="cl-detail"><strong>${t.cl_when || "When"}:</strong> ${when}
              ${note ? ` · <strong>${t.cl_note || "Notes"}:</strong> ${note}` : ""}</p>
          </div>`;
        section.appendChild(row);
      });
      root.appendChild(section);
    });
  }

  document.addEventListener("change", (e) => {
    const box = e.target.closest("[data-cl-check]");
    if (!box) return;
    const id = box.getAttribute("data-cl-check");
    const map = loadChecks();
    map[id] = box.checked;
    saveChecks(map);
    renderChecklist();
    toast(dict().cl_done_toast || "Saved");
  });

  $$("#cl-filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      clFilter = chip.dataset.clFilter || "all";
      $$("#cl-filters .chip").forEach((c) => c.classList.toggle("active", c === chip));
      renderChecklist();
    });
  });

  const clReset = $("#cl-reset");
  if (clReset) {
    clReset.addEventListener("click", () => {
      if (!confirm(lang === "en" ? "Clear all checklist ticks?" : "確定清除所有勾選？")) return;
      saveChecks({});
      renderChecklist();
      toast(dict().cl_reset_toast || "Cleared");
    });
  }

  const clPrint = $("#cl-print");
  if (clPrint) {
    clPrint.addEventListener("click", () => {
      showTab("checklist");
      // ensure all priorities visible when printing
      clFilter = "all";
      $$("#cl-filters .chip").forEach((c) => c.classList.toggle("active", c.dataset.clFilter === "all"));
      renderChecklist();
      setTimeout(() => window.print(), 100);
    });
  }

  /* ---------- Hash routing ---------- */
  function applyHash() {
    const hash = (location.hash || "#home").replace("#", "");
    showTab(VALID_TABS.includes(hash) ? hash : "home");
  }

  window.addEventListener("hashchange", applyHash);

  /* ---------- Init ---------- */
  applyLang(lang);
  highlightToday();
  applyHash();
})();
