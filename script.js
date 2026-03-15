fetch('data/recent-results.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('results-container');

    data.results.forEach(result => {
      const card = document.createElement('div');
      card.className = 'result-card';

      card.innerHTML = `
        <h3>${result.title}</h3>
        <p><strong>${result.winner}</strong></p>
        <p>${result.summary}</p>
        <a href="${result.url}">See Full Results →</a>
      `;

      container.appendChild(card);
    });
  })
  .catch(err => console.error("Results JSON failed to load:", err));
