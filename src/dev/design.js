import { getSprite } from '../art/sprites.js';
import { CLASSES, ACT, PAS, HAIR, HC, SKIN, EYES, STAT_NAME, fxText } from '../game/data.js';
import { SUBCLASSES, SUB_LV, SUB_PAIR } from '../game/subclass.js';
import { actDesc } from '../game/rules.js';

/* Dev-only class design sheet: every class (base + awakened portrait) with its full kit, plus the secondary classes.
   Open /design.html on the dev server. */
const look = { hair: 0, hc: 1, skin: 1, eye: 2, scale: 3 };
function draw(cid, awake, scale = look.scale) {
  const src = getSprite('cls', [cid, look.hair, look.hc, look.skin, look.eye, awake ? 1 : 0].join('|'));
  const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
  cv.style.width = src.width * scale + 'px'; cv.style.height = src.height * scale + 'px';
  cv.getContext('2d').drawImage(src, 0, 0);
  return cv;
}

const RC = { C: '#9fb4cf', B: '#4fdc9b', A: '#ffc85a', S: '#a37bff', SS: '#ff5a7a', SSS: '#ffe27a', '???': '#4ff3ff' };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const group = c => c.cond ? 'ลับ · ปลดล็อกด้วยเงื่อนไข' : c.hidden ? 'ลับ · สุ่มได้' : 'ปกติ';
const swatches = pal => Object.entries(pal).map(([k, v]) => `<span class="sw" title="${k} ${v}" style="background:${v}"></span>`).join('');

function card(c) {
  const el = document.createElement('article'); el.className = 'card'; el.id = c.id;
  const odds = c.w > 0 ? `${c.w}%` : 'เงื่อนไข';
  el.innerHTML = `
    <header><span class="rar" style="color:${RC[c.rar]}">${esc(c.rar)}</span><h2>${esc(c.name)}</h2><span class="muted">${c.id} · ${STAT_NAME[c.main].ab} · ${odds}</span></header>
    <div class="figs"><figure data-k="base"><figcaption>${esc(c.name)}</figcaption></figure><figure data-k="aw"><figcaption style="color:${c.aw.glow}">${esc(c.aw.name)}</figcaption></figure></div>
    <p class="desc">${esc(c.desc)}</p>
    ${c.cond ? `<p class="hint">${esc(c.cond.hint)}</p>` : ''}
    <dl>
      <dt>ชุด</dt><dd>${c.outfit || 'tunic'} · ${c.art[0].join(', ') || 'มือเปล่า'} <span class="muted">→ ตื่นรู้ +${c.aw.ov.join(', ')}</span><div class="sws">${swatches(c.art[1])}</div></dd>
      <dt>ติดตัว</dt><dd><b>${esc(c.trait.n)}</b> ${esc(fxText(c.trait.fx))}</dd>
      <dt>Active</dt><dd>${c.act.map(id => `<div><b>${esc(ACT[id].n)}</b> <span class="muted">MP ${ACT[id].mp}</span> ${esc(actDesc(id, 'C'))}</div>`).join('')}</dd>
      <dt>Passive</dt><dd>${c.pasIds.map(id => `<div><b>${esc(PAS[id].n)}</b> ${esc(fxText(PAS[id].fx))}</div>`).join('')}</dd>
      <dt>ตื่นรู้</dt><dd><b>${esc(c.aw.trait.n)}</b> ${esc(fxText(c.aw.trait.fx))}<div><b style="color:${c.aw.glow}">${esc(c.aw.ult.n)}</b> <span class="muted">MP ${c.aw.ult.mp}</span> ${esc(actDesc('u_' + c.id, 'C'))}</div></dd>
    </dl>`;
  return el;
}
function subCard(s) {
  const el = document.createElement('article'); el.className = 'card sub';
  el.innerHTML = `
    <header><span class="rar" style="color:${RC[s.rar]}">${s.rar}</span><h2>${esc(s.name)}</h2><span class="muted">${s.id} · น้ำหนักสุ่ม ${s.w}</span></header>
    <p class="desc">${esc(s.desc)}</p>
    <dl>
      <dt>โบนัส</dt><dd>${esc(fxText(s.fx))} <span class="muted">(เข้าคู่ ×${SUB_PAIR}: ${esc(fxText(s.fx, SUB_PAIR))})</span></dd>
      <dt>สกิล</dt><dd><b>${esc(s.act.n)}</b> <span class="muted">MP ${s.act.mp}</span> ${esc(actDesc('sub_' + s.id, 'C'))}</dd>
      <dt>เข้าคู่กับ</dt><dd>${s.pair.map(id => `<a href="#${id}">${esc(CLASSES.find(c => c.id === id).name)}</a>`).join(' · ')}</dd>
    </dl>`;
  return el;
}

