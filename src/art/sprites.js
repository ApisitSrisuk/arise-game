import { quad, bug, treant, snowGolem, chest, spring } from './chibi.js';
import { figure } from './figure.js';
import { building, resIcon } from './buildings.js';
import { dragon } from './beasts.js';
import { HERO_LOOK } from './looks.js';
import { finish } from './raster.js';
import { CLASSES, HC, SKIN, EYES, AFFINITY } from '../game/data.js';
import { HEROES } from '../game/heroes.js';
import { ITEM } from '../game/items.js';

/* sprite specs → finished pixel buffers → cached canvases per variant
   variants: n normal · flash (hit) · sil (unknown) · shadow (shadow soldier) · gray (frozen) */
const HAIR_STYLE = ['short', 'long', 'spiky', 'pony', 'bangs'];
const DEF = { w: '#d6dde6', k: '#6b4a2b', a: '#e9eef5', y: '#ffd34d', g: '#7fe7ff', r: '#8a1a2a', x: '#9aa4b0', n: '#e8dcc0', p: '#3b3b4f', b: '#4a2f1f', o: '#3a4258' };

/* player id: weapon,head,body,back | hair | hairColour | skin | eye | glow | path
   the look comes from equipped items; awakening adds a glow and, on a hybrid path, that path's extras */
export const meIdOf = ({ look, eq, glow = null, path = 'pure' }) =>
  [[eq.weapon, eq.head, eq.body, eq.back].map(x => x || '-').join(','), look.hair, look.hc, look.skin, look.eye, glow || '-', path || 'pure'].join('|');
export function meSpec(id) {
  const [eqs, hair, hc, skin, eye, glow, path] = id.split('|');
  const items = eqs.split(',').map(x => ITEM[x]).filter(Boolean);
  const hyb = glow !== '-' && AFFINITY[path] ? AFFINITY[path] : null;
  const body = items.find(i => i.slot === 'body');
  const pal = { ...DEF, ...ITEM.b_tee.look.pal, ...Object.assign({}, ...items.map(i => i.look.pal)) };
  if (hyb && path === 'int') pal.g = hyb.glow;
  return {
    kind: 'hum', species: 'human', outfit: body ? body.look.outfit : 'tunic',
    hairStyle: HAIR_STYLE[+hair] || 'short', hair: HC[+hc], skin: SKIN[+skin],
    eye: hyb && path === 'per' ? hyb.glow : EYES[+eye], pal,
    gear: [...items.flatMap(i => i.look.gear || []), ...(hyb ? hyb.ov : [])],
    aff: hyb ? hyb.glow : null, glow: glow === '-' ? null : glow,
  };
}
/* class portrait for the codex and the class roll: the class's suggested outfit, optionally in its awakened form.
   'cls' ids: classId or classId|hair|hc|skin|eye, with |1 appended for the awakened form.
   Class palettes use the shared keys (w metal, a accent, y gold); the per-slot keys fall back to them.
   Awakened extras that take the aura colour (runes, eyemark, pauldron, scarf without sc) use the class glow. */
export function clsSpec(cid, look = { hair: 0, hc: 1, skin: 1, eye: 2 }, awake = false) {
  const c = CLASSES.find(x => x.id === cid) || CLASSES[0], cp = c.art[1];
  const pal = { ...DEF, hm: cp.w, am: cp.w, ha: cp.a, sm: cp.w, sa: cp.a, ...cp, ...(awake ? c.aw.pal : {}) };
  return {
    kind: 'hum', species: 'human', outfit: c.outfit || 'tunic', hairStyle: HAIR_STYLE[look.hair] || 'short', hair: HC[look.hc], skin: SKIN[look.skin], eye: cp.e || EYES[look.eye],
    pal, gear: [...c.art[0], ...(awake ? c.aw.ov : [])], glow: awake ? c.aw.glow : null, aff: awake ? c.aw.glow : null,
  };
}

/* gacha heroes: the modern restyle in looks.js wins over the look stored with the hero */
export function heroSpec(id) {
  const h = HEROES.find(x => x.id === id); if (!h) return MOB['ก๊อบลิน'];
  const look = HERO_LOOK[id] || h.look;
  return { kind: 'hum', species: 'human', ...look, pal: { ...DEF, ...look.pal } };
}

