// TROPHY GUIDE HQ — tracker, filters, spoiler setting, roadmap and per-trophy guides for the official
// 55-trophy GTA VI list. Static and offline: the only file it loads is data/trophies.json beside it.
// Progress lives in localStorage on this device; export/import move it as a JSON file.
const EARNED_KEY = 'tghq-earned-v1';
const SPOILER_KEY = 'tghq-spoiler';
const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
const KIND_LABEL = {
  story: 'Story', collectible: 'Collectible', cumulative: 'Cumulative', skill: 'Skill',
  exploration: 'Exploration', completion: 'Completion', special: 'Special',
};

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map(t => [t.id, t]));
const byName = new Map(trophies.map(t => [t.name, t]));

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]').filter(id => byId.has(id)));
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
const filters = { q: '', grade: 'all', kind: 'all', status: 'all', missable: false };
let view = 'guide';

const $ = id => document.getElementById(id);
const els = {
  pct: $('pct'), count: $('count'), barfill: $('barfill'), gradechips: $('gradechips'), toplat: $('toplat'),
  q: $('q'), grade: $('f-grade'), kind: $('f-kind'), status: $('f-status'), missable: $('f-missable'),
  spoiler: $('spoiler'), showing: $('showing'), grid: $('grid'), noresults: $('noresults'),
  phases: $('phases'), modal: $('modal'), modalBody: $('modal-body'),
};

function save() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function isSpoiled(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function chip(text, cls) {
  const s = document.createElement('span');
  s.className = 'chip ' + cls;
  s.textContent = text;
  return s;
}

function earnedBox(t) {
  const label = document.createElement('label');
  label.className = 'earned-box';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderAll();
  });
  const text = document.createElement('span');
  text.textContent = 'Earned';
  label.append(box, text);
  return label;
}

/* ---------- header progress ---------- */
function renderProgress() {
  const total = trophies.length;
  els.pct.textContent = `${Math.round((earned.size / total) * 100)}%`;
  els.count.textContent = `${earned.size} of ${total} earned`;
  els.barfill.style.width = `${(earned.size / total) * 100}%`;
  els.gradechips.replaceChildren();
  for (const g of GRADES) {
    const all = trophies.filter(t => t.grade === g);
    const got = all.filter(t => earned.has(t.id)).length;
    const c = chip(`${g[0].toUpperCase() + g.slice(1)} ${got}/${all.length}`, 'grade-' + g);
    els.gradechips.append(c);
  }
  const left = trophies.filter(t => t.grade !== 'platinum' && !earned.has(t.id)).length;
  els.toplat.textContent = left === 0
    ? 'Every other trophy is earned — the platinum, Vice Got a Price!, is yours.'
    : `${left} ${left === 1 ? 'trophy stands' : 'trophies stand'} between you and the platinum.`;
}

/* ---------- guide view ---------- */
function matches(t) {
  if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
  if (filters.status === 'earned' && !earned.has(t.id)) return false;
  if (filters.status === 'open' && earned.has(t.id)) return false;
  if (filters.missable && !t.missable) return false;
  if (filters.q) {
    const hay = `${t.name} ${t.description}`.toLowerCase();
    if (!hay.includes(filters.q.toLowerCase())) return false;
  }
  return true;
}

function cardFor(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.id) ? ' is-earned' : '');
  const spoiled = isSpoiled(t);

  const top = document.createElement('div');
  top.className = 'card-top';
  top.append(earnedBox(t), chip(t.grade, 'grade-' + t.grade));
  card.append(top);

  const name = document.createElement('h3');
  name.className = 'card-name' + (spoiled ? ' blurred' : '');
  name.textContent = spoiled ? 'Hidden story trophy' : t.name;
  card.append(name);

  const tags = document.createElement('div');
  tags.className = 'tags';
  tags.append(chip(KIND_LABEL[t.kind], 'kind'));
  if (t.missable) tags.append(chip('Missable — flagged', 'missable'));
  if (spoiled) tags.append(chip('Spoiler hidden', 'spoiler-tag'));
  card.append(tags);

  const desc = document.createElement('p');
  desc.className = 'card-desc' + (spoiled ? ' blurred' : '');
  desc.textContent = spoiled ? 'Story trophy description hidden by the spoiler setting.' : t.description;
  card.append(desc);

  const guide = document.createElement('p');
  guide.className = 'card-guide' + (spoiled ? ' blurred' : '');
  guide.textContent = t.guide.split('. ')[0] + '.';
  card.append(guide);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'guide-btn';
  btn.textContent = 'Full guide & details';
  btn.addEventListener('click', () => openDetail(t.id));
  card.append(btn);
  return card;
}

