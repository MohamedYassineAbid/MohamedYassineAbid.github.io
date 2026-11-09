/* ============================================================
   THEME TOGGLE
   ============================================================ */
// initial theme is applied by an inline script in <head> to avoid a flash
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (_) {}
});

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* mobile menu */
const navMenuBtn = document.getElementById('navMenuBtn');
const navLinks   = document.getElementById('navLinks');
function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navMenuBtn.setAttribute('aria-expanded', String(open));
  navMenuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
navMenuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ============================================================
   HELPERS
   ============================================================ */
function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/* ============================================================
   FILTER KEYS
   Each project's filter keys come from its GitHub repo topics.
   Common topics are grouped into a few tabs; if a repo has no
   topics (or GitHub does not answer), the "category" field in
   projects.json is used instead.
   ============================================================ */
const TAB_LABELS = { ai: 'AI / ML', devops: 'DevOps', web: 'Web', data: 'Data', iot: 'IoT', custom: 'Other' };

const TOPIC_GROUPS = {
  ai:     ['ai', 'ml', 'machine-learning', 'deep-learning', 'artificial-intelligence', 'nlp',
           'computer-vision', 'llm', 'speech-recognition', 'tts', 'mediapipe', 'pytorch', 'tensorflow'],
  devops: ['devops', 'devsecops', 'kubernetes', 'k8s', 'docker', 'terraform', 'ansible', 'helm',
           'argocd', 'gitops', 'jenkins', 'ci-cd', 'cicd', 'iac', 'cloud', 'azure', 'aks', 'proxmox', 'monitoring'],
  web:    ['web', 'react', 'typescript', 'javascript', 'fastapi', 'frontend', 'backend', 'fullstack', 'nextjs', 'spring'],
  data:   ['data', 'big-data', 'data-engineering', 'spark', 'hadoop', 'hive', 'etl'],
  iot:    ['iot', 'lorawan', 'raspberry-pi', 'chirpstack'],
};
const TOPIC_TO_TAB = Object.fromEntries(
  Object.entries(TOPIC_GROUPS).flatMap(([tab, topics]) => topics.map(t => [t, tab]))
);

