import { painter } from './raster.js';
import { mix } from '../game/util.js';

/* Chibi sprites in the spirit of classic isometric MMO sprites: ~2.3 heads tall, big anime eyes,
   soft multi-tone shading and dark outlines. Every sprite faces right on a 72×72 grid, feet on y≈67.
   All shapes are original. */
export const GW = 72, GH = 72;
const CX = 36;

const LASH = '#1d1220';
const tagE = { tag: 'e', line: false };

/* ---------------- humanoid ---------------- */
export function humanoid(s) {
  const P = painter(GW, GH);
  const g = new Set(s.gear || []), pal = s.pal, sp = s.species || 'human';
  const HX = CX + 1, HY = 26;
  const H = { x: CX + 10, y: 47.5 }, B = { x: CX - 9, y: 48 };
  const skin = s.skin, hair = s.hair;
  const outfit = s.outfit || 'tunic';
  const metal = pal.w || '#c9d2dc', cloth = pal.c, dark = pal.d || cloth, acc = pal.a || '#e9eef5';
  const sleeve = outfit === 'bare' || outfit === 'rags' ? skin : outfit === 'bones' ? skin : outfit === 'armor' ? metal : cloth;
  const pants = outfit === 'bones' ? skin : pal.p || '#3b3b4f', boots = outfit === 'armor' ? metal : outfit === 'bones' ? skin : pal.b || '#4a2f1f';
  const aff = s.aff || '#ffffff';
  const closedHelm = sp === 'knight';
  const bald = sp === 'skel' || sp === 'insect' || closedHelm || s.hairStyle === 'none';

  /* --- back layer --- */
  if (g.has('scarf')) P.path([[CX - 4, 38], [CX - 11, 36.5], [CX - 17, 39], [CX - 23, 35.5]], 2.2, aff, { r2: 1.1, hi: true });
  if (g.has('cape')) {
    P.poly([[CX - 6, 36.5], [CX + 6, 36.5], [CX + 9, 47], [CX + 8, 60], [CX + 4, 63.5], [CX - 1, 61], [CX - 6, 64.5], [CX - 11, 62], [CX - 16, 58], [CX - 12, 46]], pal.r || '#7a1020', { curve: .8, vcurve: .6 });
  }
  if (g.has('quiver')) { P.rect(CX - 11, 30, 5, 13, pal.k || '#6b4a2b', { curve: .9 }); [[CX - 10, 27], [CX - 8, 26], [CX - 6.5, 27.5]].forEach(([x, y]) => P.cap(x, y + 4, x, y, .9, acc, { hi: true })); }
  if (g.has('hood')) P.poly([[HX - 14, HY - 1], [HX - 15, HY + 12], [HX - 7, HY + 15], [HX + 6, HY + 14], [HX + 12, HY + 10], [HX + 12, HY]], mix(pal.o || cloth, '#000000', .2), { curve: .7 });
  if (!bald && !g.has('hood')) hairBack(P, s, HX, HY);
  if (outfit === 'coat') P.poly([[CX - 7, 45], [CX + 8, 45], [CX + 10, 60], [CX + 5, 57.5], [CX + 1, 61.5], [CX - 4, 57.5], [CX - 10, 61]], cloth, { curve: .9 });
  if (g.has('daggers')) P.cap(B.x - 1, B.y - 1, B.x - 6, B.y - 6, 1.1, metal, { r2: .5, hi: true });
  if (g.has('pauldron')) P.ell(CX - 6.5, 38.5, 4.6, 3.8, aff, { hi: true });

  /* --- back arm --- */
  arm(P, CX - 5.5, 39.5, B.x, B.y, sleeve, outfit === 'armor' ? metal : skin, outfit === 'robe');

  /* --- legs + boots --- */
  if (outfit !== 'robe') {
    P.cap(CX - 3, 49.5, CX - 3.5, 61, outfit === 'bones' ? 1.5 : 2.6, outfit === 'armor' ? metal : pants, { hi: outfit === 'armor' });
    P.cap(CX + 3, 49.5, CX + 3.5, 61, outfit === 'bones' ? 1.5 : 2.6, outfit === 'armor' ? metal : pants, { hi: outfit === 'armor' });
  }
  P.ell(CX - 2.5, 63.8, 3.6, 2.8, boots, { hi: true, bias: .1 });
  P.ell(CX + 4.6, 64.2, 3.9, 2.8, boots, { hi: true, bias: .1 });

  /* --- torso --- */
  torso(P, s, outfit, { cloth, dark, acc, metal, skin, pants });
  if (g.has('scarf')) P.poly([[CX - 6, 35.5], [CX + 8, 35.5], [CX + 8.5, 39.5], [CX - 6.5, 39.5]], aff, { hi: true });
  if (g.has('cape')) { P.poly([[CX - 7, 35.5], [CX + 8, 35.5], [CX + 9, 39], [CX - 8, 39]], pal.r || '#7a1020'); P.ell(CX + 4.5, 38.6, 1.6, 1.6, pal.y || '#ffd34d', { hi: true }); }

  /* --- head --- */
  if (sp === 'goblin') P.poly([[HX + 9, HY - 1], [HX + 17, HY - 6], [HX + 11, HY + 4]], skin);
  P.ell(HX, HY, 12.5, 11.5, skin, { bias: .22, maxT: 3, hi: sp === 'skel' });
  if (sp === 'orc') P.ell(HX + 1, HY + 5, 11.5, 7, skin, { bias: .2, maxT: 3 });
  if (!closedHelm) face(P, s, sp, HX, HY);
  if (sp === 'goblin') P.poly([[HX - 8, HY + 1], [HX - 20, HY - 5], [HX - 10, HY + 6]], skin, { bias: .1 });
  else if (sp === 'elf') P.poly([[HX - 8, HY + 1], [HX - 18, HY - 6], [HX - 9, HY + 5]], skin, { bias: .1 });
  else if (!bald && s.hairStyle !== 'long' && s.hairStyle !== 'bangs') P.ell(HX - 8.6, HY + 3.4, 2.1, 3, skin, { maxT: 3 });

  if (!bald && !g.has('hood')) hairFront(P, s, HX, HY, g);
  if (sp === 'orc') [[HX - 8, HY - 9], [HX - 4, HY - 12], [HX, HY - 13], [HX + 4, HY - 12]].forEach(([x, y]) => P.poly([[x - 2, y + 4], [x, y - 3], [x + 2, y + 4]], hair, { hi: true }));
  if (sp === 'insect') { P.path([[HX - 3, HY - 10], [HX - 7, HY - 18], [HX - 12, HY - 20]], .8, pal.k || '#111111'); P.path([[HX + 3, HY - 10], [HX + 6, HY - 19], [HX + 11, HY - 21]], .8, pal.k || '#111111'); P.ell(HX - 12, HY - 20, 1.6, 1.6, acc, { hi: true }); P.ell(HX + 11, HY - 21, 1.6, 1.6, acc, { hi: true }); }

  /* --- headgear --- */
  if (g.has('hood')) hood(P, pal.o || cloth, HX, HY, s, g);
  if (g.has('helm') || closedHelm) helm(P, metal, pal, HX, HY, closedHelm);
  if (g.has('mask')) P.ell(HX + 1.5, HY + 8.5, 10.5, 5, pal.a || '#8b1e2e', { clip: (x, y) => y > HY + 5.6 && ((x - HX) / 12.6) ** 2 + ((y - HY) / 11.6) ** 2 <= 1 });
  if (g.has('hat')) witchHat(P, pal.o || cloth, pal.a || '#ffcc55', HX, HY);
  if (g.has('horns')) { const n = pal.n || '#e8dcc0'; P.path([[HX - 6, HY - 8], [HX - 10, HY - 13], [HX - 14, HY - 15.5], [HX - 17.5, HY - 15]], 2.3, n, { r2: .6, hi: true }); P.path([[HX + 5, HY - 9], [HX + 8, HY - 14.5], [HX + 12, HY - 17.5], [HX + 15.5, HY - 17]], 2.5, n, { r2: .6, hi: true }); }
  if (g.has('crownh')) { const y0 = g.has('helm') || closedHelm ? HY - 13 : HY - 10; P.poly([[HX - 6, y0], [HX + 5, y0 - 1], [HX + 5, y0 - 6], [HX + 3, y0 - 3.5], [HX, y0 - 7.5], [HX - 2, y0 - 3.5], [HX - 5.5, y0 - 6]], pal.y || '#ffd34d', { hi: true }); P.px(HX, y0 - 2.5, pal.e && sp !== 'human' ? pal.e : '#ff3355', 1, { tag: 'g' }); }
  if (g.has('halo')) P.ell(HX - 1, HY - 17, 9, 2.6, pal.y || '#ffd34d', { shade: 'flat', tone: 1, line: false, tag: 'g', clip: (x, y) => ((x - HX + 1) / 6.6) ** 2 + ((y - HY + 17) / 1.2) ** 2 > 1 });
  if (g.has('eyemark')) { [[HX - 5, HY + 7], [HX - 4, HY + 8], [HX - 3, HY + 7], [HX - 4, HY + 6]].forEach(([x, y]) => P.px(x, y, aff, 1, { tag: 'g' })); }

  /* --- front arm + weapons --- */
  const handCol = outfit === 'armor' ? metal : skin;
  const weaponFirst = ['sword', 'greatsword', 'staff', 'crossstaff', 'scythe', 'bow', 'club'].find(w => g.has(w));
  if (weaponFirst) weapon(P, weaponFirst, H, pal, metal);
  arm(P, CX + 6.5, 39.5, H.x, H.y, sleeve, handCol, outfit === 'robe');
  if (g.has('daggers')) { P.cap(H.x + 1.5, H.y - 1.5, H.x + 7, H.y - 6, 1.1, metal, { r2: .5, hi: true }); P.px(H.x + 1, H.y - 1, pal.a || '#8b1e2e', 2); }
  if (g.has('shield')) shield(P, H, metal, pal);
  if (g.has('pauldron')) P.ell(CX + 7.5, 39, 4.8, 3.9, aff, { hi: true });
  if (g.has('runes')) [[CX - 18, 30], [CX + 19, 23], [CX - 15, 56]].forEach(([x, y], i) => { P.ell(x, y, 2.3 - i * .3, 2.3 - i * .3, aff, { hi: true, line: false, tag: 'g' }); P.px(x + 3, y - 3, aff, 0, { tag: 'g' }); });
  return P;
}

