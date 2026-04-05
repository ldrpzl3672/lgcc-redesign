// LGCC site script.js

(function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Smooth scroll (basic)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });

  // Demo form handler (no backend)
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (note) {
        note.textContent =
          "Demo mode: form not connected yet. Hook to Formspree/Netlify Forms before launch.";
      }
      form.reset();
    });
  }
})();


// == UPCOMING EVENTS ==========================================================
// Loads /data/upcoming-events.json and renders cards into #upcomingEventsContainer
// Section starts hidden; shown only when events exist.
(function () {
  var BASE_URL = "https://www.lebanongolfandcountryclub.com";

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      var parts = dateStr.split("-");
      var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
      });
    } catch (e) { return dateStr; }
  }

  function safe(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function buildCard(ev) {
    var bannerHtml = "";
    if (ev.banner_url) {
      bannerHtml = [
        '<div class="upcoming-card-banner">',
          '<img src="' + safe(ev.banner_url) + '"',
          ' alt="' + safe(ev.event_name || ev.title) + '"',
          ' loading="lazy"',
          ' onerror="this.parentElement.style.display='none'">',
        '</div>'
      ].join("");
    }

    var meta = [];
    if (ev.event_type) meta.push(safe(ev.event_type));
    if (ev.format_label) meta.push(safe(ev.format_label));

    var rawDesc = ev.description || "";
    var summary = rawDesc
      ? safe(rawDesc.length > 120 ? rawDesc.slice(0, 117) + "..." : rawDesc)
      : "Join us for this upcoming club event.";

    var detailUrl = ev.url
      ? (ev.url.startsWith("http") ? ev.url : BASE_URL + ev.url)
      : "#";

    return [
      '<article class="upcoming-card">',
        bannerHtml,
        '<div class="upcoming-card-body">',
          '<p class="upcoming-card-date">' + formatDate(ev.event_date) + '</p>',
          '<h3 class="upcoming-card-title">' + safe(ev.event_name || ev.title) + '</h3>',
          meta.length ? '<p class="upcoming-card-meta">' + meta.join(" &bull; ") + '</p>' : '',
          '<p class="upcoming-card-summary">' + summary + '</p>',
          '<a class="btn btn-sm btn-outline" href="' + safe(detailUrl) + '">View Details &rarr;</a>',
        '</div>',
      '</article>'
    ].join("");
  }

  function renderUpcoming(events, container) {
    var section = container.closest ? container.closest("section") : null;
    container.innerHTML = "";

    if (!events || events.length === 0) {
      if (section) section.style.display = "none";
      return;
    }

    // Sort soonest first
    var sorted = events.slice().sort(function (a, b) {
      return (a.event_date || "").localeCompare(b.event_date || "");
    });

    container.innerHTML = sorted.map(buildCard).join("");
    if (section) section.style.display = "";
  }

  function init() {
    var container = document.getElementById("upcomingEventsContainer");
    if (!container) return;

    // Hide section until we know there are events
    var section = container.closest ? container.closest("section") : null;
    if (section) section.style.display = "none";

    fetch("/data/upcoming-events.json?v=" + Date.now())
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        renderUpcoming(Array.isArray(data) ? data : [], container);
      })
      .catch(function () {
        if (section) section.style.display = "none";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
// == END UPCOMING EVENTS ======================================================


// == RECENT RESULTS ===========================================================
// Loads /data/recent-results.json and renders cards into #recentResultsContainer
(function () {
  var BASE_URL = "https://www.lebanongolfandcountryclub.com";

  function safe(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function buildResultCard(ev) {
    var badge = ev.game_type
      ? '<span class="result-badge">' + safe(ev.game_type) + '</span>'
      : '';

    var detailUrl = ev.url
      ? (ev.url.startsWith("http") ? ev.url : BASE_URL + ev.url)
      : "#";

    var summary2 = ev.summary2
      ? '<p class="result-summary2">' + safe(ev.summary2) + '</p>'
      : '';

    return [
      '<article class="result-card">',
        '<div class="result-card-inner">',
          badge,
          '<p class="result-label">' + safe(ev.label || "Event Result") + '</p>',
          '<h3 class="result-title">' + safe(ev.title) + '</h3>',
          '<p class="result-winner">' + safe(ev.winner_text) + '</p>',
          '<p class="result-summary">' + safe(ev.summary_text) + '</p>',
          summary2,
          '<a class="result-link" href="' + safe(detailUrl) + '">View full results &rarr;</a>',
        '</div>',
      '</article>'
    ].join("");
  }

  function renderResults(events, container) {
    var section = container.closest ? container.closest("section") : null;
    container.innerHTML = "";

    if (!events || events.length === 0) {
      if (section) section.style.display = "none";
      return;
    }

    container.innerHTML = events.map(buildResultCard).join("");
    if (section) section.style.display = "";
  }

  function init() {
    var container = document.getElementById("recentResultsContainer");
    if (!container) return;

    fetch("/data/recent-results.json?v=" + Date.now())
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        renderResults(Array.isArray(data) ? data : [], container);
      })
      .catch(function () {
        var section = container.closest ? container.closest("section") : null;
        if (section) section.style.display = "none";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
// == END RECENT RESULTS =======================================================
