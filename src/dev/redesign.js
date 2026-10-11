import { getSprite } from '../art/sprites.js';
import { figure } from '../art/figure.js';
import { finish } from '../art/raster.js';
import { CLASSES, HC, SKIN, EYES } from '../game/data.js';

/* Dev-only redesign preview (open /redesign.html): three classes that read alike today (fighter, thief, ranger)
   redrawn with the game's own figure renderer, next to their current sprites. Nothing here changes the game.
   Principles: one signature shape per class, outfits by class line, one stand-out colour, and an awakened
   form that becomes real combat gear instead of only adding a cape. */
const LOOK = { hairStyle: 'short', hair: HC[1], skin: SKIN[1], eye: EYES[2] };
const DEF = { w: '#d6dde6', k: '#6b4a2b', a: '#e9eef5', y: '#ffd34d', g: '#7fe7ff', r: '#8a1a2a', x: '#9aa4b0', n: '#e8dcc0', p: '#3b3b4f', b: '#4a2f1f', o: '#3a4258' };
const spec = (outfit, gear, pal, o = {}) => ({ kind: 'hum', species: 'human', ...LOOK, outfit, gear, pal: { ...DEF, ...pal }, aff: o.aff || null, glow: o.glow || null });

const NEW = {
  fighter: {
    title: 'แวนการ์ดแดง', color: '#d23a3a',
    base: spec('tactical', ['greatsword', 'pauldron', 'bandana', 'gauntlets'],
      { c: '#2b2d36', d: '#1c1e25', a: '#d23a3a', p: '#24262e', b: '#15161b', am: '#8a94a2', bk: '#3a2a1a', gl: '#3a3d47', o: '#d23a3a', w: '#e2e8f0', x: '#9aa4b0', k: '#3a2a1a', y: '#c9a46a' }, { aff: '#d23a3a' }),
    aw: spec('armor', ['greatsword', 'pauldron', 'bandana', 'gauntlets', 'cape'],
      { c: '#3a3f4c', d: '#262a33', a: '#d23a3a', p: '#2a2e38', b: '#1c1f26', am: '#6f7886', gl: '#6f7886', o: '#d23a3a', r: '#a01c1c', ry: '#ffd34d', w: '#ffe9a8', x: '#d6dde6', k: '#3a2a1a', y: '#ffd34d' }, { aff: '#ffd34d', glow: '#ffd34d' }),
    notes: [
      'รูปทรงประจำ: ดาบใหญ่ที่ยื่นเหนือหัว + บ่าเกราะข้างเดียว + ผ้าโพกหัวที่ปลายปลิว เห็นได้แม้เป็นเงาดำ (แบบ FFT)',
      'ชุดสาย STR: เสื้อกั๊กแทคติคอลสีถ่าน แทนแจ็กเก็ตที่ใครก็ใส่ (แบบ ZZZ)',
      'สีเด่นสีเดียว: แดงเลือดนก อยู่ที่ผ้าโพก บ่า และขอบชุด (แบบ Sea of Stars)',
      'ตื่นรู้ = เปลี่ยนเป็นเกราะเต็มตัว ไม่ใช่แค่เพิ่มผ้าคลุม (แบบ Arknights Elite 2)',
    ],
  },
  thief: {
    title: 'หัวขโมยแห่งตรอก', color: '#b8ff6b',
    base: spec('hoodie', ['hood', 'scarf', 'daggers'],
      { c: '#23262b', d: '#16181c', a: '#b8ff6b', p: '#1f2226', b: '#e9eef5', o: '#2c3036', sc: '#b8ff6b', w: '#d6dde6', y: '#b8ff6b' }),
    aw: spec('leather', ['hood', 'mask', 'scarf', 'daggers', 'gauntlets'],
      { c: '#111316', d: '#0b0c0e', a: '#b8ff6b', p: '#111316', b: '#0b0c0e', o: '#111316', ha: '#1b1e22', sc: '#b8ff6b', gl: '#1b1e22', w: '#e9eef5', y: '#b8ff6b' }, { aff: '#b8ff6b', glow: '#b8ff6b' }),
    notes: [
      'รูปทรงประจำ: ฮู้ดคลุมหัว + ผ้าพันคอยาวที่ปลิวไปด้านหลัง ซิลูเอตต์จึงยาวแนวนอน ต่างจากนักธนูที่สูงแนวตั้ง',
      'ชุดสาย AGI: สตรีทแวร์ ฮู้ดดี้สีเข้ม + รองเท้าผ้าใบขาว แทนแจ็กเก็ตเขียวขี้ม้า + เป้',
      'สีเด่นสีเดียว: เขียวมะนาวนีออน (สีเดียวกับออร่าตื่นรู้เดิม จึงต่อเนื่องกัน)',
      'ตื่นรู้ = ชุดแนบตัวสีดำล้วน + ผ้าปิดหน้า ผ้าพันคอยังอยู่ จำได้ว่าเป็นคนเดิม',
    ],
  },
  ranger: {
    title: 'เรนเจอร์ภาคสนาม', color: '#ff8a3d',
    base: spec('jacket', ['cap', 'bow', 'backpack', 'quiver', 'glasses'],
      { c: '#4a5a32', d: '#33402a', a: '#e8e2c8', p: '#3a3a30', b: '#5c3d22', o: '#ff8a3d', ha: '#e06a20', hg: '#3a2a1a', k: '#6b4a2b', y: '#c9a46a', qk: '#6b5a3a', qa: '#ff8a3d' }),
    aw: spec('coat', ['circlet', 'bow', 'quiver', 'cape'],
      { c: '#1d3b4f', d: '#16263a', a: '#bfe9ff', p: '#16263a', b: '#0f1a28', ha: '#e2e8f0', hg: '#9fe0ff', r: '#16263a', ry: '#bfe9ff', k: '#2b3b4f', y: '#bfe9ff', qk: '#16263a', qa: '#9fe0ff' }, { aff: '#9fe0ff', glow: '#9fe0ff' }),
    notes: [
      'รูปทรงประจำ: เป้เดินป่าใบใหญ่ด้านหลัง + ลูกศรขนนกส้มโผล่เหนือไหล่ + ปีกหมวกแก๊ป (คันธนูอยู่ในเงาลำตัว จึงใช้แทนไม่ได้)',
      'ชุดสายภาคสนาม: แจ็กเก็ตเดินป่าสีเขียวขี้ม้า + แว่นกันแดด เหมือนนักล่าในโลกจริง',
      'สีเด่นสีเดียว: ส้มนักล่า (hunter orange) สีที่นักล่าจริงใช้ให้คนอื่นเห็นตัว',
      'ตื่นรู้ = โค้ทยาวสีกลางคืน + มงกุฎเงินอัญมณีจันทร์ ตามชื่อ "เงาจันทร์" เปลี่ยนจากนักล่าเป็นมือสังหารระยะไกล',
    ],
  },
};