function arm(P, sx, sy, hx, hy, sleeve, hand, wide) {
  P.cap(sx, sy, hx - (hx > sx ? .5 : -.5), hy - 2, wide ? 2.8 : 2.4, sleeve, { r2: wide ? 3.6 : 2.2 });
  P.ell(hx, hy, 2.2, 2.2, hand, { bias: .15, maxT: 3 });
}

function torso(P, s, outfit, { cloth, dark, acc, metal, skin, pants }) {
  const pal = s.pal;
  const T = [[CX - 6, 36.5], [CX + 7, 36.5], [CX + 8, 41.5], [CX + 7.5, 48], [CX + 8, 51], [CX - 7, 51], [CX - 6.5, 48], [CX - 7, 41.5]];
  if (outfit === 'robe') {
    P.poly([[CX - 6, 36.5], [CX + 7, 36.5], [CX + 8.5, 43], [CX + 11.5, 63.5], [CX + 7, 65.6], [CX - 3, 65.6], [CX - 9.5, 63.5], [CX - 7, 43]], cloth, { curve: .9 });
    P.poly([[CX - 9.5, 62], [CX + 11.2, 62], [CX + 11.5, 63.5], [CX + 7, 65.6], [CX - 3, 65.6], [CX - 9.6, 63.5]], acc, { line: false, hi: true });
    P.poly([[CX + 1.5, 39], [CX + 3.5, 39], [CX + 4.6, 62], [CX + 2.4, 62]], acc, { line: false, hi: true });
    P.poly([[CX - 6.5, 46], [CX + 8.5, 46], [CX + 8.8, 48], [CX - 6.8, 48]], dark, { line: false });
    P.poly([[CX - 3, 35.5], [CX + 5, 35.5], [CX + 6, 38.5], [CX + 1.5, 41], [CX - 3.5, 38.5]], acc, { hi: true });
    return;
  }
  if (outfit === 'bones') {
    P.ell(CX + .5, 42.5, 6.5, 5.6, skin, { hi: true });
    for (let y = 40; y <= 45; y += 2) P.line(CX - 4, y, CX + 5, y, '#2a2226', 2, { recv: false });
    P.line(CX + .5, 38, CX + .5, 49, skin, 3);
    P.ell(CX + .5, 50, 5.5, 2.4, skin, { hi: true });
    return;
  }
  if (outfit === 'armor') {
    P.poly(T, metal, { hi: true });
    P.poly([[CX - 2, 38.5], [CX + 5, 38.5], [CX + 5.5, 45], [CX + 1.5, 47.5], [CX - 2.5, 45]], pal.a || acc, { line: false, hi: true });
    P.poly([[CX - 7, 47], [CX + 8, 47], [CX + 8.5, 49.5], [CX - 7.5, 49.5]], dark);
    P.poly([[CX - 8, 49.5], [CX + 9, 49.5], [CX + 10, 54], [CX + 4, 55], [CX + 1, 53], [CX - 3, 55], [CX - 9, 54]], metal, { hi: true });
    P.ell(CX - 6.5, 39, 4.3, 3.6, metal, { hi: true });
    return;
  }
  if (outfit === 'bare' || outfit === 'rags') {
    P.poly(T, skin, { bias: .1 });
    P.line(CX + 1.5, 41, CX + 1.5, 46, skin, 3, { recv: false });
    if (outfit === 'rags') { P.poly([[CX - 6, 36.5], [CX - 1, 36.5], [CX - 1.5, 49], [CX - 6.8, 49]], cloth); P.poly([[CX + 4, 36.5], [CX + 7, 36.5], [CX + 7.8, 49], [CX + 4.5, 49]], cloth); }
    P.poly([[CX - 7, 47.5], [CX + 8, 47.5], [CX + 8.5, 50], [CX - 7.5, 50]], pal.k || '#5c3d22');
    P.poly([[CX - 6, 50], [CX + 7, 50], [CX + 6, 56], [CX + 1.5, 54.5], [CX - 4, 56]], outfit === 'rags' ? dark : cloth);
    return;
  }
  /* tunic / leather / coat */
  P.poly(T, cloth);
  if (outfit === 'coat') {
    P.poly([[CX + 1, 37], [CX + 5, 37], [CX + 4.5, 51], [CX + 1.5, 51]], dark, { line: false });
    P.poly([[CX - 7, 34], [CX + 8, 34], [CX + 9.5, 39.5], [CX + 4, 38], [CX - 2, 38.5], [CX - 8, 39.5]], cloth, { hi: true });
    P.line(CX - 8, 39.5, CX + 9, 39.5, acc, 2, { line: false });
  } else {
    P.poly([[CX - 7.5, 48], [CX + 8.5, 48], [CX + 10, 54], [CX + 4, 54.5], [CX + 1, 53], [CX - 3, 54.5], [CX - 9, 54]], cloth);
    P.poly([[CX - 1, 36.5], [CX + 4.5, 36.5], [CX + 2, 40]], acc, { line: false, hi: true });
    if (outfit === 'leather') P.cap(CX - 5, 37.5, CX + 7, 48, .9, pal.k || '#6b4a2b', { line: false });
    P.ell(CX + 7, 39.3, 3.2, 2.6, acc, { hi: true });
  }
  P.poly([[CX - 7, 46.8], [CX + 8, 46.8], [CX + 8.3, 49], [CX - 7.3, 49]], pal.k || '#5c3d22');
  P.rect(CX + 1, 46.6, 2.6, 2.6, pal.y || '#ffd34d', { hi: true, line: false });
}