function renderGuide() {
  const list = trophies.filter(matches);
  els.grid.replaceChildren(...list.map(cardFor));
  els.noresults.hidden = list.length > 0;
  els.showing.textContent = `Showing ${list.length} of ${trophies.length} trophies`;
}

/* ---------- roadmap view ---------- */
const PHASES = [
  {
    title: 'Phase 1 — Story first, and the moments that may not wait',
    blurb: 'Play the campaign and the character strands first. Story trophies unlock by completing the chapters, missions and strand finales named in their official descriptions — and the trophies flagged missable from their descriptions sit in this phase too, so they are handled before the story can move past them.',
    pick: t => t.kind === 'story' || t.missable,
  },
  {
    title: 'Phase 2 — See Leonida: exploration, collectibles and one-off moments',
    blurb: 'With the story safe, work the map. Exploration and collectible trophies are all-of-them checklists built from their descriptions — every meditation spot, one operation per gang, every garage property — and the one-off special moments are picked up while travelling between them.',
    pick: t => t.kind === 'exploration' || t.kind === 'collectible' || t.kind === 'special',
  },
  {
    title: 'Phase 3 — The long game: cumulative grinds and skill feats',
    blurb: 'Counters and performances: totals to accumulate (250 stunts, $250,000 laundered, 50 challenges) and single feats to nail (five takedowns in one Combat Focus, gold medals at the shooting range). Most counters will already be part-full from Phases 1–2; finish them deliberately here.',
    pick: t => t.kind === 'cumulative' || t.kind === 'skill',
  },
  {
    title: 'Phase 4 — 100% completion, and the platinum',
    blurb: 'Close out the completion counter, then the platinum. A Long Road asks for 100% completion, and Vice Got a Price! — the platinum — is awarded for earning every other trophy on the list.',
    pick: t => t.kind === 'completion',
  },
];

function renderRoadmap() {
  els.phases.replaceChildren();
  const placed = new Set();
  PHASES.forEach((phase, i) => {
    const items = trophies.filter(t => !placed.has(t.id) && phase.pick(t));
    items.forEach(t => placed.add(t.id));
    const block = document.createElement('div');
    block.className = 'phase';
    const head = document.createElement('div');
    head.className = 'phase-head';
    const h = document.createElement('h3');
    h.textContent = phase.title;
    const got = items.filter(t => earned.has(t.id)).length;
    const count = chip(`${got}/${items.length} earned`, 'phase-count');
    head.append(h, count);
    const blurb = document.createElement('p');
    blurb.className = 'phase-blurb';
    blurb.textContent = phase.blurb;
    block.append(head, blurb);
    for (const t of items) {
      const row = document.createElement('div');
      row.className = 'phase-row' + (earned.has(t.id) ? ' is-earned' : '');
      row.append(earnedBox(t));
      const main = document.createElement('div');
      main.className = 'phase-main';
      const titleRow = document.createElement('div');
      titleRow.className = 'phase-title-row';
      const nm = document.createElement('strong');
      nm.textContent = t.name;
      titleRow.append(nm, chip(t.grade, 'grade-' + t.grade), chip(KIND_LABEL[t.kind], 'kind'));
      if (t.missable) titleRow.append(chip('Missable — flagged', 'missable'));
      const why = document.createElement('p');
      why.className = 'phase-why';
      why.textContent = `Official description: “${t.description}”`;
      main.append(titleRow, why);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'guide-btn small';
      btn.textContent = 'Guide';
      btn.addEventListener('click', () => openDetail(t.id));
      row.append(main, btn);
      block.append(row);
    }
    els.phases.append(block);
    void i;
  });
}