/* the same rendering steps as sprites.js: spec → figure → finish → canvas ('n' normal, 'sil' black silhouette) */
const rgb = c => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
function toCanvas(F, v) {
  const { W, H, c, kind } = F; let y0 = 0, y1 = H - 1;
  const rowHas = y => { for (let x = 0; x < W; x++) if (kind[y * W + x]) return true; return false; };
  while (y0 < y1 && !rowHas(y0)) y0++; while (y1 > y0 && !rowHas(y1)) y1--;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = y1 - y0 + 1;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, cv.height), d = img.data;
  for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, kd = kind[i]; if (!kd) continue;
    if (v === 'sil' && kd === 3) continue;
    const o = ((y - y0) * W + x) * 4, [r, g, b] = v === 'sil' ? [7, 10, 18] : rgb(c[i]);
    d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = kd === 3 ? 170 : 255;
  }
  ctx.putImageData(img, 0, 0); return cv;
}
const newSprite = (s, v = 'n') => toCanvas(finish(figure(s), { glow: s.glow }), v);
const oldSprite = (cid, awake, v = 'n') => getSprite('cls', [cid, 0, 1, 1, 2, awake ? 1 : 0].join('|'), v);
function scaled(src, k) {
  const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
  cv.style.width = src.width * k + 'px'; cv.style.height = src.height * k + 'px'; cv.getContext('2d').drawImage(src, 0, 0); return cv;
}
const fig = (src, k, cap, col) => { const f = document.createElement('figure'); f.append(scaled(src, k)); const c = document.createElement('figcaption'); c.textContent = cap; if (col) c.style.color = col; f.append(c); return f; };
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

const root = document.getElementById('root'), ids = Object.keys(NEW), cname = id => CLASSES.find(c => c.id === id).name;

/* 1) silhouette test */
const sil = el('section', 'block');
sil.append(el('h2', '', '1 · ทดสอบซิลูเอตต์ (ทาดำทั้งตัว)'), el('p', 'muted', 'ถ้าดีไซน์ดี ต้องบอกได้ว่าเป็นอาชีพไหนแม้เห็นแค่เงาดำ'));
for (const [label, make] of [['เดิม', id => oldSprite(id, false, 'sil')], ['ใหม่', id => newSprite(NEW[id].base, 'sil')]]) {
  const row = el('div', 'row'); row.append(el('div', 'rowlabel', label));
  ids.forEach(id => row.append(fig(make(id), 3, cname(id))));
  sil.append(row);
}
root.append(sil);

/* 2) before / after per class */
const cmp = el('section', 'block');
cmp.append(el('h2', '', '2 · เทียบก่อนและหลัง'));
for (const id of ids) {
  const n = NEW[id], c = CLASSES.find(x => x.id === id), card = el('article', 'card');
  card.style.setProperty('--acc', n.color);
  card.append(el('h3', '', `${c.name} <span class="muted">→ ${n.title}</span>`));
  const figs = el('div', 'figs');
  const g1 = el('div', 'grp old'); g1.append(el('div', 'tag', 'เดิม'), fig(oldSprite(id, false), 3, 'ปกติ'), fig(oldSprite(id, true), 3, c.aw.name, c.aw.glow));
  const g2 = el('div', 'grp new'); g2.append(el('div', 'tag', 'ใหม่'), fig(newSprite(n.base), 3, 'ปกติ'), fig(newSprite(n.aw), 3, c.aw.name, n.aw.glow));
  figs.append(g1, g2); card.append(figs);
  const ul = el('ul'); n.notes.forEach(t => ul.append(el('li', '', t))); card.append(ul);
  cmp.append(card);
}
root.append(cmp);

/* 3) at the size the arena draws them */
const real = el('section', 'block');
real.append(el('h2', '', '3 · ขนาดจริงในเกม (2×)'), el('p', 'muted', 'ฉากต่อสู้วาดตัวละครประมาณนี้ ดูว่าแยกกันออกไหมเมื่อยืนเรียงกัน'));
for (const [label, make] of [['เดิม', id => oldSprite(id, false)], ['ใหม่', id => newSprite(NEW[id].base)]]) {
  const row = el('div', 'row stage'); row.append(el('div', 'rowlabel', label));
  ids.forEach(id => row.append(fig(make(id), 2, cname(id))));
  real.append(row);
}
root.append(real);