function face(P, s, sp, HX, HY) {
  const eye = s.eye, er = P.R(eye);
  const skinR = P.R(s.skin);
  if (sp === 'skel') {
    P.ell(HX - 3.6, HY + 3, 2.4, 2.6, '#1a1418', { shade: 'flat', line: false });
    P.ell(HX + 4.6, HY + 3, 1.9, 2.5, '#1a1418', { shade: 'flat', line: false });
    P.px(HX - 3.6, HY + 3, eye, 1, { tag: 'e' }); P.px(HX + 4.6, HY + 3, eye, 1, { tag: 'e' });
    P.px(HX + 1, HY + 6, '#1a1418', 2); P.px(HX + 1, HY + 7, '#1a1418', 2);
    for (let x = HX - 3; x <= HX + 5; x++) P.px(x, HY + 9, (x % 2) ? '#1a1418' : s.skin, x % 2 ? 2 : 1);
    return;
  }
  if (sp === 'insect') {
    P.ell(HX - 3, HY + 2.5, 3.2, 3.6, eye, { hi: true, ...tagE });
    P.ell(HX + 5, HY + 2.5, 2.4, 3.4, eye, { hi: true, ...tagE });
    P.path([[HX + 1, HY + 8], [HX - 1, HY + 11], [HX + 1, HY + 12.5]], .8, s.pal.m || '#3a3a48', { line: false });
    P.path([[HX + 5, HY + 8], [HX + 7, HY + 11], [HX + 5, HY + 12.5]], .8, s.pal.m || '#3a3a48', { line: false });
    return;
  }
  const big = sp === 'goblin';
  /* near eye (4 wide) and far eye (3 wide), 5 rows tall */
  const eyeAt = (x0, w, flipFlick) => {
    const y0 = HY + (big ? 0 : 1);
    for (let i = 0; i < w; i++) P.px(x0 + i, y0, LASH, 2, tagE);
    P.px(flipFlick ? x0 + w : x0 - 1, y0 - (big ? 0 : 0), LASH, 2, tagE);
    P.px(x0, y0 + 1, er[0] | 0xffffff, 2, tagE); P.px(x0, y0 + 1, 0xffffff, 2, tagE);
    for (let i = 1; i < w; i++) P.px(x0 + i, y0 + 1, er[4], 2, tagE);
    for (let i = 0; i < w; i++) P.px(x0 + i, y0 + 2, i === 0 ? er[3] : i === w - 1 ? er[2] : er[4], 2, tagE);
    for (let i = 0; i < w; i++) P.px(x0 + i, y0 + 3, i === 0 || i === w - 1 ? er[2] : er[1], 2, tagE);
    for (let i = 1; i < w - 1 || (w === 3 && i < 2); i++) P.px(x0 + i, y0 + 4, er[0], 2, tagE);
    if (big) { for (let i = 0; i < w; i++) P.px(x0 + i, y0 + 4, er[2], 2, tagE); P.px(x0 + 1, y0 + 2, 0x101010, 2, tagE); }
    if (sp === 'demon') { P.px(x0 + 1, y0 + 2, 0x100808, 2, tagE); P.px(x0 + 1, y0 + 3, 0x100808, 2, tagE); }
  };
  eyeAt(HX - 5, 4, false);
  eyeAt(HX + 4, 3, true);
  if (sp === 'orc' || sp === 'demon' || s.angry) { P.line(HX - 6, HY - (sp === 'orc' ? 0 : 0), HX - 2, HY + .5, LASH, 2); P.line(HX + 3, HY + .5, HX + 6, HY - .5, LASH, 2); }
  /* blush, mouth */
  if (sp === 'human' || sp === 'elf') { P.px(HX - 5, HY + 6.5, mix(s.skin, '#ff6f86', .35), 2); P.px(HX - 4, HY + 6.5, mix(s.skin, '#ff6f86', .35), 2); P.px(HX + 5, HY + 6.5, mix(s.skin, '#ff6f86', .35), 2); }
  if (sp === 'goblin') { P.ell(HX + 5, HY + 5, 2.2, 1.6, s.skin, { maxT: 3 }); P.line(HX - 1, HY + 8, HX + 4, HY + 8.5, LASH, 2); P.px(HX + 3, HY + 9, '#f0ead8', 1); }
  else if (sp === 'orc') { P.line(HX - 1, HY + 8.5, HX + 5, HY + 8.5, LASH, 2); P.px(HX - 1, HY + 7.5, '#f0ead8', 1); P.px(HX - 1, HY + 6.5, '#f0ead8', 0); P.px(HX + 5, HY + 7.5, '#f0ead8', 1); P.px(HX + 5, HY + 6.5, '#f0ead8', 0); }
  else if (sp === 'demon') { P.line(HX, HY + 8, HX + 3, HY + 8, LASH, 2); P.px(HX, HY + 9, '#f0ead8', 1); P.px(HX + 3, HY + 9, '#f0ead8', 1); }
  else { P.px(HX + 1, HY + 8, skinR[4], 2); P.px(HX + 2, HY + 8, mix(s.skin, '#a83a40', .5), 2); }
}

