import { getSprite, MOB_NAMES, meIdOf } from '../art/sprites.js';
import { ITEMS } from '../game/items.js';
import { CLASSES } from '../game/data.js';
import { HEROES } from '../game/heroes.js';

const root = document.getElementById('root');
const scale = +(new URLSearchParams(location.search).get('s') || 3);
function section(title, items) {
  const h = document.createElement('h2'); h.textContent = title; root.appendChild(h);
  const g = document.createElement('div'); g.className = 'g'; root.appendChild(g);
  for (const [label, k, id, v] of items) {
    const c = document.createElement('div'); c.className = 'c';
    const src = getSprite(k, id, v || 'n'); const cv = document.createElement('canvas');
    cv.width = src.width; cv.height = src.height; cv.style.width = src.width * scale + 'px'; cv.style.height = src.height * scale + 'px';
    cv.getContext('2d').drawImage(src, 0, 0);
    const t = document.createElement('div'); t.textContent = label;
    c.append(cv, t); g.appendChild(c);
  }
}
const base = { weapon: 'w_wood', head: null, body: 'b_cloth', back: null };
section('ผู้เล่น (ทรงผม)', [0, 1, 2, 3, 4].map(h => [`ทรงผม ${h}`, 'me', meIdOf({ look: { hair: h, hc: h + 1, skin: h % 5, eye: h }, eq: base })]));
for (const slot of ['weapon', 'head', 'body', 'back']) section(`ไอเทม: ${slot}`, ITEMS.filter(i => i.slot === slot).map(i => [i.n, 'me', meIdOf({ look: { hair: 0, hc: 1, skin: 1, eye: 2 }, eq: { ...base, [slot]: i.id } })]));
section('อาชีพ (ชุดแนะนำ)', CLASSES.map((c, i) => [c.name, 'cls', `${c.id}|${i % 5}|${i % 8}|1|2`]));
section('ตื่นรู้ (ออร่า + สายผสม)', ['pure', 'str', 'agi', 'int', 'vit', 'per'].map(p => [p, 'me', meIdOf({ look: { hair: 1, hc: 2, skin: 1, eye: 3 }, eq: { weapon: 'w_bow0', head: null, body: 'b_ranger', back: 'k_quiver' }, glow: p === 'pure' ? '#9fe0ff' : '#ff7a3d', path: p })]));
section('ฮีโร่กาชา', HEROES.map(h => [`★${h.star} ${h.n}`, 'hero', h.id]));
section('มอนสเตอร์', MOB_NAMES.map(n => [n, 'mob', n]));
section('วัตถุ', [['หีบ', 'obj', 'chest'], ['น้ำพุ', 'obj', 'spring']]);
section('รูปแบบพิเศษ', [['โดนตี', 'mob', 'ก๊อบลิน', 'flash'], ['เงา', 'mob', 'หัวหน้าก๊อบลิน', 'shadow'], ['หยุดนิ่ง', 'mob', 'อัศวินมืด', 'gray'], ['ลับ', 'cls', 'monarch', 'sil']]);
/* dev helper: show(k,id,v,scale) renders one sprite big at the top of the page */
window.show = (k, id, v = 'n', s = 8) => { const src = getSprite(k, id, v); const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height; cv.style.cssText = `width:${src.width * s}px;height:${src.height * s}px;position:fixed;top:0;left:0;z-index:9;background:#14233f`; cv.getContext('2d').drawImage(src, 0, 0); document.querySelectorAll('.big').forEach(e => e.remove()); cv.className = 'big'; document.body.appendChild(cv); return [src.width, src.height]; };
