/* ============================================================
   THEME TOGGLE
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
const savedTheme  = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.style.background = window.scrollY > 40
    ? (document.documentElement.getAttribute('data-theme') === 'light'
        ? 'rgba(244,244,251,0.97)'
        : 'rgba(10,10,15,0.97)')
    : '';
});

/* ============================================================
   HIDDEN REPOS
   Primary source: projects/hidden.json  → edit "hiddenRepos" array
   Fallback:       the array below       → used only if fetch fails
   ============================================================ */
let HIDDEN_REPOS = [
  'MohamedYassineAbid',
  'MohamedYassineAbid.github.io',
  'slim',
  'Sementique_I1',
  'test-J-A-k8s',
  'TpDevops',
  'tpcloud',
  'signbridge',
];

/* ============================================================
   CATEGORY MAP  (GitHub repos → category)
   ============================================================ */
const CATEGORY_MAP = {
  'Sign-Bridge':             'ai',
  'DEEP':                    'ai',
  'recommndation':           'ai',
  'MPA-metaheuristics':      'ai',
  'nlpfss':                  'ai',
  'faster-whisper-stt':      'ai',
  'I2I':                     'ai',
  'TRC2':                    'ai',
  'Kaggle-PFA':              'ai',
  'Matrix_Manipulator':      'ai',
  'Kubernetes-FAC':          'devops',
  'K8S-Terraform-Ansible':   'devops',
  'Hadoop-HA':               'devops',
  'Reservi':                 'web',
  'sport':                   'web',
  'JEE-Hospital-management': 'web',
  'medAssist':               'web',
  'ProblemSolving_Resources':'custom',
};

const LANG_COLORS = {
  Python:             '#3572A5',
  JavaScript:         '#f1e05a',
  TypeScript:         '#2b7489',
  Java:               '#b07219',
  PHP:                '#4F5D95',
  Shell:              '#89e051',
  PowerShell:         '#012456',
  'Jupyter Notebook': '#DA5B0B',
  Jinja:              '#a52a22',
  'C++':              '#f34b7d',
  C:                  '#555555',
};

function getCategoryLabel(cat) {
  return { ai: 'AI / ML', devops: 'DevOps', web: 'Web', custom: 'Other' }[cat] ?? 'Other';
}

/* ============================================================
   BUILD CARDS
   ============================================================ */