const MP = {
  goblin: { s: '#7cbf45', h: '#3f6b25', c: '#8a5a32', d: '#5c3d22', k: '#5c3d22', p: '#5c3d22', b: '#3e2a17', e: '#ffd23d', w: '#c9c2b0' },
  skel: { s: '#ece6d2', h: '#ece6d2', c: '#cfc9b5', a: '#7a2a2a', p: '#cfc9b5', b: '#8e8a7c', e: '#ff4040', w: '#b8c0c8', k: '#5a4030', y: '#b08a40' },
  orc: { s: '#5f8c43', h: '#1e1e1e', c: '#6b4b2a', d: '#4a321b', k: '#3a2a1a', p: '#3a2a1a', b: '#2a1a0e', e: '#ff5533' },
  iceelf: { s: '#e4eef8', h: '#f2f8ff', c: '#4aa3d8', a: '#bfe9ff', d: '#2b6e99', p: '#2b6e99', b: '#1e4f70', w: '#cfefff', k: '#1e4f70', e: '#2bd0ff', y: '#9fe0ff' },
  demon: { s: '#c2443e', h: '#3a1010', c: '#3a1010', a: '#ff8a3d', d: '#250808', p: '#250808', b: '#120404', e: '#ffe14d', n: '#efe2c4', k: '#3a1a10' },
  demon2: { s: '#8a3a8a', h: '#2a0a2a', c: '#2a0a2a', a: '#ff4fd8', d: '#1a051a', p: '#1a051a', b: '#0e030e', e: '#ffe14d', n: '#e2d2ee' },
  dknight: { c: '#2c2c38', a: '#ff3344', d: '#16161c', p: '#1e1e26', b: '#101014', w: '#4a4a5c', k: '#26222a', e: '#ff3344', y: '#8a7a50', s: '#2c2c38', h: '#2c2c38' },
  demonlord: { s: '#a02828', h: '#141414', c: '#1a0a12', a: '#d4af37', d: '#0e050a', p: '#0e050a', b: '#000000', r: '#5a0014', n: '#3a3a3a', x: '#5a0014', w: '#3a2a30', e: '#ffdd33', k: '#2a1a10', y: '#d4af37' },
  antking: { s: '#3a3046', h: '#2a2a33', c: '#3c2a4a', a: '#a37bff', d: '#1e1426', p: '#1e1426', b: '#111111', e: '#ff3355', k: '#111111', r: '#2a1a3a', w: '#c9b0ff', m: '#a37bff' },
  trial: { s: '#c9d2dc', h: '#c9d2dc', c: '#c9d2dc', a: '#7fe7ff', d: '#6b7584', p: '#4b525e', b: '#2a2f38', w: '#e2e8f0', k: '#3b2a7a', r: '#3b2a7a', x: '#7fe7ff', y: '#ffd34d', e: '#7fe7ff' },
  wolf: { a: '#8a94a2', d: '#555e6b', n: '#d8dde4', e: '#ffcc33', w: '#ffffff' },
  swolf: { a: '#3a3e5a', d: '#22243a', n: '#6a70a0', e: '#7fd0ff', w: '#cfe8ff' },
  bwolf: { a: '#9a2432', d: '#5a0f18', n: '#e09090', e: '#ffee55', w: '#ffffff' },
  bear: { a: '#eef2f6', d: '#aeb8c4', n: '#ffffff', e: '#222222', w: '#ffffff' },
  ant: { a: '#a0522d', k: '#3a1a0d', e: '#ffcc33', m: '#3a1a0d' },
  stone: { a: '#8a8070', k: '#4a443a', e: '#ff6a3d', m: '#4a443a' },
  queen: { a: '#b0643a', k: '#4a2410', e: '#ffdd33', m: '#ffd34d' },
  antb: { a: '#2a2a36', k: '#0e0e12', e: '#ff4466', m: '#5a5a6a' },
  antp: { a: '#6a9a32', k: '#2e4a14', e: '#e4ff4d', m: '#2e4a14' },
  antg: { a: '#5a4a80', k: '#241a36', e: '#ffcc33', m: '#d4af37' },
  tree: { a: '#5f9a35', d: '#5a3a1e', e: '#c8ff6b' },
  snow: { a: '#eef4fa', d: '#7f93a8', e: '#4fc3ff' },
  chest: { a: '#9a6432', k: '#4a2c12', y: '#ffd34d' },
  mimic: { a: '#9a6432', k: '#4a2c12', y: '#ffd34d', e: '#ff2a2a', w: '#f0ead8', r: '#5a0a14' },
  spring: { w: '#8a95a6', g: '#5fe8ff' },
  whelp: { a: '#d8482a', d: '#8a1a10', n: '#ffb020', w: '#ff7a3d', e: '#ffe14d', k: '#3a1a10', g: '#ffd34d' },
  wyvern: { a: '#6a8a3a', d: '#3a2a4a', n: '#a8c860', w: '#5a3a6a', e: '#e4ff4d', k: '#1a1420', v: '#9aff3a' },
  ancdragon: { a: '#9a1a1a', d: '#4a0808', n: '#d4af37', w: '#c0301a', e: '#ffe14d', y: '#ffd34d', g: '#ff8a2a' },
  boneknight: { s: '#e8e4d6', h: '#e8e4d6', c: '#1a1a22', a: '#8a1a1a', d: '#0e0e14', p: '#1a1a22', b: '#0e0e14', am: '#2a2a33', hm: '#e8e4d6', hy: '#8a7a50', ha: '#8a1a1a', n: '#d8d0c0', x: '#3a3a44', w: '#c9d2dc', k: '#1a1418', g: '#ff3344', e: '#ff3344' },
  examiner: { s: '#f1c39a', h: '#3a3a44', c: '#1e2a4a', d: '#14203a', a: '#ffd34d', p: '#1e2a4a', b: '#111111', y: '#ffd34d', ha: '#1a1a22', hg: '#bfe9ff', w: '#e2e8f0', k: '#2a1a12', e: '#2a3a5a' },
};
const hum = (pal, species, outfit, gear, extra = {}) => ({ kind: 'hum', species, outfit, gear, pal: { ...DEF, ...MP[pal] }, skin: MP[pal].s, hair: MP[pal].h, eye: MP[pal].e, ...extra });
const MOB = {
  'ก๊อบลิน': hum('goblin', 'goblin', 'rags', ['club'], { hairStyle: 'spiky' }),
  'ก๊อบลินนักธนู': hum('goblin', 'goblin', 'rags', ['hood', 'bow'], { pal: { ...DEF, ...MP.goblin, o: '#4a6a2a' } }),
  'หมาป่าเขี้ยวเหล็ก': { kind: 'quad', pal: MP.wolf },
  'หัวหน้าก๊อบลิน': hum('goblin', 'goblin', 'rags', ['cape', 'crownh', 'club'], { hairStyle: 'spiky', pal: { ...DEF, ...MP.goblin, r: '#8a1a1a' } }),
  'มดยักษ์': { kind: 'bug', pal: MP.ant },
  'ตะขาบหิน': { kind: 'bug', type: 'centi', pal: MP.stone },
  'โครงกระดูกทหาร': hum('skel', 'skel', 'bones', ['sword', 'shield']),
  'ราชินีมดหิน': { kind: 'bug', type: 'queen', pal: MP.queen },
  'หมาป่าเงา': { kind: 'quad', pal: MP.swolf },
  'ออร์คล่าสัตว์': hum('orc', 'orc', 'rags', ['club'], { hairStyle: 'none' }),
  'ภูตไม้': { kind: 'treant', pal: MP.tree },
  'จ่าฝูงหมาป่าสีเลือด': { kind: 'quad', pal: MP.bwolf },
  'เอลฟ์น้ำแข็ง': hum('iceelf', 'elf', 'leather', ['bow', 'quiver'], { hairStyle: 'long' }),
  'โกเลมหิมะ': { kind: 'snow', pal: MP.snow },
  'หมีขาวคลั่ง': { kind: 'quad', type: 'bear', pal: MP.bear },
  'นักรบเอลฟ์น้ำแข็ง': hum('iceelf', 'elf', 'armor', ['helm', 'sword'], { hairStyle: 'long' }),
  'อสูรเขาคู่': hum('demon', 'demon', 'bare', ['horns', 'club'], { hairStyle: 'spiky' }),
  'ปีศาจคลั่ง': hum('demon2', 'demon', 'bare', ['horns', 'daggers'], { hairStyle: 'long' }),
  'อัศวินมืด': hum('dknight', 'knight', 'armor', ['sword', 'shield']),
  'ขุนนางปีศาจ': hum('demonlord', 'demon', 'armor', ['cape', 'horns', 'greatsword'], { hairStyle: 'long' }),
  'มดทหาร': { kind: 'bug', pal: MP.antb },
  'มดพิษ': { kind: 'bug', pal: MP.antp },
  'มดราชองครักษ์': { kind: 'bug', pal: MP.antg },
  'ราชามด': hum('antking', 'insect', 'coat', ['cape', 'crownh', 'daggers']),
  'มิมิค': { kind: 'mimic', pal: MP.mimic },
  'ผู้คุมบททดสอบ': hum('trial', 'knight', 'armor', ['cape', 'crownh', 'greatsword']),
  /* sleeping-dragon valley and the guild rank exam */
  'ลูกมังกรไฟ': { kind: 'dragon', type: 'whelp', pal: MP.whelp },
  'อัศวินกระดูกมังกร': hum('boneknight', 'skel', 'armor', ['helm', 'horns', 'greatsword']),
  'ไวเวิร์นพิษ': { kind: 'dragon', type: 'wyvern', pal: MP.wyvern },
  'มังกรเพลิงโบราณ': { kind: 'dragon', type: 'ancient', pal: MP.ancdragon },
  'ผู้คุมสอบสมาคม': hum('examiner', 'human', 'coat', ['glasses', 'sword'], { hairStyle: 'short' }),
};
export const MOB_NAMES = Object.keys(MOB);
export const artKey = n => n.replace(/^ยอดฝีมือ·/, '');
/* unknown names (new content without art yet) fall back to the goblin */
export const mobSpec = name => MOB[artKey(name)] || MOB['ก๊อบลิน'];

