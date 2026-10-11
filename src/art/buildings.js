import { painter } from './raster.js';
import { mix } from '../game/util.js';

/* Town buildings for a modern hunter town, drawn in 3/4 view on a 64×60 grid: front faces are lit (tone 2),
   right-hand sides recede up-right in shadow (tone 3), roofs catch the light (tone 1). Each sits on its own
   ground tile, feet on y≈55. Every level adds visible detail; level 5 also gets a gold glow (see sprites.js). */
export const BW = 64, BH = 60;
const G = 55;
const F = (t, o = {}) => ({ shade: 'flat', tone: t, ...o });
const NL = { line: false };

function ground(P, col) {
  P.ell(32, G + 1.5, 29.5, 4.6, col, F(3));
  P.ell(31, G + .8, 27, 3.4, col, F(2, NL));
}
/* box: lit front w×h at (x,y), shaded side of depth d, optional top face */
function box(P, x, y, w, h, d, col, top) {
  P.rect(x, y, w, h, col, F(2));
  P.poly([[x + w, y], [x + w + d, y - d * .5], [x + w + d, y + h - d * .5], [x + w, y + h]], col, F(3));
  if (top) P.poly([[x, y], [x + d, y - d * .5], [x + w + d, y - d * .5], [x + w, y]], top, F(1));
}
/* gable roof over a box: lit front triangle and the slope running back on the right */
function gable(P, x, y, w, h, d, col) {
  P.poly([[x + w / 2, y - h], [x + w / 2 + d, y - h - d * .5], [x + w + 1.5 + d, y + .5 - d * .5], [x + w + 1.5, y + .5]], col, F(2));
  P.poly([[x - 1.5, y + .5], [x + w / 2, y - h], [x + w + 1.5, y + .5]], col, F(1));
}
function win(P, x, y, w = 3, h = 3, lit = false) {
  P.rect(x, y, w, h, '#2a3442', F(3));
  P.rect(x + .5, y + .5, w - 1, h - 1, lit ? '#ffe9a8' : '#bfe9ff', F(lit ? 0 : 1, { line: false, tag: lit ? 'g' : undefined }));
}
function door(P, x, y, w, h, col = '#3a2a1e') { P.rect(x, y, w, h, col, F(3)); P.px(x + w - 1.5, y + h / 2, '#ffd34d', 1); }
function smoke(P, x, y, n) { for (let i = 0; i < n; i++) P.ell(x + i * 2.2, y - i * 3.2, 1.6 + i * .5, 1.3 + i * .4, '#b8c0cc', F(1, NL)); }
function flag(P, x, y, col) { P.line(x, y, x, y + 10, '#d6dde6', 1); P.poly([[x + 1, y], [x + 8, y + 1.5], [x + 1, y + 3.5]], col, F(2)); }