function tabLabel(key) {
  return TAB_LABELS[key] ?? key.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

/* "https://github.com/owner/repo" -> "owner/repo" */
function repoSlug(url) {
  const m = /github\.com\/([^/]+)\/([^/#?]+)/i.exec(url || '');
  return m ? `${m[1]}/${m[2].replace(/\.git$/, '')}`.toLowerCase() : null;
}

const pickRepo = ({ full_name, name, description, language, stargazers_count, pushed_at,
                    html_url, homepage, topics, fork, archived, private: priv }) =>
  ({ full_name, name, description, language, stargazers_count, pushed_at,
     html_url, homepage, topics: topics || [], fork, archived, private: priv });

/* Your public repos (one request) + extra repos owned by organisations
   (one request each). Returns a map "owner/repo" -> repo. */
async function loadRepos(extraSlugs) {
  const repos = {};
  const mine = await fetchGitHubCached(
    'my-repos',
    'https://api.github.com/users/MohamedYassineAbid/repos?per_page=100&type=owner',
    list => list.map(pickRepo)
  );
  (mine || []).forEach(r => { repos[r.full_name.toLowerCase()] = r; });

  await Promise.all(extraSlugs.map(async slug => {
    if (repos[slug]) return;
    const r = await fetchGitHubCached(`repo:${slug}`, `https://api.github.com/repos/${slug}`, pickRepo);
    if (r && r.full_name) repos[slug] = r;
  }));
  return repos;
}

/* Topics first; without topics, guess from the repo's name and
   description using the same groups; else the projects.json category. */
function keysFromTopics(topics) {
  return [...new Set((topics || []).map(x => TOPIC_TO_TAB[x] || x))];
}
function keysFromText(text) {
  const words = (text || '').toLowerCase().replace(/[^a-z0-9+#-]+/g, ' ').split(' ');
  return [...new Set(words.map(w => TOPIC_TO_TAB[w]).filter(Boolean))];
}
function filterKeys(p, repo) {
  const fromTopics = keysFromTopics(repo?.topics);
  if (fromTopics.length) return fromTopics;
  if (p.category) return (Array.isArray(p.category) ? p.category : [p.category]).map(c => c.toLowerCase());
  const guessed = keysFromText(`${p.title} ${p.description} ${(p.tags || []).join(' ')}`);
  return guessed.length ? guessed : ['custom'];
}

/* ============================================================
   BUILD CARDS
   ============================================================ */
function repoToProject(r) {
  return {
    title: r.name,
    description: r.description || '',
    github: r.html_url,
    live: r.homepage || '',
    meta: { language: r.language, stars: r.stargazers_count, owner: r.full_name.split('/')[0] },
  };
}

function metaLine(m) {
  if (!m) return '<span></span>';
  const parts = [];
  if (m.language) parts.push(esc(m.language));
  if (m.owner && m.owner.toLowerCase() !== 'mohamedyassineabid') parts.push(esc(m.owner));
  if (m.stars) parts.push(`${m.stars} ${m.stars === 1 ? 'star' : 'stars'}`);
  return `<span class="project-lang">${parts.join(' · ')}</span>`;
}

function buildCustomCard(p, keys) {
  const tags   = (p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  const badges = keys.filter(k => TAB_LABELS[k]).slice(0, 2)
                   .map(k => `<span class="project-cat">${esc(tabLabel(k))}</span>`).join('');
  const links  = [
    p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener" class="project-link">GitHub ↗</a>` : '',
    p.live   ? `<a href="${esc(p.live)}"   target="_blank" rel="noopener" class="project-link">Live ↗</a>`   : '',
  ].join('');

  return `
    <div class="project-card" data-keys="${esc(keys.join(' '))}">
      <div class="project-card-top">
        <span class="project-title">${esc(p.title)}</span>
        <div>${badges}</div>
      </div>
      ${p.award ? `<div class="award-badge">${esc(p.award)}</div>` : ''}
      <p class="project-desc${p.description ? '' : ' is-empty'}">${p.description ? esc(p.description) : 'No description yet.'}</p>
      ${tags ? `<div class="tags" style="margin-top:4px">${tags}</div>` : ''}
      ${links ? `<div class="project-footer">
        ${metaLine(p.meta)}
        <div class="project-links">${links}</div>
      </div>` : ''}
    </div>`;
}

/* Tabs: All, then grouped tabs (AI / ML, DevOps, …) in a fixed order,
   then any other topic shared by at least two projects. */
function buildTabs(allKeys) {
  const counts = {};
  allKeys.flat().forEach(k => { counts[k] = (counts[k] || 0) + 1; });
  const order = Object.keys(TAB_LABELS);
  const keys = Object.keys(counts)
    .filter(k => k !== 'custom' && (TAB_LABELS[k] || counts[k] >= 2))
    .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || counts[b] - counts[a]);
  if (counts.custom) keys.push('custom');

  document.querySelector('.project-tabs').innerHTML =
    `<button class="tab active" data-filter="all" aria-pressed="true">All</button>` +
    keys.map(k => `<button class="tab" data-filter="${esc(k)}" aria-pressed="false">${esc(tabLabel(k))}</button>`).join('');
}

/* ============================================================
   MAIN LOADER
   ============================================================ */
async function loadPortfolio() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = Array(3).fill('<div class="skeleton" aria-hidden="true"></div>').join('');

  // projects/projects.json decides which projects are shown
  let projects = [];
  try {
    const res = await fetch(`projects/projects.json?v=${Date.now()}`);
    if (res.ok) projects = await res.json();
  } catch (_) {}

  if (!projects.length) {
    grid.innerHTML = `<p class="projects-empty">Projects could not be loaded.
      <a href="https://github.com/MohamedYassineAbid?tab=repositories" target="_blank" rel="noopener">Browse them on GitHub ↗</a></p>`;
    return;
  }

  // hidden.json: repos to leave out, and organisation repos to add
  let hidden = [], extra = [];
  try {
    const res = await fetch(`projects/hidden.json?v=${Date.now()}`);
    if (res.ok) {
      const d = await res.json();
      hidden = (d.hiddenRepos || []).map(n => n.toLowerCase());
      extra  = (d.extraRepos  || []).map(n => n.toLowerCase());
    }
  } catch (_) {}

  const featuredSlugs = projects.map(p => repoSlug(p.github)).filter(Boolean);
  const repos = await loadRepos([...new Set([...extra, ...featuredSlugs])]);

  // 1. featured projects, in projects.json order
  const items = projects.map(p => ({ p, keys: filterKeys(p, repos[repoSlug(p.github)]) }));

  // 2. public repos not already featured or hidden; described ones first, then most recent
  const featured = new Set(featuredSlugs);
  Object.values(repos)
    .filter(r => !r.private && !r.fork && !r.archived)
    .filter(r => !featured.has(r.full_name.toLowerCase()))
    .filter(r => !hidden.includes(r.name.toLowerCase()) && !hidden.includes(r.full_name.toLowerCase()))
    .sort((a, b) => (!!b.description - !!a.description) || (b.stargazers_count - a.stargazers_count)
                    || (new Date(b.pushed_at) - new Date(a.pushed_at)))
    .forEach(r => {
      const p = repoToProject(r);
      items.push({ p, keys: filterKeys(p, r) });
    });

  buildTabs(items.map(x => x.keys));
  grid.innerHTML = items.map(x => buildCustomCard(x.p, x.keys)).join('');
  setupFilters();
}

/* ============================================================
   GITHUB API CACHE
   Used for repo topics and the profile stats. Unauthenticated calls are
   limited to 60/hour per IP, so responses are cached for an hour
   and a stale copy is used if the API refuses.
   ============================================================ */
const GH_CACHE_TTL = 60 * 60 * 1000;

async function fetchGitHubCached(key, url, pick = d => d) {
  const storeKey = `gh:${key}`;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(storeKey)); } catch (_) {}

  if (cached && Date.now() - cached.t < GH_CACHE_TTL) return cached.data;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = pick(await res.json());
    try { localStorage.setItem(storeKey, JSON.stringify({ t: Date.now(), data })); } catch (_) {}
    return data;
  } catch (_) {
    return cached ? cached.data : null;   // stale beats nothing
  }
}

/* ============================================================
   PROJECT FILTERS
   ============================================================ */
const PROJECTS_PREVIEW = 3;
let projectFilter = 'all';
let projectsExpanded = false;

/* Show the cards matching the active tab; collapsed, only the first
   PROJECTS_PREVIEW of them, with a button to reveal the rest. */
function applyProjectView() {
  const cards = [...document.querySelectorAll('.project-card')];
  const matching = cards.filter(c =>
    projectFilter === 'all' || c.dataset.keys.split(' ').includes(projectFilter));

  cards.forEach(c => c.classList.add('hidden'));
  matching.forEach((c, i) => c.classList.toggle('hidden', !projectsExpanded && i >= PROJECTS_PREVIEW));

  const btn = document.getElementById('projectsMore');
  const extra = matching.length - PROJECTS_PREVIEW;
  btn.hidden = extra <= 0;
  btn.setAttribute('aria-expanded', String(projectsExpanded));
  btn.textContent = projectsExpanded ? 'Show less' : `Show ${extra} more`;
}

function setupFilters() {
  document.querySelectorAll('.tab').forEach(tab => {
    if (tab.dataset.bound) return;
    tab.dataset.bound = '1';
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      projectFilter = tab.dataset.filter;
      projectsExpanded = false;
      applyProjectView();
    });
  });

  const btn = document.getElementById('projectsMore');
  if (!btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const wasExpanded = projectsExpanded;
      projectsExpanded = !projectsExpanded;
      applyProjectView();
      // after collapsing, bring the grid back into view instead of leaving the reader far below it
      if (wasExpanded) document.getElementById('projects').scrollIntoView({ block: 'start' });
    });
  }
  applyProjectView();
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target.elements;
  const [name, email, subject, message] =
    ['name', 'email', 'subject', 'message'].map(k => f[k].value.trim());
  window.location.href = (
    `mailto:abidmohamedyassine00@gmail.com` +
    `?subject=${encodeURIComponent(subject || 'Portfolio Contact')}` +
    `&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`
  );
  document.getElementById('formNote').textContent = '✓ Opening your email client…';
  e.target.reset();
  setTimeout(() => { document.getElementById('formNote').textContent = ''; }, 4000);
});