function controls() {
  const sel = (key, opts, label) => `<label>${label}<select data-k="${key}">${opts.map((o, i) => `<option value="${i}" ${look[key] === i ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
  return `<div class="ctl">${sel('hair', HAIR.map(h => h.n), 'ทรงผม')}${sel('hc', HC, 'สีผม')}${sel('skin', SKIN, 'สีผิว')}${sel('eye', EYES, 'สีตา')}${sel('scale', ['', '1×', '2×', '3×', '4×'], 'ขนาด')}</div>`;
}
/* lineup: every class side by side (base, then awakened) to compare silhouettes and colours at a glance */
function lineup() {
  const el = document.createElement('section'); el.className = 'lineup';
  for (const c of CLASSES) {
    const f = document.createElement('a'); f.href = '#' + c.id; f.className = 'lu'; f.dataset.id = c.id;
    f.innerHTML = `<span style="color:${RC[c.rar]}">${esc(c.name)}</span>`;
    el.append(f);
  }
  return el;
}
function paintFigures() {
  for (const f of document.querySelectorAll('.lu')) {
    const box = document.createElement('div'); box.className = 'pair';
    box.append(draw(f.dataset.id, false, 2), draw(f.dataset.id, true, 2)); f.querySelector('.pair')?.remove(); f.prepend(box);
  }
  for (const c of CLASSES) {
    const el = document.getElementById(c.id); if (!el) continue;
    for (const f of el.querySelectorAll('figure')) {
      f.querySelector('canvas')?.remove();
      try { f.prepend(draw(c.id, f.dataset.k === 'aw')); }
      catch (e) { const p = document.createElement('pre'); p.textContent = e.message; f.prepend(p); }
    }
  }
}
function render() {
  const root = document.getElementById('sheet');
  const groups = ['ปกติ', 'ลับ · สุ่มได้', 'ลับ · ปลดล็อกด้วยเงื่อนไข'];
  root.innerHTML = `<h1>Arise · Class Design Sheet</h1><p class="muted">${CLASSES.length} อาชีพ · ${SUBCLASSES.length} อาชีพรอง (ปลดล็อกเลเวล ${SUB_LV}) · ภาพจาก getSprite('cls')</p>${controls()}`;
  root.append(lineup());
  for (const gname of groups) {
    const h = document.createElement('h3'); h.textContent = `อาชีพ${gname}`; root.append(h);
    const grid = document.createElement('section'); grid.className = 'grid';
    CLASSES.filter(c => group(c) === gname).forEach(c => grid.append(card(c)));
    root.append(grid);
  }
  const h = document.createElement('h3'); h.textContent = 'อาชีพรอง'; root.append(h);
  const grid = document.createElement('section'); grid.className = 'grid';
  SUBCLASSES.forEach(s => grid.append(subCard(s))); root.append(grid);
  root.querySelectorAll('.ctl select').forEach(s => s.addEventListener('change', () => { look[s.dataset.k] = +s.value; paintFigures(); }));
  paintFigures();
}

const css = document.createElement('style');
css.textContent = `
:root{color-scheme:dark;--bg:#050913;--panel:#0a1324;--line:#1f4f86;--ink:#dfe8f5;--muted:#7f93ad}
body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 'IBM Plex Sans Thai',sans-serif}
#sheet{max-width:1400px;margin:0 auto;padding:20px 16px 60px}
h1{font:700 26px 'Chakra Petch',sans-serif;margin:0 0 4px;letter-spacing:.04em}
h3{font:600 18px 'Chakra Petch',sans-serif;margin:28px 0 10px;color:#58c4ff}
.muted{color:var(--muted);font-size:12px}
.ctl{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0}
.ctl label{display:flex;gap:6px;align-items:center}
.ctl select{background:var(--panel);color:var(--ink);border:1px solid var(--line);padding:3px 6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:12px}
.card{background:var(--panel);border:1px solid var(--line);padding:12px}
.card header{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.card h2{font:600 18px 'Chakra Petch','IBM Plex Sans Thai',sans-serif;margin:0}
.rar{font:700 14px 'Chakra Petch',sans-serif}
.figs{display:flex;gap:8px;justify-content:center;background:radial-gradient(#13223d,#070d1a);margin:8px 0;padding:6px 0}
figure{margin:0;display:flex;flex-direction:column;align-items:center}
figure canvas{image-rendering:pixelated}
figcaption{font-size:12px;color:var(--muted)}
.desc{margin:6px 0}.hint{margin:4px 0;color:#4ff3ff;font-size:12px}
dl{display:grid;grid-template-columns:62px 1fr;gap:4px 8px;margin:6px 0 0;font-size:13px}
dt{color:var(--muted)}dd{margin:0}
.sws{display:flex;gap:2px;margin-top:3px}.sw{width:12px;height:12px;border:1px solid #000}
a{color:#58c4ff}
.lineup{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:6px;margin:8px 0 4px}
.lu{display:flex;flex-direction:column;align-items:center;background:radial-gradient(#13223d,#070d1a);border:1px solid var(--line);padding:4px 2px;text-decoration:none;font-size:12px}
.lu .pair{display:flex;align-items:flex-end}
.lu canvas{image-rendering:pixelated}
pre{color:#ff5a7a;white-space:pre-wrap;font-size:11px}
`;
document.head.append(css);
render();