function specFor(k, id) {
  if (k === 'me') return meSpec(id);
  if (k === 'cls') { const [cid, hair, hc, skin, eye, aw] = id.split('|'); return clsSpec(cid, hair ? { hair: +hair, hc: +hc, skin: +skin, eye: +eye } : undefined, aw === '1'); }
  if (k === 'hero') return heroSpec(id);
  if (k === 'obj') return { kind: id, pal: MP[id] };
  /* town: 'bld' ids are buildingId|level (1–5, max level glows), 'res' ids are resource keys */
  if (k === 'bld') { const [b, lv = 1] = id.split('|'); return { kind: 'bld', id: b, lv: +lv, glow: +lv >= 5 ? '#ffd34d' : null }; }
  if (k === 'res') return { kind: 'res', id };
  return mobSpec(id);
}
function build(spec) {
  switch (spec.kind) {
    case 'quad': return quad(spec);
    case 'bug': return bug(spec);
    case 'treant': return treant(spec);
    case 'snow': return snowGolem(spec);
    case 'chest': return chest(spec, false);
    case 'mimic': return chest(spec, true);
    case 'spring': return spring(spec);
    case 'dragon': return dragon(spec);
    case 'bld': return building(spec.id, spec.lv);
    case 'res': return resIcon(spec.id);
    default: return figure(spec);
  }
}