function hairBack(P, s, HX, HY) {
  const h = s.hair, st = s.hairStyle || 'short';
  if (st === 'long') P.poly([[HX - 13, HY - 4], [HX - 14.5, HY + 8], [HX - 13.5, HY + 19], [HX - 11, HY + 26], [HX - 8, HY + 21], [HX - 5, HY + 25.5], [HX - 1, HY + 21], [HX + 3, HY + 24.5], [HX + 7, HY + 19], [HX + 11, HY + 22], [HX + 13, HY + 10], [HX + 12, HY - 6], [HX, HY - 12]], h, { curve: .85, hi: true });
  else if (st === 'bangs') P.poly([[HX - 13, HY - 4], [HX - 14, HY + 6], [HX - 13, HY + 14.5], [HX - 6, HY + 15.5], [HX + 4, HY + 15], [HX + 12, HY + 13.5], [HX + 13, HY], [HX, HY - 12]], h, { curve: .85, hi: true });
  else if (st === 'pony') { P.path([[HX - 11, HY - 6], [HX - 17, HY - 2], [HX - 19.5, HY + 6], [HX - 17.5, HY + 14], [HX - 20, HY + 21]], 4.4, h, { r2: 1.2, hi: true }); }
  P.ell(HX - 1.5, HY - 1.5, 13.6, 12.6, h, { hi: true });
}

