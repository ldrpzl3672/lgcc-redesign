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

  // Smooth scroll
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

  // Demo form handler
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (note) {
        note.textContent = "Demo mode: form not connected yet. Hook to Formspree/Netlify Forms before launch.";
      }
      form.reset();
    });
  }
})();

// ================= UPCOMING GOLF EVENTS =================
(function () {
  const golfContainer = document.getElementById("upcomingGolfEventsContainer");
  if (!golfContainer) return;

  const SOCIAL_TYPES = ["social event", "social_event", "social"];

  function safe(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isGolfEvent(ev) {
    const t = String(ev.eventType || ev.event_type || "").toLowerCase();
    return !SOCIAL_TYPES.includes(t);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "Coming Soon";
    try {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      const d = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  }

  function buildFormatLabel(ev) {
    const parts = [];
    const eventType = ev.eventType || ev.event_type || "";
    const competitionFormat = ev.competitionFormat || ev.competition_format || "";
    const holesTo = ev.holesTo || ev.holes_to_play || "";

    if (eventType) parts.push(eventType);

    if (competitionFormat === "team_scramble") parts.push("Team Scramble");
    else if (competitionFormat === "mixed_format") parts.push("Mixed Format");
    else if (
      competitionFormat &&
      competitionFormat !== "team_scramble" &&
      competitionFormat !== "mixed_format"
    ) {
      parts.push(competitionFormat);
    }

    if (holesTo) parts.push(String(holesTo) + " Holes");
    return parts.join(" - ");
  }

  function renderPlaceholder() {
    golfContainer.innerHTML = `
      <article class="card schedule-card">
        <p class="schedule-date">Coming Soon</p>
        <h3>Coming Soon</h3>
        <p>Upcoming tournaments, member games, and club competitions will appear here once they are scheduled.</p>
      </article>
    `;
  }

  function buildGolfCard(ev) {
    const title = safe(ev.title || ev.event_name || "");
    const dateText = safe(formatDate(ev.eventDate || ev.event_date || ""));
    const formatLabel = safe(buildFormatLabel(ev));
    const description = safe(ev.description || "");
    const detailUrl = safe(ev.detailUrl || ev.upcoming_page_url || "#");
    const cardImage = safe(ev.cardImage || ev.card_image || ev.bannerImage || "");

    const hasImage = !!cardImage;

    return `
      <article class="card schedule-card${hasImage ? " schedule-card--featured" : ""}">
        <div class="schedule-card-content">
          <p class="schedule-date">${dateText}</p>
          <h3>${title}</h3>
          ${formatLabel ? `<p class="schedule-card-format">${formatLabel}</p>` : ""}
          ${description ? `<p class="schedule-card-copy">${description}</p>` : ""}
          <a class="text-link" href="${detailUrl}">View Details -&gt;</a>
        </div>
        ${hasImage ? `
          <div class="schedule-card-thumb">
            <img src="${cardImage}" alt="${title}">
          </div>
        ` : ""}
      </article>
    `;
  }

  function renderGolfEvents(events) {
    if (!events || !events.length) {
      renderPlaceholder();
      return;
    }

    const sorted = events.slice().sort((a, b) => {
      const da = a.eventDate || a.event_date || "";
      const db = b.eventDate || b.event_date || "";
      return da.localeCompare(db);
    });

    golfContainer.innerHTML = sorted.map(buildGolfCard).join("");
  }

  fetch("/data/upcoming-events.json?v=" + Date.now())
    .then((response) => {
      if (!response.ok) throw new Error("Could not load upcoming-events.json");
      return response.json();
    })
    .then((data) => {
      const all = Array.isArray(data.upcoming) ? data.upcoming : [];
      const golfEvents = all.filter(isGolfEvent);
      renderGolfEvents(golfEvents);
    })
    .catch(() => {
      renderPlaceholder();
    });
})();

// ================= RECENT RESULTS =================
(function () {
  const container = document.getElementById("recentResultsContainer");
  if (!container) return;

  function safe(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderEmpty() {
    container.innerHTML = `
      <article class="card result-card">
        <p class="result-topline">Club Event Result</p>
        <h3>No results posted yet</h3>
        <p>Check back soon for official club competition results.</p>
      </article>
    `;
  }

  function buildResultCard(result) {
    const gameType = safe(result.game_type || "");
    const label = safe(result.label || "Club Event Result");
    const title = safe(result.title || "");
    const winner = safe(result.winner || "");
    const summary = safe(result.summary || "");
    const summary2 = safe(result.summary2 || "");
    const url = safe(result.url || "#");

    return `
      <article class="card result-card">
        ${gameType ? `<span class="pill pill-gold" style="float:right; margin-left:12px;">${gameType}</span>` : ""}
        <p class="result-topline">${label}</p>
        <h3>${title}</h3>
        ${winner ? `<p class="result-winner">${winner}</p>` : ""}
        ${summary ? `<p>${summary}</p>` : ""}
        ${summary2 ? `<p>${summary2}</p>` : ""}
        <a class="text-link" href="${url}">See Full Results -&gt;</a>
      </article>
    `;
  }

  fetch("/data/recent-results.json?v=" + Date.now())
    .then((response) => {
      if (!response.ok) throw new Error("Could not load recent-results.json");
      return response.json();
    })
    .then((data) => {
      const results = Array.isArray(data.results) ? data.results : [];
      if (!results.length) {
        renderEmpty();
        return;
      }
      container.innerHTML = results.map(buildResultCard).join("");
    })
    .catch(() => {
      container.innerHTML = `
        <article class="card result-card">
          <p class="result-topline">Club Event Result</p>
          <h3>Results unavailable</h3>
          <p>We could not load recent competition results right now.</p>
        </article>
      `;
    });
})();
