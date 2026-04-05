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




// Load Upcoming Events cards from data/upcoming-events.json
(function () {
    const golfContainer = document.getElementById("upcomingGolfEventsContainer");
    const socialContainer = document.getElementById("upcomingSocialEventsContainer");
    if (!golfContainer && !socialContainer) return;

    function renderCards(container, items, emptyText) {
        if (!container) return;

        if (!items.length) {
            container.innerHTML = `
                <article class="card schedule-card">
                    <p class="schedule-date">Coming Soon</p>
                    <h3>Coming Soon</h3>
                    <p>${emptyText}</p>
                </article>
            `;
            return;
        }

        container.innerHTML = items.map((event) => `
            <article class="card schedule-card">
                <p class="schedule-date">${event.date || "Coming Soon"}</p>
                <h3>${event.title || ""}</h3>
                <p>${event.summary || ""}</p>
                ${event.url ? `<a class="text-link" href="${event.url}">Learn More â</a>` : ""}
            </article>
        `).join("");
    }

    fetch("data/upcoming-events.json")
        .then((response) => {
            if (!response.ok) throw new Error("Could not load upcoming-events.json");
            return response.json();
        })
        .then((data) => {
            const golfEvents = Array.isArray(data.golf_events) ? data.golf_events : [];
            const socialEvents = Array.isArray(data.social_events) ? data.social_events : [];

            renderCards(golfContainer, golfEvents, "Upcoming golf events will appear here.");
            renderCards(socialContainer, socialEvents, "Upcoming social events will appear here.");
        })
        .catch(() => {
            renderCards(golfContainer, [], "Upcoming golf events will appear here.");
            renderCards(socialContainer, [], "Upcoming social events will appear here.");
        });
})();

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