function hairFront(P, s, HX, HY, g) {
  const h = s.hair, st = s.hairStyle || 'short';
  const under = g.has('hat') || g.has('helm');
  const capPart = P.part({ line: true });
  if (!under) {
    P.ell(HX - .5, HY - 2.5, 13.6, 11.2, h, { hi: true, part: capPart, clip: (x, y) => y < HY - 1.5 + Math.max(0, HX - 3 - x) * .95 });
    if (st === 'spiky') [[[HX - 10, HY - 5], [HX - 15, HY - 15], [HX - 5, HY - 9]], [[HX - 6.5, HY - 9], [HX - 6, HY - 20], [HX, HY - 11]], [[HX - 1, HY - 11], [HX + 5, HY - 20], [HX + 6, HY - 9]], [[HX + 4, HY - 9], [HX + 12.5, HY - 15], [HX + 10, HY - 4]], [[HX - 11, HY], [HX - 19, HY - 4], [HX - 12.5, HY - 6]]]
      .forEach(t => P.poly(t, h, { hi: true, part: capPart }));
  }
  /* fringe strands hanging over the forehead */
  const tips = st === 'bangs' ? [[HX - 8, 2], [HX - 4.5, 2.4], [HX - 1, 2], [HX + 2.5, 2.4], [HX + 6, 2], [HX + 9.5, 1.6]]
    : st === 'spiky' ? [[HX - 7, 1], [HX - 1.5, 2.8], [HX + 4.5, 2.2], [HX + 9.5, 0]]
      : [[HX - 7.5, -.5], [HX - 3.5, 1.8], [HX + .5, .6], [HX + 4.5, 2.2], [HX + 8.5, .2]];
  const top = under ? HY - 7 : HY - 6.5;
  const w = st === 'bangs' ? 2.1 : st === 'spiky' ? 3 : 2.6;
  tips.forEach(([x, dy]) => P.poly([[x - w, top], [x + w, top], [x + w * .55, HY + dy - 1.5], [x + .2, HY + dy], [x - w * .6, HY + dy - 2]], h, { hi: true, part: capPart }));
  /* side locks */
  const longLock = st === 'long' || st === 'bangs';
  P.poly([[HX + 8, HY - 6], [HX + 12.5, HY - 3], [HX + 12.8, HY + (longLock ? 11 : 6)], [HX + 11, HY + (longLock ? 14 : 8)], [HX + 9.4, HY + 2]], h, { hi: true, part: capPart });
  P.poly([[HX - 9, HY - 6], [HX - 13.4, HY - 2], [HX - 13.6, HY + (longLock ? 13 : 8)], [HX - 11.4, HY + (longLock ? 16 : 10)], [HX - 9.6, HY + 4]], h, { hi: true, part: capPart });
  /* anime shine */
  if (!under) { const hr = P.R(h); for (let x = HX - 8; x <= HX - 2; x++) P.px(x, HY - 8 - Math.round(Math.sin((x - HX + 8) / 6 * Math.PI) * 1.5), hr[0], 2, { line: false }); }
  if (st === 'pony') P.ell(HX - 11.5, HY - 5.5, 2, 2, '#e8475f', { hi: true });
}

function hood(P, col, HX, HY, s, g) {
  P.ell(HX - 1, HY - 2, 14.6, 13.6, col, { clip: (x, y) => ((x - HX - 2.5) / 9.6) ** 2 + ((y - HY - 3.5) / 9.4) ** 2 > 1, curve: .9 });
  P.poly([[HX - 12, HY - 6], [HX - 20, HY - 10], [HX - 12, HY - 13]], col);
  /* bangs peeking out of the hood */
  if (s.hairStyle !== 'none' && s.species !== 'skel') {
    const p = P.part({ line: true });
    [[HX - 1, 1], [HX + 3, 2], [HX + 7, .6]].forEach(([x, dy]) => P.poly([[x - 2.6, HY - 6.5], [x + 2.6, HY - 6.5], [x + 1.2, HY + dy - 1], [x, HY + dy], [x - 1.6, HY + dy - 2]], s.hair, { hi: true, part: p, clip: (X, Y) => ((X - HX - 2.5) / 9.6) ** 2 + ((Y - HY - 3.5) / 9.4) ** 2 <= 1 }));
  }
}

function helm(P, metal, pal, HX, HY, closed) {
  if (closed) {
    P.ell(HX, HY - .5, 13, 12.2, metal, { hi: true });
    P.poly([[HX - 4, HY + 1.5], [HX + 12, HY + 1], [HX + 12, HY + 3.5], [HX - 4, HY + 4]], '#0d0b12', { shade: 'flat', line: false });
    P.px(HX - 1, HY + 2.5, pal.e || '#ff3344', 1, { tag: 'e' }); P.px(HX, HY + 2.5, pal.e || '#ff3344', 0, { tag: 'e' });
    P.px(HX + 6, HY + 2.5, pal.e || '#ff3344', 1, { tag: 'e' });
    P.line(HX + 2, HY - 11, HX + 2, HY + 1, metal, 0);
    P.path([[HX - 11, HY - 7], [HX - 3, HY - 13.5], [HX + 7, HY - 11]], 1.4, pal.a || '#ff3344', { hi: true });
    return;
  }
  P.ell(HX - .5, HY - 3, 13.8, 11.4, metal, { hi: true, clip: (x, y) => y < HY - 2.5 + Math.max(0, HX - 4 - x) * 1.1 });
  P.poly([[HX - 9, HY - 4], [HX - 14, HY - 3], [HX - 13.5, HY + 6], [HX - 9.5, HY + 7]], metal, { hi: true });
  P.poly([[HX + 9, HY - 4], [HX + 13, HY - 3], [HX + 12.5, HY + 6], [HX + 10.5, HY + 6.5]], metal, { hi: true });
  P.poly([[HX - 12, HY - 3.5], [HX + 12.5, HY - 4.5], [HX + 12.5, HY - 2.5], [HX - 12, HY - 1.5]], pal.y || '#ffd34d', { hi: true });
  P.path([[HX - 11, HY - 8], [HX - 4, HY - 14.5], [HX + 5, HY - 13]], 1.5, pal.a || '#d22c3c', { hi: true });
}

