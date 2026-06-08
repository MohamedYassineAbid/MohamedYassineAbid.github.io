/* ============================================================
   TERMINAL EMULATOR
   ============================================================ */

const overlay    = document.getElementById('terminalOverlay');
const termOutput = document.getElementById('terminalOutput');
const termInput  = document.getElementById('terminalInput');
const termBody   = document.getElementById('terminalBody');
const termClose  = document.getElementById('termClose');
const toggleBtn  = document.getElementById('terminalToggle');

let cmdHistory   = [];
let historyIndex = -1;
let booted       = false;

/* ── open / close ─────────────────────────────────────── */
function openTerminal() {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  termInput.focus();
  if (!booted) { boot(); booted = true; }
}

function closeTerminal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

toggleBtn.addEventListener('click', openTerminal);
termClose.addEventListener('click', closeTerminal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeTerminal();
});

/* ── output helpers ───────────────────────────────────── */
function print(html, extraClass = '') {
  const d = document.createElement('div');
  d.className = 'term-line' + (extraClass ? ' ' + extraClass : '');
  d.innerHTML = html;
  termOutput.appendChild(d);
  termBody.scrollTop = termBody.scrollHeight;
}

function gap() { print(''); }

function printCmd(cmd) {
  print(`<span class="tp">mya@portfolio:~$</span>&nbsp;<span class="tc">${escHtml(cmd)}</span>`);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── boot ─────────────────────────────────────────────── */
function boot() {
  print(`<span class="ta">  __  ____   ___  </span>`);
  print(`<span class="ta"> |  \\/  \\ \\ / / \\ </span>`);
  print(`<span class="ta"> | |\\/| |\\ V / _ \\</span>`);
  print(`<span class="ta"> |_|  |_| |_|/_/ \\_\\</span>`);
  gap();
  print(`<span class="ta">Mohamed Yassine Abid</span>  —  DevOps · Cloud · AI`);
  print(`Type <span class="tc">help</span> to see available commands.`);
  gap();
}

/* ── commands ─────────────────────────────────────────── */
const COMMANDS = {

  help() {
    gap();
    print(`<span class="ts">AVAILABLE COMMANDS</span>`);
    gap();
    const list = [
      ['about',          'Who I am'],
      ['skills',         'Full tech stack'],
      ['experience',     'Internships & education'],
      ['projects',       'Featured projects'],
      ['certifications', 'Certs & leadership'],
      ['contact',        'Get in touch'],
      ['github',         'Open GitHub profile'],
      ['cv',             'Download CV'],
      ['clear',          'Clear the terminal'],
      ['gui',            'Back to GUI view'],
      ['exit',           'Close terminal'],
    ];
    list.forEach(([cmd, desc]) =>
      print(`&nbsp;&nbsp;<span class="tc">${cmd.padEnd(18)}</span><span class="tm">${desc}</span>`)
    );
    gap();
  },

  about() {
    gap();
    print(`<span class="ts">ABOUT</span>`);
    gap();
    const rows = [
      ['Name',     'Mohamed Yassine Abid'],
      ['Location', 'Sfax, Tunisia'],
      ['Email',    'abidmohamedyassine00@gmail.com'],
      ['Phone',    '+216 28 592 003'],
      ['GitHub',   'github.com/MohamedYassineAbid'],
      ['LinkedIn', 'linkedin.com/in/mohamed-yassine-abid'],
      ['Status',   '<span class="ta">Open to Internship</span>'],
    ];
    rows.forEach(([k,v]) =>
      print(`&nbsp;&nbsp;<span class="tk">${k.padEnd(10)}</span>${v}`)
    );
    gap();
    print(`&nbsp;&nbsp;Engineering student passionate about DevOps, Cloud, and AI.`);
    print(`&nbsp;&nbsp;Chairman of IEEE FSS CS Chapter · Founder of Competitive Programming Club.`);
    gap();
  },

  skills() {
    gap();
    print(`<span class="ts">TECHNICAL SKILLS</span>`);
    gap();
    const groups = [
      ['DevOps & IaC',  'Docker · Kubernetes · Jenkins · ArgoCD · Terraform · Ansible · Helm · SonarQube · Trivy · Nexus'],
      ['Cloud',         'Azure (AKS) · Cloudstack · Proxmox'],
      ['Monitoring',    'Prometheus · Grafana'],
      ['AI & Data',     'Python · NLP · CV · BiLSTM · MediaPipe · FastAPI · Spark · Pentaho · Tableau · Streamlit'],
      ['Languages',     'Python · C/C++ · Java · SQL/PLSQL · TypeScript · React'],
      ['Networking',    'Linux · Virtualization · LoRaWAN (ChirpStack)'],
      ['Tools',         'Git · MongoDB · Firebase'],
    ];
    groups.forEach(([g,v]) => {
      print(`&nbsp;&nbsp;<span class="ta">▸ ${g}</span>`);
      print(`&nbsp;&nbsp;&nbsp;&nbsp;<span class="tm">${v}</span>`);
      gap();
    });
  },

  experience() {
    gap();
    print(`<span class="ts">EXPERIENCE</span>`);
    gap();

    print(`&nbsp;&nbsp;<span class="ta">▸ Data Science Platform</span>&nbsp;&nbsp;<span class="tm">2025 · Univ. of Sfax Research Unit</span>`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;Self-hosted JupyterHub on K8s (Proxmox/Terraform), automated with Ansible &amp; Helm.`);
    gap();

    print(`&nbsp;&nbsp;<span class="ta">▸ DevSecOps Intern</span>&nbsp;&nbsp;<span class="tm">2024 · SIFAST, Sfax</span>`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;End-to-end pipeline: Terraform, Ansible, Jenkins, SonarQube, Trivy,`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;Nexus, ArgoCD, Helm, K8s. Prometheus + Grafana → Slack alerts.`);
    gap();

    print(`&nbsp;&nbsp;<span class="ta">▸ IoT &amp; Infrastructure Intern</span>&nbsp;&nbsp;<span class="tm">2024 · Wedtect</span>`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;LoRaWAN pipeline: ChirpStack on Raspberry Pi → MongoDB.`);
    gap();

    print(`<span class="ts">EDUCATION</span>`);
    gap();
    print(`&nbsp;&nbsp;<span class="ta">▸ Data Engineering Cycle</span>&nbsp;&nbsp;<span class="tm">Sep 2024 – Jun 2027</span>`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;Faculty of Sciences, University of Sfax`);
    gap();
    print(`&nbsp;&nbsp;<span class="ta">▸ Integrated Preparatory Cycle — CS</span>&nbsp;&nbsp;<span class="tm">Sep 2022 – Jun 2024</span>`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;Faculty of Sciences, University of Sfax`);
    gap();
  },

  projects() {
    gap();
    print(`<span class="ts">FEATURED PROJECTS</span>`);
    gap();

    print(`&nbsp;&nbsp;<span class="ta">▸ SignBridge</span>&nbsp;&nbsp;<span class="tm">[AI] 🥈 2nd Place — MasterFaster 3</span>`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;Real-time Tunisian Sign Language ↔ Dialect translation.`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;BiLSTM · MediaPipe · TTS · Speech Recognition`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/MohamedYassineAbid/Sign-Bridge" target="_blank" class="tl">github.com/MohamedYassineAbid/Sign-Bridge</a>`);
    gap();

    print(`&nbsp;&nbsp;<span class="ta">▸ JobKai</span>&nbsp;&nbsp;<span class="tm">[AI · DevOps · Web] 🥉 3rd Place — TSYP13 CS&amp;CN</span>`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;AI job platform for MENA/Sub-Saharan Africa.`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;FastAPI · React · TypeScript · AKS · Trivy · SonarQube`);
    print(`&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/jobkaiteam-code/JobKai" target="_blank" class="tl">github.com/jobkaiteam-code/JobKai</a>`);
    gap();

    print(`&nbsp;&nbsp;<span class="tm">Type <span class="tc">gui</span> then scroll to Projects for the full list.</span>`);
    gap();
  },

  certifications() {
    gap();
    print(`<span class="ts">CERTIFICATIONS</span>`);
    gap();
    [
      ['CKA',      'Certified Kubernetes Administrator — Coursera'],
      ['Azure AI', 'Azure AI Fundamentals — Microsoft'],
      ['MOS',      'Microsoft Office Specialist Associate — Microsoft'],
      ['Java OOP', 'Object-Oriented Programming in Java — Udemy'],
      ['EF SET C1','English C1 Fluent — EF Standard English Test'],
    ].forEach(([k,v]) =>
      print(`&nbsp;&nbsp;<span class="ta">✓</span>&nbsp;<span class="tk">${k.padEnd(10)}</span><span class="tm">${v}</span>`)
    );
    gap();
    print(`<span class="ts">LEADERSHIP</span>`);
    gap();
    print(`&nbsp;&nbsp;<span class="ta">▸ Chairman</span>&nbsp;IEEE FSS CS Chapter&nbsp;&nbsp;<span class="tm">Jan 2025 – Jan 2026</span>`);
    print(`&nbsp;&nbsp;<span class="ta">▸ Founder</span>&nbsp;&nbsp;Competitive Programming Club · 100+ members&nbsp;&nbsp;<span class="tm">Sep 2023 – Sep 2024</span>`);
    gap();
  },

  contact() {
    gap();
    print(`<span class="ts">CONTACT</span>`);
    gap();
    print(`&nbsp;&nbsp;<span class="tk">Email   &nbsp;</span>&nbsp;<a href="mailto:abidmohamedyassine00@gmail.com" class="tl">abidmohamedyassine00@gmail.com</a>`);
    print(`&nbsp;&nbsp;<span class="tk">Phone   &nbsp;</span>&nbsp;+216 28 592 003`);
    print(`&nbsp;&nbsp;<span class="tk">GitHub  &nbsp;</span>&nbsp;<a href="https://github.com/MohamedYassineAbid" target="_blank" class="tl">github.com/MohamedYassineAbid</a>`);
    print(`&nbsp;&nbsp;<span class="tk">LinkedIn&nbsp;</span>&nbsp;<a href="https://linkedin.com/in/mohamed-yassine-abid" target="_blank" class="tl">linkedin.com/in/mohamed-yassine-abid</a>`);
    gap();
  },

  github() {
    print(`&nbsp;&nbsp;Opening GitHub…`);
    setTimeout(() => window.open('https://github.com/MohamedYassineAbid', '_blank'), 300);
    gap();
  },

  cv() {
    print(`&nbsp;&nbsp;Downloading CV…`);
    const a = document.createElement('a');
    a.href = 'Mohamed-Yassine-Abid_CV.pdf';
    a.download = 'Mohamed-Yassine-Abid_CV.pdf';
    a.click();
    gap();
  },

  clear() { termOutput.innerHTML = ''; },

  gui() {
    print(`&nbsp;&nbsp;Switching to GUI… <span class="tm">(press Esc anytime to reopen)</span>`);
    setTimeout(closeTerminal, 500);
  },

  exit() {
    print(`&nbsp;&nbsp;Closing terminal…`);
    setTimeout(closeTerminal, 400);
  },
};

/* ── input handling ───────────────────────────────────── */
termInput.addEventListener('keydown', e => {

  if (e.key === 'Enter') {
    const raw = termInput.value.trim();
    termInput.value = '';
    historyIndex = -1;
    if (!raw) return;

    cmdHistory.unshift(raw);
    if (cmdHistory.length > 100) cmdHistory.pop();

    printCmd(raw);
    const cmd = raw.toLowerCase().split(/\s+/)[0];

    if (COMMANDS[cmd]) {
      COMMANDS[cmd]();
    } else {
      print(`&nbsp;&nbsp;<span class="te">command not found: ${escHtml(raw)}</span>&nbsp;— type <span class="tc">help</span>`);
      gap();
    }
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex < cmdHistory.length - 1) {
      historyIndex++;
      termInput.value = cmdHistory[historyIndex];
    }
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) { historyIndex--; termInput.value = cmdHistory[historyIndex]; }
    else { historyIndex = -1; termInput.value = ''; }
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    const partial = termInput.value.toLowerCase();
    if (!partial) return;
    const match = Object.keys(COMMANDS).find(c => c.startsWith(partial));
    if (match) termInput.value = match;
  }
});

termBody.addEventListener('click', () => termInput.focus());
