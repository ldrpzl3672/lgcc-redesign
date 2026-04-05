// LGCC proposal site - simple interactions (no framework)

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




// ── UPCOMING EVENTS ──────────────────────────────────────────────────────────
// Loads data/upcoming-events.json and renders cards into #upcomingEventsContainer
(function () {
  var BASE_URL = "https://www.lebanongolfandcountryclub.com";

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      var parts = dateStr.split("-");
      var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    } catch (e) { return dateStr; }
  }

  function safe(str) {
    return str ? String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
  }

  function buildCard(ev) {
    var bannerHtml = "";
    if (ev.banner_url) {
      bannerHtml = '<div class="upcoming-card-banner"><img src="' + safe(ev.banner_url) + '" alt="' + safe(ev.event_name) + '" loading="lazy" onerror="this.parentElement.style.display='none'"></div>';
    }

    var meta = [];
    if (ev.event_type) meta.push(safe(ev.event_type));
    if (ev.format_label) meta.push(safe(ev.format_label));

    var summary = ev.description
      ? safe(ev.description.length > 120 ? ev.description.slice(0, 117) + "..." : ev.description)
      : "Join us for this upcoming club event.";

    var detailUrl = ev.url ? (ev.url.startsWith("http") ? ev.url : BASE_URL + ev.url) : "#";

    return [
      '<article class="upcoming-card">',
        bannerHtml,
        '<div class="upcoming-card-body">',
          '<p class="upcoming-card-date">' + formatDate(ev.event_date) + '</p>',
          '<h3 class="upcoming-card-title">' + safe(ev.event_name || ev.title) + '</h3>',
          meta.length ? '<p class="upcoming-card-meta">' + meta.join(" &bull; ") + '</p>' : '',
          '<p class="upcoming-card-summary">' + summary + '</p>',
          '<a class="btn btn-sm btn-outline" href="' + detailUrl + '">View Details &rarr;</a>',
        '</div>',
      '</article>'
    ].join("");
  }

  function renderUpcoming(events, container) {
    container.innerHTML = "";
    if (!events || events.length === 0) {
      container.closest("section").style.display = "none";
      return;
    }
    container.closest("section").style.display = "";
    // Sort soonest first
    var sorted = events.slice().sort(function (a, b) {
      return (a.event_date || "").localeCompare(b.event_date || "");
    });
    container.innerHTML = sorted.map(buildCard).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById("upcomingEventsContainer");
    if (!container) return;

    // Hide section until data loads (no flash of empty)
    var section = container.closest("section");
    if (section) section.style.display = "none";

    fetch("/data/upcoming-events.json?v=" + Date.now())
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        var events = Array.isArray(data) ? data : [];
        renderUpcoming(events, container);
      })
      .catch(function () {
        if (section) section.style.display = "none";
      });
  });
})();
// ── END UPCOMING EVENTS ───────────────────────────────────────────────────────

// Load Recent Competition cards from data/recent-results.json
(function () {
    const container = document.getElementById("recentResultsContainer");
    if (!container) return;

    fetch("data/recent-results.json")
        .then((response) => {
            if (!response.ok) throw new Error("Could not load recent-results.json");
            return response.json();
        })
        .then((data) => {
            const results = Array.isArray(data.results) ? data.results : [];

            if (!results.length) {
                container.innerHTML = `
                    <article class="card result-card">
                        <div class="result-topline">Club Event Result</div>
                        <h3>No results posted yet</h3>
                        <p class="result-winner">Check back soon for official club competition results.</p>
                    </article>
                `;
                return;
            }

            container.innerHTML = results.map((result) => `
                <article class="card result-card" style="position:relative;">
                    ${result.game_type ? `<span style="position:absolute;top:14px;right:16px;padding:3px 10px;border-radius:999px;background:rgba(184,155,94,0.18);border:1px solid rgba(184,155,94,0.32);color:#b89b5e;font-size:11px;font-weight:600;letter-spacing:0.02em;white-space:nowrap;">${result.game_type}</span>` : ""}
                    <div class="result-topline">${result.label || "Club Event Result"}</div>
                    <h3 style="${result.game_type ? 'padding-right:100px;' : ''}">${result.title || ""}</h3>
                    <p class="result-winner">${result.winner || ""}</p>
                    <p>${result.summary || ""}</p>${result.summary2 ? `<p style="margin:3px 0 0;font-size:0.875em;opacity:0.82">${result.summary2}</p>` : ""}
                    ${result.url ? `<a class="text-link" href="${result.url}">See Full Results â</a>` : ""}
                </article>
            `).join("");
        })
        .catch(() => {
            container.innerHTML = `
                <article class="card result-card">
                    <div class="result-topline">Club Event Result</div>
                    <h3>Results unavailable</h3>
                    <p class="result-winner">We could not load recent competition results right now.</p>
                </article>
            `;
        });
})();
