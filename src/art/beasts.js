import { painter } from './raster.js';
import { mix } from '../game/util.js';
import { GW, GH } from './chibi.js';

/* Dragons for the sleeping-dragon valley, on the shared 72×72 grid, facing right, feet on y≈66.
   Palette: a scales · d dark scales, legs, wing bones · n belly · w wing membrane · e eyes · k horns/claws
   · g ember or molten glow · y gold (horn crown) · v venom drip.
   type: whelp (small, glowing belly) · wyvern (two legs, wing-arms, barbed tail) · ancient (boss: horn crown, molten cracks) */
const LASH = '#1a1018';
const inside = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

function eye(P, x, y, col, big = false) {
  P.ell(x, y, big ? 1.8 : 1.3, big ? 2 : 1.3, col, { hi: true, tag: 'e', line: false });
  P.px(x + .4, y + .3, LASH, 2, { tag: 'e' });
  P.line(x - 2, y - 2, x + 2, y - 1.5, LASH, 2);
}
/* membrane between the leading bone and finger tips, bones drawn on top */
function wing(P, pts, mem, bone, far) {
  P.poly(pts, far ? mix(mem, '#000000', .3) : mem, { hi: !far, curve: .7 });
  if (far) return;
  const [root, elbow, tip, ...rest] = pts;
  P.path([root, elbow, tip], .8, bone, { r2: .4 });
  rest.filter((_, i) => i % 2 === 1).forEach(f => P.line(elbow[0], elbow[1], f[0], f[1], bone, 3, { line: false }));
}