function witchHat(P, col, band, HX, HY) {
  P.poly([[HX - 9, HY - 8], [HX + 8, HY - 8.5], [HX + 5, HY - 17], [HX + 1, HY - 23], [HX - 5, HY - 28], [HX - 12, HY - 30], [HX - 8, HY - 25], [HX - 7, HY - 17]], col, { hi: true, curve: .8 });
  P.poly([[HX - 9, HY - 11.5], [HX + 7.8, HY - 12], [HX + 8.2, HY - 8.6], [HX - 9.2, HY - 8]], band, { hi: true });
  P.ell(HX - .5, HY - 7.5, 17.5, 3.6, col, { curve: .9, hi: true });
  P.px(HX - 12, HY - 30, band, 0, { tag: 'g' });
}

function weapon(P, w, H, pal, metal) {
  const wood = pal.k || '#6b4a2b', gold = pal.y || '#ffd34d', gem = pal.g || '#7fe7ff';
  if (w === 'sword') {
    P.cap(H.x + 1.5, H.y - 2.5, H.x + 8.5, H.y - 20, 1.5, metal, { r2: .8, hi: true });
    P.line(H.x + 2.3, H.y - 4, H.x + 7.6, H.y - 17.5, metal, 0, { line: false });
    P.cap(H.x - 2.5, H.y - 1.2, H.x + 4.5, H.y - 3.8, 1.1, pal.a && pal.a !== metal ? gold : gold, { hi: true });
    P.cap(H.x, H.y + 1, H.x - 1, H.y + 3.6, 1, wood);
    P.ell(H.x - 1.4, H.y + 4.4, 1.3, 1.3, gold, { hi: true });
  } else if (w === 'greatsword') {
    P.cap(H.x + 1.5, H.y - 4, H.x + 10, H.y - 32, 3.3, pal.x || '#9aa4b0', { r2: 2.3, hi: true });
    P.cap(H.x + 3.8, H.y - 4.5, H.x + 12, H.y - 31, .9, pal.w || '#d6dde6', { hi: true, line: false });
    P.cap(H.x - 4.5, H.y - .5, H.x + 7, H.y - 5, 1.7, wood, { hi: true });
    P.px(H.x + 1.2, H.y - 2.6, pal.e || '#ff3040', 1, { tag: 'g' });
    P.cap(H.x, H.y + 1, H.x - 1.5, H.y + 6, 1.2, wood);
  } else if (w === 'staff' || w === 'crossstaff') {
    P.cap(H.x + 1, H.y + 18, H.x + 1.6, H.y - 26, 1.15, wood);
    if (w === 'staff') {
      P.path([[H.x - .5, H.y - 25], [H.x - 2.8, H.y - 29], [H.x - 1.5, H.y - 33]], .9, gold, { hi: true });
      P.path([[H.x + 3.6, H.y - 25], [H.x + 5.8, H.y - 29], [H.x + 4.6, H.y - 33]], .9, gold, { hi: true });
      P.ell(H.x + 1.6, H.y - 29.5, 3.3, 3.3, gem, { hi: true, tag: 'g' });
    } else {
      P.cap(H.x + 1.6, H.y - 26, H.x + 1.6, H.y - 36, 1.3, gold, { hi: true });
      P.cap(H.x - 3.2, H.y - 31.5, H.x + 6.4, H.y - 31.5, 1.3, gold, { hi: true });
      P.ell(H.x + 1.6, H.y - 31.5, 1.6, 1.6, gem, { hi: true, tag: 'g', line: false });
    }
  } else if (w === 'scythe') {
    P.cap(H.x - 3, H.y + 18, H.x + 4, H.y - 30, 1.15, wood);
    P.poly([[H.x + 4.5, H.y - 30.5], [H.x - 3, H.y - 34], [H.x - 13, H.y - 30.5], [H.x - 20, H.y - 21], [H.x - 12, H.y - 26.5], [H.x - 3, H.y - 29], [H.x + 3.5, H.y - 27]], metal, { hi: true });
  } else if (w === 'bow') {
    P.line(H.x - 3, H.y - 15, H.x - 3, H.y + 14, '#f2eee0', 1, { line: false });
    P.path([[H.x - 3, H.y - 15.5], [H.x, H.y - 9], [H.x + 1.6, H.y], [H.x, H.y + 8], [H.x - 3, H.y + 14.5]], 1.25, wood, { hi: true });
    P.ell(H.x - 3, H.y - 15.5, 1.2, 1.2, pal.a || gold, { hi: true }); P.ell(H.x - 3, H.y + 14.5, 1.2, 1.2, pal.a || gold, { hi: true });
  } else if (w === 'club') {
    P.cap(H.x + 1, H.y - 1, H.x + 6.5, H.y - 12, 1.3, wood, { r2: 3.1, hi: true });
    [[H.x + 3, H.y - 10], [H.x + 8.5, H.y - 9], [H.x + 7, H.y - 15]].forEach(([x, y]) => P.px(x, y, '#d8d2c0', 1));
  }
}

