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
    const container = document.getElementById("upcomingEventsContainer");
    if (!container) return;

    fetch("data/upcoming-events.json")
        .then((response) => {
            if (!response.ok) throw new Error("Could not load upcoming-events.json");
            return response.json();
        })
        .then((data) => {
            const events = Array.isArray(data.events) ? data.events : [];

            if (!events.length) {
                container.innerHTML = `
                    <article class="card event-card">
                        <div class="event-date">Coming Soon</div>
                        <h3>New event coming soon</h3>
                        <p>Check back soon for golf events, social events, and club activities.</p>
                    </article>
                `;
                return;
            }

            container.innerHTML = events.map((event) => `
                <article class="card event-card">
                    <div class="event-date">${event.date || "Coming Soon"}</div>
                    <h3>${event.title || ""}</h3>
                    <p>${event.summary || ""}</p>
                    ${event.url ? `<a class="text-link" href="${event.url}">Learn More →</a>` : ""}
                </article>
            `).join("");
        })
        .catch(() => {
            container.innerHTML = `
                <article class="card event-card">
                    <div class="event-date">Coming Soon</div>
                    <h3>New event coming soon</h3>
                    <p>Check back soon for golf events, social events, and club activities.</p>
                </article>
            `;
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
                <article class="card result-card">
                    <div class="result-topline">${result.label || "Club Event Result"}</div>
                    <h3>${result.title || ""}</h3>
                    <p class="result-winner">${result.winner || ""}</p>
                    <p>${result.summary || ""}</p>
                    ${result.url ? `<a class="text-link" href="${result.url}">See Full Results →</a>` : ""}
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