const BUF = new Map(), CV = new Map();
function buffer(k, id) {
  const key = k + '|' + id; let F = BUF.get(key);
  if (!F) { const spec = specFor(k, id); F = finish(build(spec), { glow: spec.glow }); BUF.set(key, F); }
  return F;
}
const rgbOf = c => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
function paint(F, v, flip) {
  const { W, H, c, kind, tag } = F;
  let y0 = 0, y1 = H - 1;
  const rowHas = y => { for (let x = 0; x < W; x++) if (kind[y * W + x]) return true; return false; };
  while (y0 < y1 && !rowHas(y0)) y0++; while (y1 > y0 && !rowHas(y1)) y1--;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = y1 - y0 + 1;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, cv.height), d = img.data;
  for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, kd = kind[i]; if (!kd) continue;
    const o = ((y - y0) * W + (flip ? W - 1 - x : x)) * 4;
    let [r, g, b] = rgbOf(c[i]), a = kd === 3 ? 170 : 255;
    const l = (r * .3 + g * .59 + b * .11) / 255, glowy = tag[i] === 101 || tag[i] === 103;
    if (v === 'flash') { if (kd === 2) [r, g, b] = [255, 214, 224]; else [r, g, b] = [255, 255, 255]; }
    else if (v === 'sil') { if (kd === 3) continue; [r, g, b] = [7, 10, 18]; }
    else if (v === 'shadow') { if (kd === 3) continue; if (kd === 2) [r, g, b] = [18, 10, 36]; else if (glowy) [r, g, b] = [224, 200, 255]; else [r, g, b] = [18 + l * 70, 8 + l * 40, 40 + l * 120]; }
    else if (v === 'gray') { if (kd === 1) { const q = 60 + l * 150; [r, g, b] = [q, q, q + 14]; } }
    d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}
/* returns a canvas at 1 logical pixel per pixel; callers scale it with smoothing off */
export function getSprite(k, id, v = 'n', flip = false) {
  const key = [k, id, v, flip ? 1 : 0].join('|'); let cv = CV.get(key);
  if (!cv) { cv = paint(buffer(k, id), v, flip); CV.set(key, cv); }
  return cv;
}