function shield(P, H, metal, pal) {
  const x = H.x + 1, y = H.y;
  P.poly([[x - 6, y - 10], [x + 6, y - 10], [x + 7, y - 1], [x, y + 10], [x - 7, y - 1]], pal.y || '#ffd34d', { hi: true });
  P.poly([[x - 4.6, y - 8.6], [x + 4.6, y - 8.6], [x + 5.4, y - 1.2], [x, y + 7.6], [x - 5.4, y - 1.2]], metal, { hi: true, line: false });
  P.cap(x, y - 6.5, x, y + 3.5, .9, pal.a || '#d22c3c', { line: false, shade: 'flat', tone: 2 });
  P.cap(x - 3.4, y - 3, x + 3.4, y - 3, .9, pal.a || '#d22c3c', { line: false, shade: 'flat', tone: 2 });
}

/* ---------------- beasts ---------------- */
export function quad(s) {
  const P = painter(GW, GH), p = s.pal, bear = s.type === 'bear';
  const fur = p.a, dk = p.d, light = p.n;
  if (!bear) P.path([[23, 50], [16, 45], [12, 38], [15, 33]], 3.6, fur, { r2: 2, hi: true });
  else P.ell(20, 48, 3.2, 3.2, fur);
  P.cap(24, 57, 23, 65, 2.6, dk); P.cap(43, 57, 44, 65, 2.6, dk);
  P.ell(36, 52, bear ? 17 : 15, bear ? 11.5 : 9.5, fur, { hi: true });
  P.ell(42, 54, 6, 6, light, { line: false, clip: (x, y) => ((x - 36) / (bear ? 17 : 15)) ** 2 + ((y - 52) / (bear ? 11.5 : 9.5)) ** 2 <= 1 });
  P.cap(30, 58, 29.5, 65.5, 2.8, fur); P.cap(48, 58, 48.5, 65.5, 2.8, fur);
  [[23.2, 65.5], [29.5, 66], [44.2, 65.5], [48.8, 66]].forEach(([x, y]) => P.ell(x + .8, y, 2.8, 1.8, dk));
  if (bear) { P.ell(46, 33, 3.4, 3.4, fur, { hi: true }); P.ell(56, 32.5, 3.2, 3.2, fur, { hi: true }); P.ell(46, 33, 1.5, 1.5, light, { line: false }); }
  else { P.poly([[44, 37], [45, 26], [51, 35]], fur, { hi: true }); P.poly([[52, 35], [57, 25.5], [59, 36]], fur, { hi: true }); P.poly([[46, 35], [46, 30], [49, 35]], light, { line: false }); }
  P.ell(51.5, 41.5, bear ? 11 : 10, bear ? 9.5 : 8.8, fur, { hi: true });
  P.ell(60, 45.5, bear ? 5 : 6, bear ? 4 : 3.8, light, { hi: true });
  P.ell(64.5, 44, 1.6, 1.3, '#1a1418', { shade: 'flat', line: false });
  /* eye + brow */
  const er = P.R(p.e);
  [[53, 38, er[4]], [54, 38, er[4]], [55, 38, er[3]], [53, 39, 0xffffff], [54, 39, er[2]], [55, 39, er[2]], [54, 40, er[1]], [55, 40, er[2]]].forEach(([x, y, c]) => P.px(x, y, c, 2, tagE));
  P.line(52, 36.5, 56, 37.5, LASH, 2);
  if (!bear) { P.line(57, 48.5, 64, 48, LASH, 2); P.px(59, 49, p.w || '#ffffff', 1); P.px(62, 49, p.w || '#ffffff', 1); }
  else P.line(58, 48, 63, 47.5, LASH, 2);
  return P;
}

export function bug(s) {
  const P = painter(GW, GH), p = s.pal, a = p.a, k = p.k, centi = s.type === 'centi', queen = s.type === 'queen';
  const legs = (xs) => xs.forEach(([x, y, f]) => P.path([[x, y], [x + f * 3, y - 4], [x + f * 6, y + 6], [x + f * 7, y + 13]], .8, k));
  if (centi) {
    legs([[16, 57, -1], [24, 57, -1], [32, 57, 1], [40, 57, 1], [48, 57, 1]]);
    [[12, 56, 6], [20, 55, 6.5], [28, 54, 7], [36, 53, 7.5], [44, 52, 8]].forEach(([x, y, r]) => P.ell(x, y, r, r * .9, a, { hi: true }));
    P.ell(55, 47, 10, 9, a, { hi: true });
  } else {
    legs([[30, 56, -1], [35, 56, 1], [40, 56, 1]]);
    if (queen) P.ell(28, 42, 9, 5, '#e6f2ff', { hi: true, line: false, curve: .6 });
    P.ell(queen ? 19 : 21, 50, queen ? 14 : 11.5, queen ? 11 : 9, a, { hi: true });
    [[16, 46], [21, 47], [26, 48]].forEach(([x, y]) => P.line(x, y - 5, x, y + 5, a, 3, { recv: false }));
    P.ell(34, 52, 2.5, 2.5, a);
    P.ell(40, 50, 6.5, 5.2, a, { hi: true });
    legs([[38, 55, 1], [42, 55, 1]]);
    P.ell(53, 43, 10, 9, a, { hi: true });
  }
  const hx = centi ? 55 : 53, hy = centi ? 47 : 43;
  P.path([[hx - 2, hy - 8], [hx - 6, hy - 17], [hx - 11, hy - 19]], .8, k); P.path([[hx + 3, hy - 8], [hx + 5, hy - 18], [hx + 10, hy - 20]], .8, k);
  P.ell(hx + 3, hy - 1, 3.2, 3.6, p.e, { hi: true, ...tagE }); P.px(hx + 2, hy - 2, 0xffffff, 2, tagE);
  P.path([[hx + 7, hy + 4], [hx + 12, hy + 5], [hx + 13, hy + 8]], 1.1, p.m || k, { r2: .6, hi: true });
  P.path([[hx + 5, hy + 6], [hx + 9, hy + 9], [hx + 8, hy + 11]], 1.1, p.m || k, { r2: .6, hi: true });
  if (queen) P.poly([[hx - 6, hy - 8], [hx + 4, hy - 9], [hx + 4, hy - 14], [hx + 2, hy - 11.5], [hx - 1, hy - 15], [hx - 3, hy - 11.5], [hx - 6, hy - 14]], p.m || '#ffd34d', { hi: true });
  return P;
}