/* ============================================================
   FADE-IN ON SCROLL
   ============================================================ */
if ('IntersectionObserver' in window &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); }
    }),
    { threshold: 0.08 }
  );
  document.documentElement.classList.add('reveal-ready');
  document.querySelectorAll('section:not(#hero)').forEach(sec => observer.observe(sec));
}

/* ============================================================
   GITHUB PROFILE STATS
   ============================================================ */
async function loadGitHubStats() {
  const data = await fetchGitHubCached(
    'user',
    'https://api.github.com/users/MohamedYassineAbid',
    ({ public_repos, followers, created_at }) => ({ public_repos, followers, created_at })
  );
  if (!data) return;
  document.getElementById('statRepos').textContent     = data.public_repos ?? '–';
  document.getElementById('statFollowers').textContent = data.followers     ?? '–';
  document.getElementById('statSince').textContent     = data.created_at
    ? new Date(data.created_at).getFullYear() : '–';
}

/* ============================================================
   INIT
   ============================================================ */
loadGitHubStats();
loadPortfolio();

/* ============================================================
   LOCAL CLOCK (Sfax, Africa/Tunis)
   ============================================================ */
(function startClock() {
  const els = document.querySelectorAll('[data-clock]');
  if (!els.length) return;
  let fmt;
  try {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Tunis', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch (_) { return; }
  const tick = () => { const t = fmt.format(new Date()); els.forEach(el => { el.textContent = t; }); };
  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   HERO STAR CHART
   Seeded stars plus a few real constellations, drawn on a
   canvas behind the hero. Stars twinkle and drift, each
   constellation floats on its own orbit and follows the
   pointer; static when reduced motion is preferred.
   ============================================================ */
(function starChart() {
  const canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // deterministic random so the sky is the same on every visit
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const stars = Array.from({ length: 140 }, () => ({
    x: rand(), y: rand(), r: rand() * 1.1 + 0.3, a: rand() * 0.5 + 0.25, p: rand() * Math.PI * 2, d: rand() * 0.6 + 0.4,
  }));

  // [label, anchor x, anchor y, scale, points, edges] — points are relative offsets
  const CONSTELLATIONS = [
    ['cassiopeia', 0.02, 0.11, 0.07, [[0,0.2],[0.25,0],[0.5,0.3],[0.75,0.05],[1,0.35]], [[0,1],[1,2],[2,3],[3,4]]],
    ['cygnus',     0.84, 0.50, 0.09, [[0.5,0],[0.5,0.5],[0.5,1],[0,0.42],[1,0.58]], [[0,1],[1,2],[3,1],[1,4]]],
    ['lyra',       0.86, 0.80, 0.04, [[0,0],[0.5,0.6],[1,0.5],[0.7,1.2],[0.2,1.1]], [[0,1],[1,2],[2,3],[3,4],[4,1]]],
    ['aquila',     0.70, 0.10, 0.06, [[0,0.5],[0.5,0.45],[1,0.4],[0.45,0],[0.55,1]], [[0,1],[1,2],[3,1],[1,4]]],
    ['orion',      0.5, 0.79, 0.07, [[0,0],[1,0.1],[0.4,0.5],[0.5,0.52],[0.6,0.54],[0.1,1],[0.9,1]], [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]]],
  ];

  let W = 0, H = 0, dpr = 1, mx = 0, my = 0, tx = 0, ty = 0, colors = {};

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors = { star: cs.getPropertyValue('--text-3').trim(), line: cs.getPropertyValue('--hairline-strong').trim(),
               label: cs.getPropertyValue('--text-3').trim(), accent: cs.getPropertyValue('--accent').trim() };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;

    stars.forEach(s => {
      const tw = still ? 1 : 0.55 + 0.45 * Math.sin(t / 700 * s.d + s.p);
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = colors.star;
      ctx.beginPath();
      const sx = still ? 0 : Math.sin(t / 3000 * s.d + s.p) * 6;
      const sy = still ? 0 : Math.cos(t / 3600 * s.d + s.p) * 4;
      ctx.arc(s.x * W + mx * 18 * s.d + sx, s.y * H + my * 18 * s.d + sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const size = Math.min(W, 1400);
    CONSTELLATIONS.forEach(([label, ax, ay, sc, pts, edges], ci) => {
      // each constellation drifts on its own slow orbit, plus pointer parallax
      const ox = mx * 36 + (still ? 0 : Math.sin(t / 2600 + ci * 1.7) * 26);
      const oy = my * 36 + (still ? 0 : Math.cos(t / 3100 + ci * 2.3) * 18);
      const P = pts.map(([px, py]) => [ax * W + px * sc * size + ox, ay * H + py * sc * size + oy]);
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = colors.line; ctx.lineWidth = 1;
      ctx.beginPath();
      edges.forEach(([a, b]) => { ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); });
      ctx.stroke();
      P.forEach(([x, y], i) => {
        const glow = still ? 0 : Math.max(0, Math.sin(t / 900 + ci * 1.3 + i));
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = glow > 0.9 ? colors.accent : colors.star;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.label;
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      const [lx, ly] = P[P.length - 1];
      ctx.fillText(label, lx + 8, ly + 14);
    });
    ctx.globalAlpha = 1;
  }

  let raf = 0, visible = true;
  function loop(t) { draw(t); if (!still && visible) raf = requestAnimationFrame(loop); }

  readColors(); resize(); requestAnimationFrame(loop);

  window.addEventListener('resize', () => { resize(); if (still) draw(0); });
  new MutationObserver(() => { readColors(); if (still) draw(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (!still) {
    window.addEventListener('pointermove', e => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    // pause when the hero is off screen
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }
  if (document.fonts) document.fonts.ready.then(() => draw(performance.now()));
})();