export function dragon(s) {
  const P = painter(GW, GH), p = s.pal, t = s.type || 'whelp';
  const a = p.a, d = p.d, n = p.n || p.a, w = p.w || p.a, k = p.k || d, g = p.g || '#ff8a3d';
  if (t === 'whelp') {
    P.path([[30, 58], [22, 60], [16, 57], [14, 52]], 2.2, a, { r2: .8, hi: true });
    P.poly([[14, 52], [11, 49], [15, 49.5], [16, 53]], d, { hi: true });
    wing(P, [[35, 49], [29, 38], [25, 35], [25, 42], [22, 44], [28, 48]], w, d, true);
    P.cap(32, 58, 31, 65, 2, d); P.cap(42, 58, 43, 65, 2, d);
    P.ell(37, 55, 10, 8, a, { hi: true });
    P.ell(40, 58, 6, 4.5, n, { line: false, tag: 'g', clip: inside(37, 55, 10, 8) });
    P.cap(35, 60, 34.5, 65.5, 2.2, a, { hi: true }); P.cap(44, 60, 44.5, 65.5, 2.2, a, { hi: true });
    [[33, 66], [36, 66], [43, 66], [46, 66]].forEach(([x, y]) => P.px(x, y, k, 2));
    wing(P, [[37, 49], [32, 36], [28, 32], [28, 40], [24, 42], [31, 47]], w, d);
    P.cap(44, 52, 49, 46, 3, a, { hi: true });
    P.ell(52, 43, 6.5, 5.5, a, { hi: true });
    P.ell(57.5, 45.2, 3.8, 2.8, a, { hi: true });
    P.path([[49, 39], [46, 35], [44, 34]], .9, k, { r2: .4 }); P.path([[52, 38.5], [51, 34], [49, 32]], .9, k, { r2: .4 });
    eye(P, 53, 42, p.e || '#ffe14d', true);
    P.line(55, 47, 60, 46.5, LASH, 2); P.px(56, 47.5, '#ffffff', 1); P.px(60.5, 44.5, g, 0, { tag: 'g' });
    return P;
  }
  if (t === 'wyvern') {
    P.path([[26, 56], [16, 58], [9, 55], [6, 49]], 2.6, a, { r2: .8, hi: true });
    P.poly([[6, 49], [2, 44.5], [8, 46], [5, 48], [10, 50.5]], d, { hi: true });
    wing(P, [[32, 44], [24, 24], [16, 15], [18, 28], [10, 30], [20, 38], [14, 42], [26, 46]], w, d, true);
    P.ell(30, 58, 4, 5, a, { hi: true }); P.cap(30, 61, 28, 65.5, 1.6, d);
    P.ell(34, 52, 12, 9, a, { hi: true });
    P.ell(38, 55, 7, 5, n, { line: false, clip: inside(34, 52, 12, 9) });
    [[24, 44], [29, 43], [34, 43]].forEach(([x, y]) => P.poly([[x - 1.5, y + 1], [x, y - 2.5], [x + 1.5, y + 1]], d, { hi: true }));
    P.ell(39, 59, 4, 5, a, { hi: true }); P.cap(39, 62, 40, 65.5, 1.6, d);
    [[27, 66], [29, 66], [39, 66], [42, 66]].forEach(([x, y]) => P.px(x, y, k, 2));
    wing(P, [[36, 46], [30, 22], [24, 11], [26, 26], [17, 26], [27, 36], [19, 40], [32, 48]], w, d);
    P.path([[42, 47], [47, 40], [50, 33]], 3, a, { r2: 2.4, hi: true });
    P.ell(53, 30, 5.5, 4.5, a, { hi: true });
    P.poly([[55, 27.5], [63.5, 29.5], [62.5, 33], [55, 34]], a, { hi: true });
    P.path([[51, 27], [47, 23], [44, 22]], .9, d, { r2: .4 });
    eye(P, 55, 29, p.e || '#e4ff4d');
    P.line(56, 32.5, 62, 32, LASH, 2); [[58, 33.5], [61, 33]].forEach(([x, y]) => P.px(x, y, '#f0ead8', 1));
    const v = p.v || '#9aff3a';
    P.line(60, 34, 60, 36.5, v, 1, { tag: 'g' }); P.px(60, 38, v, 0, { tag: 'g' }); P.px(57.5, 35.5, v, 1, { tag: 'g' });
    return P;
  }
  /* ancient: fills the grid; the arena draws bosses a size up */
  const y = p.y || '#ffd34d';
  P.path([[22, 58], [12, 60], [6, 55], [5, 47], [9, 42]], 3.8, a, { r2: 1.2, hi: true });
  P.poly([[9, 42], [7, 37], [12, 40], [14, 37], [12, 44]], y, { hi: true });
  wing(P, [[30, 40], [22, 14], [12, 3], [12, 18], [4, 20], [14, 30], [6, 36], [24, 44]], w, d, true);
  P.cap(26, 58, 25, 66, 3.6, d); P.cap(32, 59, 32, 66, 3.4, d);
  P.ell(34, 50, 17, 12, a, { hi: true });
  P.ell(40, 55, 10, 6, n, { line: false, clip: inside(34, 50, 17, 12) });
  [53, 56].forEach(yy => P.line(31, yy, 49, yy, mix(n, '#000000', .35), 2, { line: false }));
  [[[22, 46], [26, 49], [24, 53], [28, 56]], [[32, 42], [35, 46], [33, 50]], [[44, 46], [46, 50]]].forEach(c => P.path(c, .5, g, { tag: 'g', line: false }));
  [[20, 40], [26, 38], [32, 38], [38, 39]].forEach(([x, yy]) => P.poly([[x - 2, yy + 1.5], [x, yy - 3], [x + 2, yy + 1.5]], y, { hi: true }));
  P.cap(40, 57, 39, 66, 3.6, a, { hi: true }); P.cap(48, 56, 49, 66, 3.4, a, { hi: true });
  [[36, 66.5], [39, 66.5], [46, 66.5], [50, 66.5]].forEach(([x, yy]) => P.px(x, yy, y, 1));
  wing(P, [[34, 42], [28, 12], [18, 0], [18, 14], [8, 16], [18, 28], [10, 34], [30, 44]], w, d);
  P.path([[44, 44], [50, 36], [54, 28]], 5, a, { r2: 3.6, hi: true });
  [[47, 41], [50, 36.5], [53, 32]].forEach(([x, yy]) => P.ell(x + 2, yy + 1, 2, 1.3, n, { hi: true, line: false }));
  P.ell(57, 24, 7, 6, a, { hi: true });
  P.poly([[58, 21], [69, 23.5], [68.5, 29], [58, 30]], a, { hi: true });
  P.line(60, 28, 68, 27.5, LASH, 2); [[62, 29], [66, 28.5]].forEach(([x, yy]) => P.px(x, yy, '#f0ead8', 1));
  P.px(68, 24.5, g, 0, { tag: 'g' });
  [[[54, 19], [50, 12], [47, 9]], [[57, 18], [56, 11], [54, 6]], [[60, 19], [62, 13], [61, 8]], [[52, 22], [47, 19], [44, 19]]].forEach(h => P.path(h, 1.3, y, { r2: .4, hi: true }));
  eye(P, 60, 23, p.e || '#ffe14d', true);
  return P;
}
