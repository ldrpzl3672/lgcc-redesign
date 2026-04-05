// LGCC site script.js

(function () {
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Smooth scroll (basic)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });

  // Demo form handler (no backend)
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (note) {
        note.textContent =
          "Demo mode: form not connected yet. Hook to Formspree/Netlify Forms before launch.";
      }
      form.reset();
    });
  }
})();


// == UPCOMING GOLF EVENTS =====================================================
// Reads /data/upcoming-events.json (shape: { upcoming: [...] })
// Filters to golf/competition events only.
// Renders real event cards into #upcomingGolfEventsContainer.
// Social container (#upcomingSocialEventsContainer) is left untouched.
// If no golf events, shows the existing "Coming Soon" placeholder style.
(function () {
  var SOCIAL_TYPES = ["Social Event", "social_event", "social"];

  function isGolfEvent(ev) {
    var t = (ev.eventType || ev.event_type || "").toLowerCase();
    for (var i = 0; i < SOCIAL_TYPES.length; i++) {
      if (t === SOCIAL_TYPES[i].toLowerCase()) return false;
    }
    return true;
  }

  function safe(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      var parts = dateStr.split("-");
      var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
      });
    } catch (e) { return dateStr; }
  }

  function buildFormatLabel(ev) {
    var parts = [];
    var type = ev.eventType || ev.event_type || "";
    if (type) parts.push(type);
    var fmt = ev.competitionFormat || ev.competition_format || "";
    if (fmt === "team_scramble") parts.push("Team Scramble");
    else if (fmt === "mixed_format") parts.push("Mixed Format");
    var holes = ev.holesTo || ev.holes_to_play || null;
    if (holes) parts.push(holes + " Holes");
    return parts.join(" - ");
  }

  function buildCard(ev) {
    var title = safe(ev.title || ev.event_name || "");
    var dateStr = safe(formatDate(ev.eventDate || ev.event_date || ""));
    var formatLabel = safe(buildFormatLabel(ev));
    var desc = ev.description || "";
    var shortDesc = desc.length > 120 ? desc.slice(0, 117) + "..." : desc;
    var detailUrl = ev.detailUrl || ev.upcoming_page_url || "#";
    if (detailUrl !== "#" && !detailUrl.startsWith("http")) {
      detailUrl = detailUrl; // relative URL is fine for same-site links
    }

    var bannerHtml = "";
    if (ev.bannerImage || ev.banner_url) {
      var imgSrc = safe(ev.bannerImage || ev.banner_url);
      bannerHtml = '<div class="schedule-banner"><img src="' + imgSrc + '" alt="' + title + '" loading="lazy" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" onerror="this.parentElement.style.display='none'"></div>';
    }

    var metaHtml = formatLabel
      ? '<p class="schedule-date" style="margin-bottom:4px;">' + formatLabel + '</p>'
      : '';

    var descHtml = shortDesc
      ? '<p style="margin:6px 0 12px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.5;">' + safe(shortDesc) + '</p>'
      : '';

    return '<article class="card schedule-card">'
      + bannerHtml
      + '<div style="padding:' + (bannerHtml ? '14px' : '0') + ' 0 0;">'
      + '<p class="schedule-date">' + dateStr + '</p>'
      + '<h3 style="margin:4px 0 6px;">' + title + '</h3>'
      + metaHtml
      + descHtml
      + '<a href="' + safe(detailUrl) + '" class="btn btn-sm" style="display:inline-block;margin-top:4px;">View Details</a>'
      + '</div>'
      + '</article>';
  }

  function renderGolfEvents(container, events) {
    if (!events || events.length === 0) {
      // Restore the static "Coming Soon" placeholder
      container.innerHTML = '<article class="card schedule-card">'
        + '<p class="schedule-date">Coming Soon</p>'
        + '<h3>Coming Soon</h3>'
        + '<p>Upcoming tournaments, member games, and club competitions will appear here once they are scheduled.</p>'
        + '</article>';
      return;
    }

    // Sort soonest first
    var sorted = events.slice().sort(function (a, b) {
      var da = a.eventDate || a.event_date || "";
      var db = b.eventDate || b.event_date || "";
      return da.localeCompare(db);
    });

    container.innerHTML = sorted.map(buildCard).join("");
  }

  function init() {
    var golfContainer = document.getElementById("upcomingGolfEventsContainer");
    if (!golfContainer) return;

    fetch("/data/upcoming-events.json?v=" + Date.now())
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) {
        var all = Array.isArray(data.upcoming) ? data.upcoming : [];
        var golf = all.filter(isGolfEvent);
        renderGolfEvents(golfContainer, golf);
      })
      .catch(function () {
        // On error, leave the container as-is (HTML placeholder stays)
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
// == END UPCOMING GOLF EVENTS =================================================


// == RECENT RESULTS ===========================================================
// Loads /data/recent-results.json and renders cards into #recentResultsContainer
(function () {
  var BASE_URL = "https://www.lebanongolfandcountryclub.com";

  function safe(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

    return '<article class="result-card">'
      + '<div class="result-card-inner">'
      + badge
      + '<p class="result-label">' + safe(ev.label || "Event Result") + '</p>'
      + '<h3 class="result-title">' + safe(ev.title) + '</h3>'
      + '<p class="result-winner">' + safe(ev.winner_text) + '</p>'
      + '<p class="result-summary">' + safe(ev.summary_text) + '</p>'
      + summary2
      + '<a class="result-link" href="' + safe(detailUrl) + '">View full results &rarr;</a>'
      + '</div>'
      + '</article>';
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