/* ---------- detail view ---------- */
function openDetail(id) {
  const t = byId.get(id);
  if (!t) return;
  const spoiled = isSpoiled(t);
  els.modalBody.replaceChildren();

  const tags = document.createElement('div');
  tags.className = 'tags';
  tags.append(chip(t.grade, 'grade-' + t.grade), chip(KIND_LABEL[t.kind], 'kind'));
  if (t.missable) tags.append(chip('Missable — flagged', 'missable'));
  els.modalBody.append(tags);

  const name = document.createElement('h2');
  name.id = 'modal-name';
  name.className = spoiled ? 'blurred' : '';
  name.textContent = spoiled ? 'Hidden story trophy' : t.name;
  els.modalBody.append(name);

  const descHead = document.createElement('h4');
  descHead.textContent = 'Official description';
  const desc = document.createElement('p');
  desc.className = spoiled ? 'blurred' : '';
  desc.textContent = spoiled ? 'Hidden by the spoiler setting until this trophy is earned.' : t.description;
  els.modalBody.append(descHead, desc);

  if (t.missable) {
    const box = document.createElement('div');
    box.className = 'missable-note';
    const h = document.createElement('h4');
    h.textContent = 'Why this is flagged missable';
    const p = document.createElement('p');
    p.textContent = t.missable_note;
    box.append(h, p);
    els.modalBody.append(box);
  }

  const guideHead = document.createElement('h4');
  guideHead.textContent = 'Guide — original, derived from the official description';
  const guide = document.createElement('p');
  guide.className = spoiled ? 'blurred' : '';
  guide.textContent = spoiled ? 'Hidden by the spoiler setting until this trophy is earned.' : t.guide;
  els.modalBody.append(guideHead, guide);

  const src = document.createElement('p');
  src.className = 'source-line';
  src.textContent = `Source: ${t.source}`;
  els.modalBody.append(src);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-btn';
  toggle.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    renderAll();
    openDetail(t.id);
  });
  els.modalBody.append(toggle);

  els.modal.hidden = false;
}

function closeDetail() {
  els.modal.hidden = true;
}
$('modal-close').addEventListener('click', closeDetail);
els.modal.addEventListener('click', e => { if (e.target === els.modal) closeDetail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

/* ---------- views ---------- */
function setView(next) {
  view = next;
  for (const b of document.querySelectorAll('.tab')) b.classList.toggle('active', b.dataset.view === view);
  $('view-guide').hidden = view !== 'guide';
  $('view-roadmap').hidden = view !== 'roadmap';
  $('view-sources').hidden = view !== 'sources';
  const url = new URL(location.href);
  if (view === 'guide') url.searchParams.delete('view');
  else url.searchParams.set('view', view);
  history.replaceState(null, '', url);
}
for (const b of document.querySelectorAll('.tab')) b.addEventListener('click', () => setView(b.dataset.view));

/* ---------- controls ---------- */
els.q.addEventListener('input', () => { filters.q = els.q.value.trim(); renderGuide(); });
els.grade.addEventListener('change', () => { filters.grade = els.grade.value; renderGuide(); });
els.kind.addEventListener('change', () => { filters.kind = els.kind.value; renderGuide(); });
els.status.addEventListener('change', () => { filters.status = els.status.value; renderGuide(); });
els.missable.addEventListener('change', () => { filters.missable = els.missable.checked; renderGuide(); });
els.spoiler.addEventListener('change', () => { spoiler = els.spoiler.checked; save(); renderAll(); });

$('export').addEventListener('click', () => {
  const payload = { app: 'trophy-guide-hq', game: doc.game, platform: doc.platform, version: 1, earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'trophy-guide-hq-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const list = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(list)) throw new Error('no earned list');
    earned = new Set(list.map(v => (typeof v === 'number' ? v : byName.get(v)?.id)).filter(id => byId.has(id)));
    save();
    renderAll();
  } catch {
    alert('That file does not look like a TROPHY GUIDE HQ progress export.');
  }
  e.target.value = '';
});

/* ---------- initial state from URL (deep links) ---------- */
const params = new URLSearchParams(location.search);
if (params.get('view')) view = params.get('view');
if (params.get('grade')) { filters.grade = params.get('grade'); els.grade.value = filters.grade; }
if (params.get('kind')) { filters.kind = params.get('kind'); els.kind.value = filters.kind; }
if (params.get('status')) { filters.status = params.get('status'); els.status.value = filters.status; }
if (params.get('missable') === '1') { filters.missable = true; els.missable.checked = true; }
if (params.get('spoiler') === '1') { spoiler = true; save(); }
if (params.get('q')) { filters.q = params.get('q'); els.q.value = filters.q; }
els.spoiler.checked = spoiler;

function renderAll() {
  renderProgress();
  renderGuide();
  renderRoadmap();
}
renderAll();
setView(['guide', 'roadmap', 'sources'].includes(view) ? view : 'guide');
if (params.get('detail')) openDetail(Number(params.get('detail')));
