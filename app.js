// ===========================
// Bora Bahêa! – App Logic
// Persists data in localStorage
// ===========================

const STORAGE_KEY = 'boraBahea_matches_2026';
const BAHIA_NAMES = ['bahia', 'e.c. bahia', 'ec bahia', 'esporte clube bahia', 'tricolor'];

// ---- Data layer ----

function loadMatches() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveMatches(matches) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

// ---- Helpers ----

function isBahia(name) {
  return BAHIA_NAMES.includes(name.trim().toLowerCase());
}

function getResult(match) {
  const homeName = match.homeTeam.trim().toLowerCase();
  const homeScore = match.homeScore;
  const awayScore = match.awayScore;

  const bahiaIsHome = isBahia(homeName);

  if (homeScore === awayScore) return 'draw';
  if (bahiaIsHome) {
    return homeScore > awayScore ? 'win' : 'loss';
  } else {
    return awayScore > homeScore ? 'win' : 'loss';
  }
}

function resultLabel(result) {
  return { win: 'Vitória', draw: 'Empate', loss: 'Derrota' }[result];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// ---- Rendering ----

function renderStats(matches) {
  let wins = 0, draws = 0, losses = 0;
  matches.forEach(m => {
    const r = getResult(m);
    if (r === 'win') wins++;
    else if (r === 'draw') draws++;
    else losses++;
  });
  const points = wins * 3 + draws;

  document.getElementById('wins').textContent = wins;
  document.getElementById('draws').textContent = draws;
  document.getElementById('losses').textContent = losses;
  document.getElementById('points').textContent = points;
}

function renderTable(matches) {
  const tbody = document.getElementById('results-body');
  const emptyMsg = document.getElementById('empty-msg');

  tbody.innerHTML = '';

  if (matches.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  // Show most recent first
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(m => {
    const result = getResult(m);
    const badgeClass = `result-badge result-badge--${result}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(m.date)}</td>
      <td>${escapeHtml(m.homeTeam)}</td>
      <td><strong>${m.homeScore} × ${m.awayScore}</strong></td>
      <td>${escapeHtml(m.awayTeam)}</td>
      <td>${escapeHtml(m.competition)}</td>
      <td><span class="${badgeClass}">${resultLabel(result)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function render() {
  const matches = loadMatches();
  renderStats(matches);
  renderTable(matches);
}

// ---- Form ----

document.getElementById('match-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const match = {
    date:        document.getElementById('match-date').value,
    homeTeam:    document.getElementById('home-team').value.trim(),
    homeScore:   parseInt(document.getElementById('home-score').value, 10),
    awayTeam:    document.getElementById('away-team').value.trim(),
    awayScore:   parseInt(document.getElementById('away-score').value, 10),
    competition: document.getElementById('competition').value.trim(),
  };

  const matches = loadMatches();
  matches.push(match);
  saveMatches(matches);
  render();

  // Reset date and scores; keep team names and competition for convenience
  document.getElementById('match-date').value = '';
  document.getElementById('home-score').value = '0';
  document.getElementById('away-score').value = '0';
});

// ---- Init ----
render();