function buildGitHubCard(repo) {
  const cat   = CATEGORY_MAP[repo.name] ?? 'custom';
  const desc  = repo.description || 'No description provided.';
  const lang  = repo.language || '';
  const color = LANG_COLORS[lang] || '#888';

  return `
    <div class="project-card" data-category="${cat}">
      <div class="project-card-top">
        <span class="project-title">${repo.name}</span>
        <span class="project-cat">${getCategoryLabel(cat)}</span>
      </div>
      <p class="project-desc">${desc}</p>
      <div class="project-footer">
        <div class="project-lang">
          ${lang ? `<span class="lang-dot" style="background:${color}"></span><span>${lang}</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          ${repo.stargazers_count > 0 ? `<span class="project-stars">⭐ ${repo.stargazers_count}</span>` : ''}
          <div class="project-links">
            <a href="${repo.html_url}" target="_blank" class="project-link">GitHub ↗</a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="project-link">Live ↗</a>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

function buildCustomCard(p) {
  const cats   = (Array.isArray(p.category) ? p.category : [p.category || 'custom'])
                   .map(c => c.toLowerCase());
  const tags   = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const badges = cats.map(c => `<span class="project-cat">${getCategoryLabel(c)}</span>`).join('');
  const links  = [
    p.github ? `<a href="${p.github}" target="_blank" class="project-link">GitHub ↗</a>` : '',
    p.live   ? `<a href="${p.live}"   target="_blank" class="project-link">Live ↗</a>`   : '',
  ].join('');

  return `
    <div class="project-card" data-category="${cats.join(' ')}">
      <div class="project-card-top">
        <span class="project-title">${p.title}</span>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${badges}</div>
      </div>
      ${p.award ? `<div class="award-badge">${p.award}</div>` : ''}
      <p class="project-desc">${p.description}</p>
      ${tags ? `<div class="tags" style="margin-top:4px">${tags}</div>` : ''}
      <div class="project-footer">
        <span></span>
        <div class="project-links">${links}</div>
      </div>
    </div>`;
}

/* ============================================================
   MAIN LOADER
   ============================================================ */
async function loadPortfolio() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = Array(6).fill('<div class="skeleton"></div>').join('');

  // ── 1. hidden.json ──
  try {
    const hRes = await fetch(`projects/hidden.json?v=${Date.now()}`);
    if (hRes.ok) {
      const { hiddenRepos = [] } = await hRes.json();
      hiddenRepos.forEach(r => { if (!HIDDEN_REPOS.includes(r)) HIDDEN_REPOS.push(r); });
    }
  } catch (_) {}

  // ── 2. projects.json — source of truth for custom projects ──
  let customProjects = [];
  try {
    const cRes = await fetch(`projects/projects.json?v=${Date.now()}`);
    if (cRes.ok) customProjects = await cRes.json();
  } catch (_) {}

  // ── 3. GitHub repos ──
  try {
    const res = await fetch(
      'https://api.github.com/users/MohamedYassineAbid/repos?sort=updated&per_page=30'
    );
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    const visible = repos
      .filter(r => !HIDDEN_REPOS.includes(r.name))
      .sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count)
          return b.stargazers_count - a.stargazers_count;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });

    const customCards = customProjects.map(buildCustomCard).join('');
    grid.innerHTML    = customCards + visible.map(buildGitHubCard).join('');
    setupFilters();

  } catch (_) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:var(--text-muted);
                  font-family:var(--font-mono);font-size:.85rem;padding:40px">
        ⚠ Could not load GitHub repos.<br/>
        <a href="https://github.com/MohamedYassineAbid" target="_blank"
           style="color:var(--accent)">View on GitHub ↗</a>
      </div>`;
  }
}

/* ============================================================
   PROJECT FILTERS
   ============================================================ */
function setupFilters() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const cats = card.dataset.category.split(' ');
        card.classList.toggle('hidden', filter !== 'all' && !cats.includes(filter));
      });
    });
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const [name, email, subject, message] =
    [...e.target.querySelectorAll('input, textarea')].map(i => i.value);
  window.open(
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
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
    }
  }),
  { threshold: 0.08 }
);

document.querySelectorAll('section').forEach(sec => {
  sec.style.opacity    = '0';
  sec.style.transform  = 'translateY(24px)';
  sec.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(sec);
});

/* ============================================================
   GITHUB PROFILE STATS
   ============================================================ */
async function loadGitHubStats() {
  try {
    const res  = await fetch('https://api.github.com/users/MohamedYassineAbid');
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('statRepos').textContent     = data.public_repos ?? '–';
    document.getElementById('statFollowers').textContent = data.followers     ?? '–';
    document.getElementById('statSince').textContent     = data.created_at
      ? new Date(data.created_at).getFullYear() : '–';
  } catch (_) {}
}

/* ============================================================
   BLOG — fetch Medium posts via RSS2JSON
   ============================================================ */
async function loadBlog() {
  const grid = document.getElementById('blogGrid');
  const MEDIUM_USER = 'abidmohamedyassine00';
  const RSS_URL     = `https://medium.com/feed/@${MEDIUM_USER}`;
  const API_URL     = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&count=6`;

  try {
    const res  = await fetch(API_URL);
    const data = await res.json();

    if (data.status !== 'ok' || !data.items?.length) {
      throw new Error('no posts');
    }

    grid.innerHTML = data.items.map(post => {
      // extract first image from content, fallback to feed image
      const imgMatch = post.content?.match(/<img[^>]+src="([^"]+)"/);
      const img      = imgMatch ? imgMatch[1] : (data.feed?.image || '');

      // strip HTML for excerpt
      const excerpt  = post.description
        ?.replace(/<[^>]+>/g, '')
        ?.trim()
        ?.slice(0, 160) + '…';

      const date = new Date(post.pubDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      const tags = (post.categories || []).slice(0, 3)
        .map(t => `<span class="tag">${t}</span>`).join('');

      return `
        <a href="${post.link}" target="_blank" class="blog-card">
          ${img ? `<div class="blog-thumb" style="background-image:url('${img}')"></div>` : '<div class="blog-thumb blog-thumb-empty"></div>'}
          <div class="blog-card-body">
            <div class="blog-meta">
              <span class="blog-date">${date}</span>
              ${post.author ? `<span class="blog-author">· ${post.author}</span>` : ''}
            </div>
            <h3 class="blog-title">${post.title}</h3>
            <p class="blog-excerpt">${excerpt}</p>
            ${tags ? `<div class="tags" style="margin-top:auto;padding-top:12px">${tags}</div>` : ''}
          </div>
        </a>`;
    }).join('');

  } catch (_) {
    grid.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-muted);padding:20px 0">
        Could not load posts automatically. &nbsp;
        <a href="https://medium.com/@${MEDIUM_USER}" target="_blank"
           style="color:var(--accent)">Read on Medium ↗</a>
      </div>`;
  }
}

/* ============================================================
   INIT
   ============================================================ */
loadGitHubStats();
loadPortfolio();
loadBlog();