export function treant(s) {
  const P = painter(GW, GH), p = s.pal;
  P.path([[26, 46], [18, 40], [14, 32]], 2.2, p.d, { r2: 1.2 }); P.path([[47, 46], [55, 42], [60, 34]], 2.2, p.d, { r2: 1.2 });
  P.poly([[28, 38], [45, 38], [47, 60], [51, 66.5], [43, 66], [38, 62], [33, 66], [24, 66.5], [27, 60]], p.d, { curve: .9 });
  P.ell(36, 28, 19, 14, p.a, { hi: true });
  [[22, 22], [30, 17], [42, 16], [52, 24], [26, 34], [48, 34]].forEach(([x, y]) => P.ell(x, y, 6, 5, p.a, { hi: true }));
  P.ell(38, 47, 7, 5, mix(p.d, '#000000', .45), { shade: 'flat', line: false });
  P.px(35, 46, p.e, 1, tagE); P.px(36, 46, p.e, 0, tagE); P.px(41, 46, p.e, 1, tagE); P.px(42, 46, p.e, 0, tagE);
  P.line(36, 50, 41, 50, '#120c08', 2);
  return P;
}

export function snowGolem(s) {
  const P = painter(GW, GH), p = s.pal;
  P.cap(22, 44, 15, 52, 3.4, p.a, { r2: 4.2, hi: true });
  P.ell(36, 52, 15, 13.5, p.a, { hi: true });
  P.ell(37, 31, 10.5, 9.5, p.a, { hi: true });
  [[28, 22], [34, 19.5], [41, 20], [46, 24]].forEach(([x, y], i) => P.poly([[x - 2, y + 3], [x + (i - 1.5), y - 5], [x + 2, y + 3]], p.e, { hi: true, tag: 'g' }));
  P.ell(33, 32, 1.6, 2, p.e, { hi: true, ...tagE }); P.ell(41, 32, 1.4, 2, p.e, { hi: true, ...tagE });
  P.line(34, 37, 41, 36.5, p.d, 3);
  P.cap(52, 44, 58, 52, 3.4, p.a, { r2: 4.2, hi: true });
  [[30, 47], [43, 51], [34, 58]].forEach(([x, y]) => P.ell(x, y, 1.8, 1.8, p.d, { line: false }));
  P.ell(29, 65, 4.5, 2.4, p.d); P.ell(44, 65, 4.5, 2.4, p.d);
  return P;
}

/* ---------------- objects ---------------- */
export function chest(s, open) {
  const P = painter(GW, GH), p = s.pal;
  P.poly([[19, 49], [53, 49], [52, 66], [20, 66]], p.a, { curve: .5 });
  [[19, 49, 4], [49, 49, 4]].forEach(([x, y, w]) => P.rect(x, y, w, 17, p.k, { hi: true }));
  P.rect(19, 57, 34, 3, p.y, { hi: true });
  if (!open) {
    P.poly([[18, 49], [54, 49], [53, 41], [47, 37], [25, 37], [19, 41]], p.a, { hi: true });
    P.poly([[18, 47], [54, 47], [54, 50], [18, 50]], p.y, { hi: true });
    P.rect(33, 46, 6, 7, p.y, { hi: true }); P.px(35.5, 49, '#1a1418', 2); P.px(35.5, 50, '#1a1418', 2);
    return P;
  }
  P.poly([[18, 38], [54, 38], [53, 30], [47, 26], [25, 26], [19, 30]], p.a, { hi: true });
  P.rect(18, 36, 36, 3, p.y, { hi: true });
  P.ell(36, 45, 16, 7, p.r || '#5a0a14', { shade: 'flat', tone: 3, line: false });
  for (let x = 21; x <= 51; x += 4) { P.poly([[x, 39], [x + 3.4, 39], [x + 1.7, 44]], p.w, { hi: true }); P.poly([[x + 2, 50], [x + 5.4, 50], [x + 3.7, 45]], p.w, { hi: true }); }
  P.path([[32, 47], [36, 52], [42, 54], [46, 51]], 2.4, '#e05070', { hi: true, line: false });
  P.ell(27, 32, 2.6, 2.8, p.e, { hi: true, ...tagE }); P.ell(45, 32, 2.6, 2.8, p.e, { hi: true, ...tagE });
  P.px(27, 32, '#1a0505', 2, tagE); P.px(45, 32, '#1a0505', 2, tagE);
  return P;
}

export function spring(s) {
  const P = painter(GW, GH), p = s.pal;
  P.ell(36, 60, 20, 7, p.w, { hi: true });
  P.ell(36, 58.5, 16, 4.5, p.g, { hi: true, tag: 'g', line: false });
  P.cap(36, 57, 36, 42, 3, p.w, { hi: true });
  P.ell(36, 41, 8, 3, p.w, { hi: true });
  P.ell(36, 40.2, 6, 1.8, p.g, { hi: true, tag: 'g', line: false });
  P.path([[36, 39], [35, 33], [36, 29]], 1.2, p.g, { hi: true, tag: 'g', line: false });
  [[29, 44, 33, 52], [43, 44, 39, 52]].forEach(([a, b, c, d]) => P.path([[a, b], [(a + c) / 2 + (a < 36 ? -2 : 2), (b + d) / 2], [c, d]], .9, p.g, { hi: true, tag: 'g', line: false }));
  return P;
}