const DRAW = {
  /* association office: concrete floors with glass, flag on the roof; grows a floor at lv 3 and 5 */
  hall(P, lv) {
    ground(P, '#6a7280');
    const floors = 2 + (lv >= 3) + (lv >= 5), top = G - floors * 7 - 1;
    box(P, 14, top, 30, G - top, 8, '#a8b0bc', '#c9d2dc');
    for (let f = 0; f < floors; f++) for (const x of [17, 23, 32, 38]) if (!(f === floors - 1 && (x === 23 || x === 32))) win(P, x, top + 2 + f * 7, 3, 4, lv >= 4);
    P.rect(25, G - 7, 8, 7, '#bfe9ff', F(1)); P.line(29, G - 7, 29, G - 1, '#2a3442', 2, NL);
    if (lv >= 2) { P.rect(22, G - 10.5, 14, 2.5, '#2a4f9e', F(2)); P.px(29, G - 9.5, '#ffd34d', 0); }
    if (lv >= 3) P.rect(18, top - 3, 6, 3, '#8a94a2', F(2));
    flag(P, 40, top - 11, lv >= 5 ? '#ffd34d' : '#3a6fc4');
    if (lv >= 4) flag(P, 46, top - 10, '#c03030');
    if (lv >= 5) P.ell(29, top + 3.5, 2.2, 2.2, '#ffd34d', { hi: true, tag: 'g' });
  },
  /* greenhouse with crop rows; a silo at lv 2, tomatoes at lv 3, a second greenhouse at lv 4 */
  farm(P, lv) {
    ground(P, '#4a7a3a');
    const arch = (cx, rx, ry) => {
      P.ell(cx, G - 1, rx, ry, '#bfe9ff', { hi: true, clip: (x, y) => y < G - 1 });
      for (let x = Math.ceil(cx - rx + 2); x < cx + rx - 1; x += 4) P.line(x, G - 1 - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) + 1, x, G - 2, '#e9eef5', 1, NL);
    };
    if (lv >= 4) arch(13, 8, 8);
    arch(28, 13, 13);
    if (lv >= 2) { P.rect(44, G - 19, 8, 18, '#c9d2dc', { hi: true }); P.ell(48, G - 19, 4.5, 2.6, '#8a1a1a', { hi: true }); }
    for (let x = 8; x <= 54; x += 4) { P.ell(x, G + 2.5, 1.6, 1.1, '#5fbf3a', { hi: true }); if (lv >= 3 && x % 8 === 0) P.px(x, G + 2, '#e8473a', 1); }
  },
  /* sawmill shed with a round blade and a log pile that grows */
  lumber(P, lv) {
    ground(P, '#5a7a3a');
    box(P, 8, G - 15, 22, 15, 7, '#8a5a32');
    gable(P, 8, G - 15, 22, 7, 7, '#5c3d22');
    P.rect(12, G - 10, 10, 10, '#2a1a12', F(4));
    P.ell(17, G - 6, 4, 4, '#c9d2dc', { hi: true }); P.ell(17, G - 6, 1.2, 1.2, '#5c3d22', F(3));
    const rows = lv >= 3 ? 3 : 2;
    for (let r = 0; r < rows; r++) for (let i = 0; i < rows - r; i++) {
      const y = G - 2 - r * 3.6, x = 40 + i * 4.2 + r * 2.1;
      P.cap(x - 1, y, x + 4, y, 1.8, '#8a5a32', { hi: true }); P.ell(x + 4, y, 1.8, 1.8, '#e8c890', { hi: true }); P.px(x + 4, y, '#a07850', 2);
    }
    if (lv >= 2) { P.ell(54, G - 1, 2.6, 1.4, '#8a5a32', { hi: true }); P.cap(54, G - 2, 56, G - 7, .6, '#5c3d22'); P.poly([[55.5, G - 7.5], [58.5, G - 8], [58, G - 5.5]], '#c9d2dc', { hi: true }); }
    if (lv >= 4) smoke(P, 26, G - 24, 3);
  },
  /* rock pile with a yellow crane (lv 2), a cart (lv 3) and cut blocks (lv 4) */
  quarry(P, lv) {
    ground(P, '#7a6a5a');
    P.ell(22, G - 5, 15, 10, '#8a8a90', { hi: true, clip: (x, y) => y < G });
    P.ell(13, G - 2, 6, 4, '#9a9aa2', { hi: true }); P.ell(33, G - 2, 6.5, 4, '#7a7a82', { hi: true });
    [[18, G - 11], [26, G - 8], [21, G - 5]].forEach(([x, y]) => P.line(x, y, x + 3, y + 1, '#5a5a62', 2, NL));
    if (lv >= 2) {
      P.cap(46, G - 1, 46, G - 28, 1, '#ffb020', { hi: true }); P.cap(46, G - 27, 30, G - 25, .8, '#ffb020', { hi: true });
      P.line(32, G - 25, 32, G - 15, '#3a3a44', 2); P.rect(31, G - 15, 3, 2, '#5a5a62', F(2));
    }
    if (lv >= 3) { P.rect(48, G - 7, 10, 5, '#5c3d22', F(2)); P.ell(50, G - 1.5, 1.5, 1.5, '#2a2a33', F(3)); P.ell(56, G - 1.5, 1.5, 1.5, '#2a2a33', F(3)); P.ell(53, G - 8, 3.5, 2, '#8a8a90', { hi: true }); }
    if (lv >= 4) { box(P, 4, G - 5, 5, 4, 2, '#b8b8c0'); box(P, 6, G - 9, 5, 4, 2, '#b8b8c0'); }
  },
  /* striped market stalls; a third stall at lv 3, lantern string at lv 4 */
  market(P, lv) {
    ground(P, '#7a7a70');
    const n = lv >= 3 ? 3 : 2, cols = [['#c03030', '#f4f0e6'], ['#2a6ad6', '#f4f0e6'], ['#2f9e6a', '#ffe9a8']];
    for (let i = 0; i < n; i++) {
      const x = n === 3 ? 4 + i * 19 : 10 + i * 24, [c1, c2] = cols[i];
      P.line(x + 1, G - 14, x + 1, G - 1, '#5c3d22', 2); P.line(x + 13, G - 14, x + 13, G - 1, '#5c3d22', 2);
      P.rect(x, G - 6, 14, 5, '#8a5a32', F(2));
      for (let s = 0; s < 4; s++) P.poly([[x - 1 + s * 4, G - 15], [x + 3 + s * 4, G - 15], [x + 3.5 + s * 4, G - 11], [x - .5 + s * 4, G - 11]], s % 2 ? c2 : c1, F(1, { line: s === 0 }));
      [[x + 3, '#e8473a'], [x + 6, '#ffb020'], [x + 9, '#5fbf3a'], [x + 11, '#ffd34d']].forEach(([fx, fc]) => P.ell(fx, G - 7, 1.2, 1.1, fc, { hi: true }));
    }
    if (lv >= 4) { P.path([[2, G - 20], [20, G - 17], [40, G - 18], [62, G - 21]], .3, '#3a3a44', NL); [8, 16, 26, 34, 46, 54].forEach((x, i) => P.ell(x, G - 17.5 - (i % 2), 1.2, 1.4, i % 2 ? '#ffb020' : '#ff5a5a', { hi: true, tag: 'g' })); }
  },
  /* hill with a timbered entrance, mana crystals that multiply, rails and a cart */
  mine(P, lv) {
    ground(P, '#6a5a4a');
    P.ell(30, G, 24, 18, '#6a5a4a', { hi: true, clip: (x, y) => y < G });
    P.ell(30, G - 1, 6, 9, '#141018', F(4, { clip: (x, y) => y < G - 1 }));
    P.cap(24, G - 1, 24, G - 10, 1, '#8a5a32', { hi: true }); P.cap(36, G - 1, 36, G - 10, 1, '#8a5a32', { hi: true }); P.cap(23, G - 10, 37, G - 10, 1, '#5c3d22', { hi: true });
    const spots = [[15, G - 6], [44, G - 8], [20, G - 14], [40, G - 15], [30, G - 17]].slice(0, 1 + lv);
    spots.forEach(([x, y], i) => P.poly([[x, y - 4], [x + 2, y], [x, y + 1.5], [x - 2, y]], i % 2 ? '#a37bff' : '#7fe7ff', { hi: true, tag: 'g' }));
    P.line(26, G + 1, 18, G + 4, '#5a5a62', 2, NL); P.line(34, G + 1, 42, G + 4, '#5a5a62', 2, NL);
    if (lv >= 3) { P.rect(42, G - 4, 9, 4, '#5a5a62', F(2)); P.ell(46.5, G - 4.5, 3.5, 1.8, '#7fe7ff', { hi: true, tag: 'g' }); }
  },
  /* corner pharmacy: shop window, green cross sign over the door; second floor at lv 3, neon sign at lv 4 */
  apoth(P, lv) {
    ground(P, '#6a7a6a');
    const h = lv >= 3 ? 24 : 17, top = G - h;
    box(P, 14, top, 26, h, 7, '#e2e6ea', '#b9c2cc');
    P.rect(16, G - 9, 11, 6, '#bfe9ff', F(1)); [[18, '#e8473a'], [21, '#7dff8a'], [24, '#7fb2ff']].forEach(([x, c]) => P.rect(x, G - 6, 1.6, 2.5, c, F(1, NL)));
    door(P, 30, G - 9, 6, 9, '#2f9e6a');
    if (lv >= 2) P.poly([[15, G - 10.5], [28, G - 10.5], [29, G - 8.5], [14, G - 8.5]], '#2f9e6a', F(1));
    if (lv >= 3) [17, 24, 31].forEach(x => win(P, x, top + 3, 4, 4, lv >= 4));
    const neon = lv >= 4 ? { tag: 'g' } : {};
    P.rect(29, G - 15, 8, 5, '#2f9e6a', F(2));
    P.rect(32.2, G - 14.4, 1.6, 3.8, lv >= 4 ? '#b8ffd8' : '#e9f5ee', F(1, { line: false, ...neon })); P.rect(31.1, G - 13.3, 3.8, 1.6, lv >= 4 ? '#b8ffd8' : '#e9f5ee', F(1, { line: false, ...neon }));
  },
  /* low dojo with upturned eaves; banner at lv 2, second roof tier at lv 3, lanterns at lv 4 */
  dojo(P, lv) {
    ground(P, '#8a7a5a');
    box(P, 10, G - 11, 38, 11, 6, '#d8c8a0');
    [14, 22, 36, 44].forEach(x => P.rect(x, G - 11, 1.6, 11, '#5c3d22', F(3)));
    P.rect(26, G - 9, 8, 9, '#3a2a1e', F(3));
    const roof = (y, x0, x1, hgt) => P.poly([[x0 - 4, y], [x1 + 4, y], [x1 + 6, y - 3], [x1 - 2, y - hgt], [x0 + 2, y - hgt], [x0 - 6, y - 3]], '#2a3038', { hi: true, curve: .6 });
    if (lv >= 3) roof(G - 19, 18, 42, 6);
    roof(G - 11, 10, 50, 7);
    P.rect(27, G - 15, 6, 2.5, '#5c3d22', F(2)); P.px(30, G - 14, '#ffd34d', 0);
    if (lv >= 2) { P.line(6, G - 18, 6, G - 1, '#5c3d22', 2); P.rect(7, G - 18, 4, 11, '#c03030', F(2)); }
    if (lv >= 4) [[18, G - 9], [42, G - 9]].forEach(([x, y]) => P.ell(x, y, 1.6, 2, '#ff5a3a', { hi: true, tag: 'g' }));
  },
  /* stone smithy with a brick chimney and glowing furnace; smoke, weapon rack and runes come with levels */
  forge(P, lv) {
    ground(P, '#5a5a62');
    box(P, 8, G - 15, 26, 15, 7, '#7a7a82');
    gable(P, 8, G - 15, 26, 6, 7, '#3a3a44');
    P.rect(28, G - 30, 5, 13, '#8a4a3a', F(2));
    P.ell(17, G - 3, 5, 5, '#2a1a12', F(4, { clip: (x, y) => y < G })); P.ell(17, G - 2, 3.5, 3.4, lv >= 4 ? '#7fe7ff' : '#ff8a3d', { hi: true, tag: 'g', clip: (x, y) => y < G });
    P.poly([[42, G - 6], [54, G - 6], [52, G - 4], [50, G - 4], [50, G - 1], [46, G - 1], [46, G - 4], [43, G - 4]], '#3a3a44', { hi: true });
    if (lv >= 2) smoke(P, 31, G - 34, 3);
    if (lv >= 3) [56, 59].forEach(x => P.cap(x, G - 1, x, G - 12, .55, '#c9d2dc', { hi: true }));
    if (lv >= 4) P.px(48, G - 5, '#7fe7ff', 0, { tag: 'g' });
  },
  /* stepped platform with a floating mana crystal; pillars, a rune ring and orbiting shards with levels */
  altar(P, lv) {
    ground(P, '#3a3a5a');
    P.rect(12, G - 4, 40, 4, '#6a6a7a', F(2)); P.rect(17, G - 8, 30, 4, '#7a7a8a', F(1));
    if (lv >= 2) [14, 46].forEach(x => { P.rect(x, G - 24, 4, 16, '#9a9aaa', { hi: true }); P.rect(x - 1, G - 26, 6, 2.5, '#b8b8c8', F(1)); });
    if (lv >= 3) P.ell(32, G - 21, 11, 3, '#c9a6ff', { shade: 'flat', tone: 1, line: false, tag: 'g', clip: (x, y) => ((x - 32) / 9) ** 2 + ((y - G + 21) / 1.6) ** 2 > 1 });
    P.poly([[32, G - 31], [36.5, G - 22], [32, G - 12], [27.5, G - 22]], '#a37bff', { hi: true, tag: 'g' });
    if (lv >= 4) [[22, G - 27], [42, G - 29], [24, G - 15], [40, G - 14]].forEach(([x, y]) => P.poly([[x, y - 2], [x + 1.2, y], [x, y + 2], [x - 1.2, y]], '#7fe7ff', { hi: true, tag: 'g' }));
  },
};

export function building(id, lv = 1) {
  const P = painter(BW, BH);
  (DRAW[id] || DRAW.hall)(P, Math.max(1, Math.min(5, lv)));
  return P;
}

/* 16×16 resource icons */
export const RW = 16;
const ICON = {
  food(P) { P.ell(8, 9, 5, 5, '#e8473a', { hi: true }); P.cap(8, 4, 9, 2, .5, '#5c3d22'); P.ell(10.5, 3.5, 2, 1.2, '#5fbf3a', { hi: true }); },
  wood(P) { P.cap(3, 9, 11, 9, 3.2, '#8a5a32', { hi: true }); P.ell(12, 9, 3.2, 3.2, '#e8c890', { hi: true }); P.ell(12, 9, 1.2, 1.2, '#a07850', F(2, NL)); },
  stone(P) { P.ell(8, 10, 6, 4.5, '#8a8a90', { hi: true }); P.ell(6, 8, 3.5, 3, '#9a9aa2', { hi: true }); },
  iron(P) { P.poly([[3, 12], [13, 12], [11.5, 6], [4.5, 6]], '#9aa4b0', { hi: true }); P.poly([[4.5, 6], [11.5, 6], [10.5, 4.5], [5.5, 4.5]], '#c9d2dc', F(0)); },
  shards(P) { [[6, 9, '#a37bff'], [10, 7, '#c9a6ff'], [9, 12, '#7fe7ff']].forEach(([x, y, c]) => P.poly([[x, y - 4], [x + 2, y], [x, y + 2.5], [x - 2, y]], c, { hi: true, tag: 'g' })); },
  gold(P) { P.ell(8, 8, 5.5, 5.5, '#ffd34d', { hi: true }); P.ell(8, 8, 3.4, 3.4, mix('#ffd34d', '#b08a2a', .4), F(2, NL)); P.px(8, 8, '#fff2b0', 0); },
};
export function resIcon(id) {
  const P = painter(RW, RW);
  (ICON[id] || ICON.gold)(P);
  return P;
}
