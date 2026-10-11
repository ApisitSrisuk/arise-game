import { painter } from './raster.js';
import { mix } from '../game/util.js';
import { GW, GH } from './chibi.js';

/* Taller "HD pixel" figures (~3.3 heads): small face, crisp dark outline, layered outfits.
   Faces right on the 72×72 grid, feet on y≈67. Appearance comes entirely from the spec:
   body outfit + head gear + weapon + back item, each with its own palette keys.
   outfits: tunic leather robe armor coat bare rags bones · modern: casual hoodie uniform jacket suit tactical
   body c/d/a/p/b/am(metal)/bk(belt)/gl(gauntlets) · head o(cloth)/hm(metal)/ha(accent)/hg(gem, lens) · weapon w/k/y/g/x, fl(flask liquid, front hand)
   back r/ry, sc(scarf), qk/qa(quiver or backpack), wg(wings) */
const CX = 36, LASH = '#1a1018';
const tagE = { tag: 'e', line: false };

export function figure(s) {
  const P = painter(GW, GH);
  const g = new Set(s.gear || []), pal = s.pal, sp = s.species || 'human';
  const HX = CX + 1, HY = 20;
  const H = { x: CX + 10, y: 44.5 }, B = { x: CX - 7.5, y: 45 };
  const skin = s.skin, outfit = s.outfit || 'tunic';
  const cloth = pal.c, dark = pal.d || mix(cloth, '#000000', .3), acc = pal.a || '#e9eef5';
  const am = pal.am || pal.w || '#c9d2dc', hm = pal.hm || pal.w || '#c9d2dc';
  const belt = pal.bk || pal.k || '#5c3d22';
  const bare = outfit === 'bare' || outfit === 'rags', bones = outfit === 'bones', armor = outfit === 'armor';
  const casual = outfit === 'casual', tactical = outfit === 'tactical';
  const sleeve = bare || bones || casual ? skin : armor ? am : tactical ? dark : cloth;
  const pants = bones ? skin : pal.p || '#3b3b4f', boots = armor ? am : bones ? skin : pal.b || '#4a2f1f';
  const aff = s.aff || '#ffffff';
  const closedHelm = sp === 'knight';
  const bald = sp === 'skel' || sp === 'insect' || closedHelm || s.hairStyle === 'none';
  const hood = g.has('hood'), hat = g.has('hat'), helm = g.has('helm') || closedHelm;

  /* ---------- back layer ---------- */
  if (g.has('wings')) wings(P, pal.wg || '#f4f1ff');
  if (g.has('scarf')) P.path([[CX - 3, 31], [CX - 9, 30], [CX - 14, 33], [CX - 19, 30]], 1.8, pal.sc || aff, { r2: .9, hi: true });
  if (g.has('cape')) P.poly([[CX - 5.5, 30], [CX + 6, 30], [CX + 8.5, 40], [CX + 8, 55], [CX + 4, 59], [CX - 1, 57], [CX - 6, 60.5], [CX - 11, 58], [CX - 14, 52], [CX - 10.5, 40]], pal.r || '#7a1020', { curve: .8, vcurve: .6 });
  if (g.has('backpack')) { const bag = pal.qk || '#3a4a5a'; P.rect(CX - 12.5, 29.5, 8, 13, bag, { hi: true, curve: .9 }); P.rect(CX - 13, 36.5, 6, 5, mix(bag, '#000000', .2), { hi: true }); }
  if (outfit === 'hoodie') P.ell(CX - 2.5, 29.5, 6, 3.4, dark, { hi: true });
  if (g.has('quiver')) { P.poly([[CX - 9, 24], [CX - 5, 23], [CX - 2, 38], [CX - 6, 39]], pal.qk || '#6b4a2b'); [[CX - 8.5, 21], [CX - 7, 20.5], [CX - 5.5, 21.5]].forEach(([x, y]) => P.cap(x, y + 3.5, x, y, .8, pal.qa || '#e8e2c8', { hi: true })); }
  if (hood) P.poly([[HX - 10, HY], [HX - 10.5, HY + 10], [HX - 4, HY + 12.5], [HX + 5, HY + 12], [HX + 9, HY + 8], [HX + 9, HY]], mix(pal.o || cloth, '#000000', .2), { curve: .7 });
  if (!bald && !hood) hairBack(P, s, HX, HY);
  if (outfit === 'coat') P.poly([[CX - 6.5, 40], [CX + 7, 40], [CX + 9, 57], [CX + 4.5, 55], [CX + 1, 58.5], [CX - 3.5, 55], [CX - 9, 57.5]], cloth, { curve: .9 });
  if (g.has('daggers')) P.cap(B.x - .5, B.y - 1, B.x - 5.5, B.y - 5.5, 1, pal.w || '#d6dde6', { r2: .45, hi: true });
  if (g.has('pauldron')) P.ell(CX - 5.5, 32, 3.8, 3.1, aff, { hi: true });

  /* ---------- back arm ---------- */
  limb(P, [[CX - 4.5, 32.5], [CX - 7, 38.5], [B.x, B.y - 1.6]], sleeve, outfit === 'robe', armor);
  P.ell(B.x, B.y, 1.9, 1.9, armor ? am : skin, { bias: .15, maxT: 3 });
  if (g.has('gauntlets')) P.ell(B.x, B.y, 2.7, 2.5, pal.gl || pal.a || '#8a94a2', { hi: true, bias: .1 });

  /* ---------- legs ---------- */
  if (outfit !== 'robe') {
    const lr = bones ? 1.3 : 2.3, lc = armor ? am : pants;
    P.path([[CX - 2.5, 45], [CX - 3.6, 53.5], [CX - 4.2, 60]], lr, lc, { r2: lr * .85, hi: armor });
    P.path([[CX + 3, 45], [CX + 4.4, 53.5], [CX + 5.4, 60]], lr, lc, { r2: lr * .85, hi: armor });
    if (armor) { P.ell(CX - 3.6, 53.5, 2.2, 1.9, am, { hi: true }); P.ell(CX + 4.4, 53.5, 2.2, 1.9, am, { hi: true }); }
  }
  /* boots with cuffs */
  [[CX - 4.2, 63.6, 3.3], [CX + 6.2, 64, 3.7]].forEach(([x, y, rx], i) => {
    P.cap(x - (i ? .8 : .2), y - 6.5, x - (i ? .8 : .2), y - 1.5, 2.4, boots, { hi: true });
    P.ell(x, y, rx, 2.5, boots, { hi: true, bias: .1 });
    if (!bones && outfit !== 'robe') P.cap(x - (i ? .8 : .2) - 2.2, y - 6.5, x - (i ? .8 : .2) + 2.2, y - 6.8, .9, armor ? am : mix(boots, '#ffffff', .18), { hi: true });
  });

  /* ---------- torso ---------- */
  torso(P, s, outfit, { cloth, dark, acc, am, skin, pants, belt });
  if (g.has('scarf')) P.poly([[CX - 5, 28.5], [CX + 7, 28.5], [CX + 7.5, 32], [CX - 5.5, 32]], pal.sc || aff, { hi: true });
  if (casual) { P.cap(CX - 4.5, 32.5, CX - 6.2, 36.2, 2.4, cloth, { hi: true }); }
  if (g.has('backpack')) [[CX - 3.5, 29.5, CX - 4.3, 40.5], [CX + 4.6, 29.8, CX + 5.4, 39.5]].forEach(([a, b, c, d]) => P.cap(a, b, c, d, .75, pal.qa || '#1e2630', { line: false }));
  if (g.has('cape')) { P.poly([[CX - 6, 28.8], [CX + 7, 28.8], [CX + 8, 31.8], [CX - 7, 31.8]], pal.r || '#7a1020'); P.ell(CX + 4, 31, 1.4, 1.4, pal.ry || '#ffd34d', { hi: true }); }

  /* ---------- head ---------- */
  P.cap(CX + 1, 26, CX + 1, 30, 2, skin, { tone: 3, line: false });
  if (sp === 'goblin') P.poly([[HX + 6, HY - 1], [HX + 13, HY - 5], [HX + 8, HY + 3]], skin);
  const headPart = P.ell(HX, HY - .5, 7.6, 8, skin, { bias: .25, maxT: 3, hi: sp === 'skel' });
  P.ell(HX + 1.4, HY + 2.8, 6.2, 5.4, skin, { bias: .25, maxT: 3, part: headPart, hi: sp === 'skel' });
  if (sp === 'orc') P.ell(HX + 1.5, HY + 3.5, 7.5, 5, skin, { bias: .2, maxT: 3, part: headPart });
  if (!closedHelm) face(P, s, sp, HX, HY);
  if (sp === 'goblin') P.poly([[HX - 5.5, HY + 1], [HX - 14, HY - 4], [HX - 7, HY + 4.5]], skin, { bias: .1 });
  else if (sp === 'elf') P.poly([[HX - 5.5, HY + 1], [HX - 12.5, HY - 5], [HX - 6.5, HY + 3.5]], skin, { bias: .1 });
  else if (!bald && !hood && s.hairStyle !== 'long' && s.hairStyle !== 'bangs') P.ell(HX - 5.6, HY + 1.6, 1.6, 2.2, skin, { maxT: 3 });

  const visor = g.has('visor');
  if (!bald && !hood && !visor) hairFront(P, s, HX, HY, hat || helm || g.has('cap') || g.has('tophat') || g.has('beret'));
  if (sp === 'orc') [[HX - 5, HY - 7], [HX - 2, HY - 9], [HX + 1.5, HY - 9.5]].forEach(([x, y]) => P.poly([[x - 1.6, y + 3], [x, y - 2.5], [x + 1.6, y + 3]], s.hair, { hi: true }));
  if (sp === 'insect') { P.path([[HX - 2, HY - 7], [HX - 5, HY - 13], [HX - 9, HY - 15]], .7, pal.k || '#111111'); P.path([[HX + 2, HY - 7], [HX + 4, HY - 14], [HX + 8, HY - 16]], .7, pal.k || '#111111'); P.ell(HX - 9, HY - 15, 1.3, 1.3, acc, { hi: true }); P.ell(HX + 8, HY - 16, 1.3, 1.3, acc, { hi: true }); }

  /* ---------- head gear ---------- */
  if (hood) hoodFront(P, pal.o || cloth, HX, HY, s);
  if (helm) helmet(P, hm, pal, HX, HY, closedHelm);
  if (g.has('glasses')) glasses(P, pal.ha || '#2a2a33', pal.hg || '#bfe9ff', HX, HY);
  if (g.has('cap')) baseballCap(P, pal.o || '#2a3a5a', pal.ha || '#ffffff', HX, HY);
  if (visor) visorHelm(P, hm, pal.ha || '#5ff2ff', HX, HY);
  if (g.has('headset')) headset(P, hm, pal.ha || '#5ff2ff', HX, HY);
  if (g.has('mask')) P.ell(HX + 1.5, HY + 5, 7.5, 3.6, pal.ha || '#8b1e2e', { clip: (x, y) => y > HY + 3.3 && (((x - HX) / 7.7) ** 2 + ((y - HY + .5) / 8.1) ** 2 <= 1 || ((x - HX - 1.4) / 6.3) ** 2 + ((y - HY - 2.8) / 5.5) ** 2 <= 1) });
  if (g.has('bandana')) { P.poly([[HX - 8, HY - 4.5], [HX + 8, HY - 5.5], [HX + 8.2, HY - 3], [HX - 8, HY - 2]], pal.o || '#b02a3a', { hi: true }); P.path([[HX - 7.5, HY - 3], [HX - 11, HY - 1], [HX - 13, HY + 2]], 1, pal.o || '#b02a3a', { r2: .6 }); }
  if (g.has('circlet')) { P.path([[HX - 7.5, HY - 3.5], [HX, HY - 4.5], [HX + 7.8, HY - 4]], .7, pal.ha || '#e2e8f0', { hi: true }); P.ell(HX + 2.5, HY - 4.3, 1.2, 1.2, pal.hg || '#7fe7ff', { hi: true, tag: 'g', line: false }); }
  if (hat) witchHat(P, pal.o || cloth, pal.ha || '#ffcc55', HX, HY);
  if (g.has('tophat')) topHat(P, pal.o || '#1a1a1a', pal.ha || '#8b1e2e', HX, HY);
  if (g.has('beret')) beret(P, pal.o || '#5a2a7a', pal.ha || '#f4f0e6', HX, HY);
  if (g.has('horns')) { const n = pal.n || '#e8dcc0'; P.path([[HX - 4, HY - 6], [HX - 7, HY - 10], [HX - 10, HY - 12], [HX - 12.5, HY - 11.5]], 1.8, n, { r2: .5, hi: true }); P.path([[HX + 3.5, HY - 7], [HX + 6, HY - 11.5], [HX + 9, HY - 13.5], [HX + 11.5, HY - 13]], 2, n, { r2: .5, hi: true }); }
  if (g.has('crownh')) { const y0 = helm ? HY - 9.5 : HY - 7.5; P.poly([[HX - 4.5, y0], [HX + 4, y0 - .8], [HX + 4, y0 - 5], [HX + 2.3, y0 - 3], [HX, y0 - 6], [HX - 1.8, y0 - 3], [HX - 4.2, y0 - 5]], pal.hk || pal.ry || pal.y || '#ffd34d', { hi: true }); P.px(HX, y0 - 2, '#ff3355', 1, { tag: 'g' }); }
  if (g.has('halo')) P.ell(HX - 1, HY - 13, 7, 2, pal.hy || pal.y || '#ffd34d', { shade: 'flat', tone: 1, line: false, tag: 'g', clip: (x, y) => ((x - HX + 1) / 5) ** 2 + ((y - HY + 13) / .9) ** 2 > 1 });
  if (g.has('eyemark')) [[HX - 3, HY + 4], [HX - 2, HY + 5], [HX - 1, HY + 4]].forEach(([x, y]) => P.px(x, y, aff, 1, { tag: 'g' }));

  /* ---------- front arm + weapon ---------- */
  const wpn = ['sword', 'greatsword', 'staff', 'crossstaff', 'scythe', 'bow', 'club', 'spear', 'hammer', 'axe', 'bat', 'katana', 'gun', 'rifle'].find(w => g.has(w));
  if (wpn) weapon(P, wpn, H, pal);
  limb(P, [[CX + 5.5, 32.5], [CX + 8.6, 38.5], [H.x, H.y - 1.6]], sleeve, outfit === 'robe', armor);
  if (casual) P.cap(CX + 5.5, 32.5, CX + 7.8, 36.2, 2.4, cloth, { hi: true });
  if (outfit === 'leather' || outfit === 'tunic') P.cap(CX + 8.9, 40.5, H.x - .3, H.y - 2.2, 1.9, belt, { line: false });
  P.ell(H.x, H.y, 1.95, 1.95, armor ? am : skin, { bias: .15, maxT: 3 });
  if (g.has('gauntlets')) P.ell(H.x, H.y, 2.9, 2.7, pal.gl || pal.a || '#8a94a2', { hi: true, bias: .1 });
  if (g.has('cards')) cards(P, H, pal);
  if (g.has('flask')) flask(P, H, pal.fl || pal.g || '#7dff8a');
  if (g.has('daggers')) { P.cap(H.x + 1.2, H.y - 1.4, H.x + 6.5, H.y - 5.5, 1, pal.w || '#d6dde6', { r2: .45, hi: true }); P.px(H.x + .8, H.y - .8, pal.y || '#ffd34d', 2); }
  if (g.has('shield')) shield(P, H, pal);
  if (g.has('pauldron')) P.ell(CX + 6.8, 32, 4, 3.2, aff, { hi: true });
  if (g.has('runes')) [[CX - 15, 26], [CX + 16, 18], [CX - 13, 50]].forEach(([x, y], i) => { P.ell(x, y, 2 - i * .3, 2 - i * .3, aff, { hi: true, line: false, tag: 'g' }); P.px(x + 2.5, y - 2.5, aff, 0, { tag: 'g' }); });
  return P;
}

function limb(P, pts, col, wide, metal) {
  P.path(pts, wide ? 2.4 : 2.05, col, { r2: wide ? 3 : 1.8, hi: metal });
}

function torso(P, s, outfit, { cloth, dark, acc, am, skin, pants, belt }) {
  const pal = s.pal;
  const T = [[CX - 5.5, 29.5], [CX + 6.5, 29.5], [CX + 7.5, 34], [CX + 6, 40], [CX + 6.8, 45], [CX - 5.8, 45], [CX - 5, 40], [CX - 6.5, 34]];
  const buckle = (y) => { P.poly([[CX - 6, y], [CX + 7, y], [CX + 7.3, y + 2], [CX - 6.2, y + 2]], belt); P.rect(CX + 1.5, y - .2, 2.2, 2.4, pal.y || '#d4af37', { hi: true, line: false }); };
  if (outfit === 'robe') {
    P.poly([[CX - 5.5, 29.5], [CX + 6.5, 29.5], [CX + 8, 37], [CX + 10.5, 62], [CX + 7, 64.6], [CX - 3, 64.6], [CX - 9, 62], [CX - 6.5, 37]], cloth, { curve: .9 });
    for (const x of [-3.5, 4.5]) P.line(CX + x, 47, CX + x * 1.4, 61, cloth, 3, { recv: false });
    P.poly([[CX - 9, 61], [CX + 10.3, 61], [CX + 10.5, 62], [CX + 7, 64.6], [CX - 3, 64.6], [CX - 9.1, 62]], acc, { line: false, hi: true });
    P.poly([[CX + 1, 31], [CX + 2.8, 31], [CX + 3.8, 61], [CX + 1.9, 61]], acc, { line: false, hi: true });
    P.poly([[CX - 6, 40], [CX + 7, 40], [CX + 7.4, 42.3], [CX - 6.3, 42.3]], dark, {});
    P.path([[CX + 5, 42], [CX + 6, 47], [CX + 5.4, 51]], .9, dark, { line: false });
    P.poly([[CX - 3, 28.5], [CX + 4.5, 28.5], [CX + 5.5, 31.5], [CX + 1.2, 34], [CX - 3.4, 31.5]], acc, { hi: true });
    return;
  }
  if (outfit === 'bones') {
    P.ell(CX + .5, 35.5, 5.5, 5, skin, { hi: true });
    for (let y = 33; y <= 38; y += 2) P.line(CX - 3.5, y, CX + 4.5, y, '#2a2226', 2, { recv: false });
    P.line(CX + .5, 31, CX + .5, 44, skin, 3);
    P.ell(CX + .5, 44.5, 4.8, 2.2, skin, { hi: true });
    return;
  }
  if (outfit === 'armor') {
    P.poly(T, am, { hi: true });
    P.poly([[CX - 2, 31.5], [CX + 4.5, 31.5], [CX + 5, 37.5], [CX + 1.2, 39.5], [CX - 2.4, 37.5]], pal.a || acc, { line: false, hi: true });
    P.line(CX + 1.2, 31, CX + 1.2, 39, am, 0, { line: false });
    buckle(40);
    P.poly([[CX - 7, 42.5], [CX + 8, 42.5], [CX + 9, 48.5], [CX + 4, 49.5], [CX + 1, 47.5], [CX - 3, 49.5], [CX - 8, 48.5]], am, { hi: true });
    P.poly([[CX - 3, 42.5], [CX + 4, 42.5], [CX + 3.6, 49], [CX - 2.6, 49]], dark, { line: false });
    P.ell(CX - 5.5, 32, 3.7, 3, am, { hi: true });
    return;
  }
  if (outfit === 'bare' || outfit === 'rags') {
    P.poly(T, skin, { bias: .1 });
    P.line(CX + 1.5, 33, CX + 1.5, 39, skin, 3, { recv: false });
    if (outfit === 'rags') { P.poly([[CX - 5.5, 29.5], [CX - 1, 29.5], [CX - 1.5, 42.5], [CX - 6, 42.5]], cloth); P.poly([[CX + 3.8, 29.5], [CX + 6.5, 29.5], [CX + 7.4, 42.5], [CX + 4.2, 42.5]], cloth); }
    buckle(41);
    P.poly([[CX - 5.5, 43], [CX + 6.5, 43], [CX + 5.5, 50], [CX + 1.5, 48], [CX - 3.5, 50]], outfit === 'rags' ? dark : cloth);
    return;
  }
  if (MODERN.has(outfit)) { modernTorso(P, s, outfit, T, { cloth, dark, acc, pants, belt }); return; }
  /* tunic / leather / coat */
  P.poly(T, cloth);
  if (outfit === 'coat') {
    P.poly([[CX + 1, 30], [CX + 4.6, 30], [CX + 4.2, 45], [CX + 1.4, 45]], dark, { line: false });
    P.poly([[CX - 6.5, 27.5], [CX + 7, 27.5], [CX + 8.5, 32.5], [CX + 4, 31], [CX - 1.5, 31.5], [CX - 7.5, 32.5]], cloth, { hi: true });
    P.line(CX - 7.5, 32.5, CX + 8.5, 32.5, acc, 2, { line: false });
    [33.5, 36.5, 39.5].forEach(y => P.px(CX + 4.9, y, pal.y || '#d4af37', 1));
    buckle(40.5);
    return;
  }
  P.poly([[CX - 6.8, 41.5], [CX + 7.8, 41.5], [CX + 9, 50.5], [CX + 4.5, 51], [CX + 1, 49.5], [CX - 3, 51], [CX - 8, 50.5]], cloth);
  P.line(CX + 1, 43.5, CX + 1, 49, cloth, 3, { recv: false });
  P.poly([[CX - .5, 29.5], [CX + 4, 29.5], [CX + 1.8, 33.5]], acc, { line: false, hi: true });
  if (outfit === 'leather') {
    P.poly([[CX - 5.5, 30], [CX - 1, 30], [CX - .5, 41], [CX - 5, 41]], dark, { line: false });
    P.cap(CX - 4.5, 30.5, CX + 6.2, 40.5, .8, belt, { line: false });
  }
  buckle(40);
  P.rect(CX + 4.5, 42.2, 3.2, 3, belt, { hi: true });
  P.ell(CX + 6.4, 32, 3, 2.4, outfit === 'leather' ? dark : acc, { hi: true });
}

function face(P, s, sp, HX, HY) {
  const er = P.R(s.eye), skinR = P.R(s.skin);
  if (sp === 'skel') {
    P.ell(HX - 2.2, HY + 1.5, 1.9, 2.1, '#1a1418', { shade: 'flat', line: false });
    P.ell(HX + 3.6, HY + 1.5, 1.5, 2, '#1a1418', { shade: 'flat', line: false });
    P.px(HX - 2.2, HY + 1.5, s.eye, 1, { tag: 'e' }); P.px(HX + 3.6, HY + 1.5, s.eye, 1, { tag: 'e' });
    P.px(HX + 1.5, HY + 4, '#1a1418', 2);
    for (let x = HX - 1; x <= HX + 5; x++) P.px(x, HY + 6.5, (x % 2) ? '#1a1418' : s.skin, x % 2 ? 2 : 1);
    return;
  }
  if (sp === 'insect') {
    P.ell(HX - 1.8, HY + 1, 2.4, 2.8, s.eye, { hi: true, ...tagE });
    P.ell(HX + 4.2, HY + 1, 1.8, 2.6, s.eye, { hi: true, ...tagE });
    P.path([[HX + 2, HY + 6], [HX + 1, HY + 8.5], [HX + 2.5, HY + 9.5]], .7, s.pal.m || '#3a3a48', { line: false });
    P.path([[HX + 5, HY + 6], [HX + 6.5, HY + 8.5], [HX + 5, HY + 9.5]], .7, s.pal.m || '#3a3a48', { line: false });
    return;
  }
  const y0 = HY + 1;
  /* near eye: 3 wide, far eye: 2 wide */
  [HX - 3, HX - 2, HX - 1, HX - 4].forEach(x => P.px(x, y0, LASH, 2, tagE));
  P.px(HX - 3, y0 + 1, 0xffffff, 2, tagE); P.px(HX - 2, y0 + 1, er[4], 2, tagE); P.px(HX - 1, y0 + 1, er[3], 2, tagE);
  P.px(HX - 2, y0 + 2, er[1], 2, tagE); P.px(HX - 1, y0 + 2, er[2], 2, tagE);
  [HX + 3, HX + 4, HX + 5].forEach(x => P.px(x, y0, LASH, 2, tagE));
  P.px(HX + 3, y0 + 1, er[4], 2, tagE); P.px(HX + 4, y0 + 1, er[3], 2, tagE); P.px(HX + 3, y0 + 2, er[1], 2, tagE);
  if (sp === 'demon' || sp === 'goblin') { P.px(HX - 2, y0 + 1, 0x100808, 2, tagE); P.px(HX + 3, y0 + 1, 0x100808, 2, tagE); }
  /* brows */
  const brow = s.hair && sp !== 'goblin' ? P.R(s.hair)[4] : LASH;
  if (sp === 'orc' || sp === 'demon' || sp === 'goblin') { P.line(HX - 4, y0 - 2, HX - 1, y0 - 1, LASH, 2); P.line(HX + 3, y0 - 1, HX + 5, y0 - 2, LASH, 2); }
  else { P.line(HX - 3, y0 - 1.5, HX - 1, y0 - 1.5, brow, 2, { line: false }); P.px(HX + 3.5, y0 - 1.5, brow, 2); }
  /* nose, mouth, cheek */
  P.px(HX + 3, HY + 3.5, skinR[3], 2);
  if (sp === 'goblin') { P.ell(HX + 4.5, HY + 3.5, 1.8, 1.3, s.skin, { maxT: 3 }); P.line(HX, HY + 6, HX + 4, HY + 6.5, LASH, 2); P.px(HX + 3, HY + 7, '#f0ead8', 1); }
  else if (sp === 'orc') { P.line(HX, HY + 6.5, HX + 5, HY + 6.5, LASH, 2); P.px(HX, HY + 5.5, '#f0ead8', 1); P.px(HX + 5, HY + 5.5, '#f0ead8', 1); }
  else if (sp === 'demon') { P.line(HX + 1, HY + 6, HX + 3.5, HY + 6, LASH, 2); P.px(HX + 1, HY + 7, '#f0ead8', 1); }
  else { P.px(HX + 2, HY + 5.5, mix(s.skin, '#8a2a30', .5), 2); P.px(HX + 3, HY + 5.5, skinR[4], 2); P.px(HX - 3, HY + 4, mix(s.skin, '#ff6f86', .25), 2); }
}

function hairBack(P, s, HX, HY) {
  const h = s.hair, st = s.hairStyle || 'short';
  if (st === 'long') P.poly([[HX - 8.5, HY - 3], [HX - 10, HY + 6], [HX - 9.5, HY + 15], [HX - 8, HY + 22], [HX - 5.5, HY + 18], [HX - 3.5, HY + 22.5], [HX - .5, HY + 17], [HX + 2, HY + 21], [HX + 4.5, HY + 15], [HX + 7, HY + 17], [HX + 8.5, HY + 7], [HX + 8, HY - 4], [HX, HY - 9]], h, { curve: .85, hi: true });
  else if (st === 'bangs') P.poly([[HX - 8.5, HY - 3], [HX - 9.5, HY + 5], [HX - 9, HY + 10.5], [HX - 4, HY + 11.5], [HX + 3, HY + 11], [HX + 8.5, HY + 9.5], [HX + 8.8, HY], [HX, HY - 9]], h, { curve: .85, hi: true });
  else if (st === 'pony') P.path([[HX - 7, HY - 5], [HX - 11.5, HY - 2], [HX - 13.5, HY + 4], [HX - 12, HY + 10], [HX - 14, HY + 15]], 3.2, h, { r2: .9, hi: true });
  P.ell(HX - 1.2, HY - 1.2, 8.8, 8.6, h, { hi: true });
}

function hairFront(P, s, HX, HY, under) {
  const h = s.hair, st = s.hairStyle || 'short';
  const cap = P.part({ line: true });
  if (!under) {
    P.ell(HX - .3, HY - 2.3, 8.7, 7.4, h, { hi: true, part: cap, clip: (x, y) => y < HY - 1.3 + Math.max(0, HX - 2 - x) * .9 });
    if (st === 'spiky') [[[HX - 6, HY - 4], [HX - 11, HY - 11], [HX - 3, HY - 7]], [[HX - 4, HY - 7], [HX - 4.5, HY - 14], [HX + .5, HY - 8]], [[HX, HY - 8.5], [HX + 4.5, HY - 14], [HX + 4.5, HY - 7]], [[HX + 3.5, HY - 7], [HX + 9.5, HY - 10], [HX + 7, HY - 3]], [[HX - 7.5, HY], [HX - 13.5, HY - 3], [HX - 8.5, HY - 4.5]]]
      .forEach(t => P.poly(t, h, { hi: true, part: cap }));
  }
  /* fringe swept toward the face side */
  const tips = st === 'bangs' ? [[HX - 5, 1.2], [HX - 2.5, 1.6], [HX, 1.2], [HX + 2.5, 1.6], [HX + 5, 1.2]]
    : st === 'spiky' ? [[HX - 4, .5], [HX + .5, 2], [HX + 5, 1]]
      : [[HX - 4.5, -.5], [HX - 1.5, 1.4], [HX + 1.8, .4], [HX + 5, 1.6]];
  const top = HY - (under ? 5 : 5.5), w = st === 'bangs' ? 1.5 : st === 'spiky' ? 2.2 : 1.9, sw = st === 'bangs' ? 0 : 1.2;
  tips.forEach(([x, dy]) => P.poly([[x - w, top], [x + w, top], [x + w * .5 + sw, HY + dy - 1.2], [x + .3 + sw, HY + dy], [x - w * .6 + sw * .5, HY + dy - 1.6]], h, { hi: true, part: cap }));
  const longLock = st === 'long' || st === 'bangs';
  P.poly([[HX + 5.5, HY - 4.5], [HX + 8.4, HY - 2.5], [HX + 8.6, HY + (longLock ? 9 : 4.5)], [HX + 7.3, HY + (longLock ? 11 : 6)], [HX + 6.3, HY + 1.5]], h, { hi: true, part: cap });
  P.poly([[HX - 6, HY - 4.5], [HX - 9, HY - 1.5], [HX - 9.2, HY + (longLock ? 10 : 5.5)], [HX - 7.6, HY + (longLock ? 12.5 : 7)], [HX - 6.4, HY + 2.5]], h, { hi: true, part: cap });
  if (!under) { const hr = P.R(h); for (let x = HX - 5; x <= HX - 1; x++) P.px(x, HY - 6 - Math.round(Math.sin((x - HX + 5) / 4 * Math.PI)), hr[0], 2, { line: false }); }
  if (st === 'pony') P.ell(HX - 7.5, HY - 4.5, 1.5, 1.5, '#e8475f', { hi: true });
}

function hoodFront(P, col, HX, HY, s) {
  const open = (x, y) => ((x - HX - 2) / 6.6) ** 2 + ((y - HY - 2.6) / 6.6) ** 2 <= 1;
  P.ell(HX - .8, HY - 1.4, 9.8, 9.4, col, { clip: (x, y) => !open(x, y), curve: .9 });
  P.poly([[HX - 8, HY - 4], [HX - 14, HY - 6.5], [HX - 8, HY - 9]], col);
  if (s.hairStyle !== 'none' && s.species !== 'skel') {
    const p = P.part({ line: true });
    [[HX, 1], [HX + 2.8, 1.6], [HX + 5.3, .5]].forEach(([x, dy]) => P.poly([[x - 2, HY - 4.5], [x + 2, HY - 4.5], [x + 1.6, HY + dy - .8], [x + 1, HY + dy], [x - 1, HY + dy - 1.6]], s.hair, { hi: true, part: p, clip: open }));
  }
}

function helmet(P, metal, pal, HX, HY, closed) {
  const crest = pal.ha || pal.a || '#d22c3c';
  if (closed) {
    P.ell(HX, HY - .5, 8, 8.4, metal, { hi: true });
    P.ell(HX + 1.4, HY + 2.8, 6.4, 5.6, metal, { hi: true });
    P.poly([[HX - 2.5, HY + .8], [HX + 8, HY + .4], [HX + 8, HY + 2.6], [HX - 2.5, HY + 3]], '#0d0b12', { shade: 'flat', line: false });
    P.px(HX, HY + 1.8, pal.e || '#ff3344', 0, { tag: 'e' }); P.px(HX + 4.5, HY + 1.8, pal.e || '#ff3344', 1, { tag: 'e' });
    P.line(HX + 2, HY - 7.5, HX + 2, HY, metal, 0);
    P.path([[HX - 7, HY - 5], [HX - 2, HY - 9.5], [HX + 4.5, HY - 8]], 1.2, crest, { hi: true });
    return;
  }
  P.ell(HX - .3, HY - 2.3, 8.9, 7.6, metal, { hi: true, clip: (x, y) => y < HY - 1.8 + Math.max(0, HX - 3 - x) * 1.05 });
  P.poly([[HX - 6, HY - 3], [HX - 9.2, HY - 2], [HX - 9, HY + 4.5], [HX - 6.2, HY + 5]], metal, { hi: true });
  P.poly([[HX + 5.8, HY - 3], [HX + 8.6, HY - 2], [HX + 8.4, HY + 4], [HX + 7, HY + 4.4]], metal, { hi: true });
  P.poly([[HX - 8.2, HY - 2.8], [HX + 8.4, HY - 3.6], [HX + 8.4, HY - 2], [HX - 8.2, HY - 1.2]], pal.hy || pal.y || '#ffd34d', { hi: true });
  P.path([[HX - 7, HY - 5.5], [HX - 2.5, HY - 10], [HX + 3.5, HY - 9]], 1.2, crest, { hi: true });
}

function witchHat(P, col, band, HX, HY) {
  P.poly([[HX - 6.5, HY - 5.5], [HX + 6, HY - 6], [HX + 3.5, HY - 12], [HX + .5, HY - 16], [HX - 3.5, HY - 19.5], [HX - 8.5, HY - 21], [HX - 5.5, HY - 17], [HX - 5, HY - 11]], col, { hi: true, curve: .8 });
  P.poly([[HX - 6.4, HY - 8], [HX + 5.6, HY - 8.4], [HX + 6, HY - 6], [HX - 6.6, HY - 5.6]], band, { hi: true });
  P.ell(HX - .3, HY - 5.2, 12.5, 2.6, col, { curve: .9, hi: true });
  P.px(HX - 8.5, HY - 21, band, 0, { tag: 'g' });
}

function weapon(P, w, H, pal) {
  const metal = pal.w || '#d6dde6', wood = pal.k || '#6b4a2b', gold = pal.y || '#ffd34d', gem = pal.g || '#7fe7ff';
  if (w === 'sword') {
    P.cap(H.x + 1.3, H.y - 2.3, H.x + 7.5, H.y - 17.5, 1.25, metal, { r2: .7, hi: true });
    P.line(H.x + 2, H.y - 3.8, H.x + 6.7, H.y - 15.5, metal, 0, { line: false });
    P.cap(H.x - 2.2, H.y - 1, H.x + 4, H.y - 3.4, .95, gold, { hi: true });
    P.cap(H.x, H.y + 1, H.x - .9, H.y + 3.2, .9, wood);
    P.ell(H.x - 1.2, H.y + 3.9, 1.1, 1.1, gold, { hi: true });
  } else if (w === 'greatsword') {
    P.cap(H.x + 1.4, H.y - 3.5, H.x + 8.5, H.y - 27.5, 2.7, pal.x || '#9aa4b0', { r2: 1.9, hi: true });
    P.cap(H.x + 3.3, H.y - 4, H.x + 10.2, H.y - 26.8, .75, metal, { hi: true, line: false });
    P.cap(H.x - 3.8, H.y - .4, H.x + 6, H.y - 4.3, 1.4, wood, { hi: true });
    P.px(H.x + 1, H.y - 2.3, pal.g || '#ff3040', 1, { tag: 'g' });
    P.cap(H.x, H.y + 1, H.x - 1.3, H.y + 5.2, 1, wood);
  } else if (w === 'staff' || w === 'crossstaff') {
    P.cap(H.x + .9, H.y + 19, H.x + 1.4, H.y - 24, 1, wood);
    if (w === 'staff') {
      P.path([[H.x - .4, H.y - 23], [H.x - 2.4, H.y - 26.5], [H.x - 1.3, H.y - 30]], .8, gold, { hi: true });
      P.path([[H.x + 3.2, H.y - 23], [H.x + 5.1, H.y - 26.5], [H.x + 4, H.y - 30]], .8, gold, { hi: true });
      P.ell(H.x + 1.4, H.y - 27, 2.8, 2.8, gem, { hi: true, tag: 'g' });
    } else {
      P.cap(H.x + 1.4, H.y - 24, H.x + 1.4, H.y - 32.5, 1.1, gold, { hi: true });
      P.cap(H.x - 2.8, H.y - 28.5, H.x + 5.6, H.y - 28.5, 1.1, gold, { hi: true });
      P.ell(H.x + 1.4, H.y - 28.5, 1.35, 1.35, gem, { hi: true, tag: 'g', line: false });
    }
  } else if (w === 'spear') {
    P.cap(H.x - 2, H.y + 18, H.x + 4.5, H.y - 26, .95, wood);
    P.poly([[H.x + 3.6, H.y - 25], [H.x + 6.3, H.y - 24.4], [H.x + 6, H.y - 33], ], metal, { hi: true });
    P.cap(H.x + 2.5, H.y - 24.5, H.x + 7, H.y - 23.5, .8, gold, { hi: true });
  } else if (w === 'scythe') {
    P.cap(H.x - 2.6, H.y + 18, H.x + 3.6, H.y - 26, 1, wood);
    P.poly([[H.x + 4, H.y - 26.5], [H.x - 2.6, H.y - 29.5], [H.x - 11.5, H.y - 26.5], [H.x - 17.5, H.y - 18], [H.x - 10.5, H.y - 23], [H.x - 2.6, H.y - 25.2], [H.x + 3.2, H.y - 23.4]], metal, { hi: true });
  } else if (w === 'bow') {
    P.line(H.x - 2.6, H.y - 13.5, H.x - 2.6, H.y + 12.5, '#f2eee0', 1, { line: false });
    P.path([[H.x - 2.6, H.y - 14], [H.x, H.y - 8], [H.x + 1.4, H.y], [H.x, H.y + 7], [H.x - 2.6, H.y + 13]], 1.1, wood, { hi: true });
    P.ell(H.x - 2.6, H.y - 14, 1, 1, gold, { hi: true }); P.ell(H.x - 2.6, H.y + 13, 1, 1, gold, { hi: true });
  } else if (w === 'hammer') {
    P.cap(H.x - .4, H.y + 3.5, H.x + 4.6, H.y - 13, 1, wood);
    P.poly([[H.x + 1, H.y - 18.5], [H.x + 9.5, H.y - 16], [H.x + 8, H.y - 10.5], [H.x - .5, H.y - 13]], metal, { hi: true });
    P.poly([[H.x + 3.6, H.y - 17.8], [H.x + 5.4, H.y - 17.2], [H.x + 4, H.y - 11.6], [H.x + 2.2, H.y - 12.2]], gold, { hi: true, line: false });
  } else if (w === 'axe') {
    P.cap(H.x - .6, H.y + 5, H.x + 4.8, H.y - 17.5, 1, wood);
    P.poly([[H.x + 3.8, H.y - 17], [H.x + 10.5, H.y - 21], [H.x + 12.8, H.y - 15], [H.x + 10.8, H.y - 8.5], [H.x + 3.2, H.y - 11.5]], metal, { hi: true, curve: .7 });
    P.line(H.x + 11.2, H.y - 19, H.x + 12, H.y - 10, metal, 0, { line: false });
  } else if (w === 'bat') {
    P.cap(H.x + .4, H.y + 2.5, H.x + 7.2, H.y - 19, .85, metal, { r2: 1.9, hi: true });
    P.cap(H.x + 4.8, H.y - 11, H.x + 5.3, H.y - 12.8, 1.6, gold, { hi: true, line: false });
    P.cap(H.x + .2, H.y + 3, H.x + 1.6, H.y - 2.5, 1.05, wood, { hi: true });
  } else if (w === 'katana') {
    P.path([[H.x + 1.6, H.y - 2.6], [H.x + 5, H.y - 12], [H.x + 6.4, H.y - 18], [H.x + 6.6, H.y - 24]], .75, metal, { r2: .45, hi: true });
    P.ell(H.x + 1.1, H.y - 1.8, 1.7, 1.1, gold, { hi: true });
    P.cap(H.x + .4, H.y - .6, H.x - 1.4, H.y + 4.8, .9, wood, { hi: true });
  } else if (w === 'gun') {
    P.poly([[H.x - 1.4, H.y - 3.8], [H.x + 7.6, H.y - 3.8], [H.x + 7.6, H.y - 1.2], [H.x - 1.4, H.y - 1.2]], metal, { hi: true });
    P.poly([[H.x - 1.2, H.y - 1.4], [H.x + 1.8, H.y - 1.4], [H.x + 1.2, H.y + 2.6], [H.x - 1.6, H.y + 2.6]], wood, { hi: true });
    P.line(H.x + 2, H.y - 2.5, H.x + 6.8, H.y - 2.5, gem, 1, { tag: 'g' }); P.px(H.x + 7.8, H.y - 2.5, gem, 0, { tag: 'g' });
  } else if (w === 'rifle') {
    P.poly([[H.x - 5, H.y - 1], [H.x + 1, H.y - 3.6], [H.x + 1, H.y - .4], [H.x - 4.5, H.y + 2]], wood, { hi: true });
    P.poly([[H.x, H.y - 4.4], [H.x + 9, H.y - 5.8], [H.x + 9, H.y - 3.4], [H.x, H.y - 1.4]], metal, { hi: true });
    P.cap(H.x + 9, H.y - 4.7, H.x + 17, H.y - 6, .55, metal, { hi: true });
    P.rect(H.x + 2.5, H.y - 7.6, 5, 1.8, wood, { hi: true }); P.px(H.x + 7.6, H.y - 6.8, gem, 0, { tag: 'g' });
  } else if (w === 'club') {
    P.cap(H.x + .9, H.y - 1, H.x + 5.8, H.y - 10.5, 1.15, wood, { r2: 2.7, hi: true });
    [[H.x + 2.6, H.y - 9], [H.x + 7.6, H.y - 8], [H.x + 6.2, H.y - 13.2]].forEach(([x, y]) => P.px(x, y, '#d8d2c0', 1));
  }
}

function shield(P, H, pal) {
  const x = H.x + 1, y = H.y, sm = pal.sm || pal.w || '#c9d2dc', sa = pal.sa || pal.a || '#d22c3c';
  P.poly([[x - 5, y - 8.5], [x + 5, y - 8.5], [x + 6, y - 1], [x, y + 8.5], [x - 6, y - 1]], pal.sy || pal.y || '#ffd34d', { hi: true });
  P.poly([[x - 3.8, y - 7.3], [x + 3.8, y - 7.3], [x + 4.6, y - 1.1], [x, y + 6.4], [x - 4.6, y - 1.1]], sm, { hi: true, line: false });
  P.cap(x, y - 5.4, x, y + 3, .8, sa, { line: false, shade: 'flat', tone: 2 });
  P.cap(x - 2.9, y - 2.5, x + 2.9, y - 2.5, .8, sa, { line: false, shade: 'flat', tone: 2 });
}

/* feathered wings behind the shoulders: the near wing sweeps back-left, the far one peeks over the right shoulder */
function wings(P, col) {
  const far = [[CX + 1, 30], [CX + 5, 21], [CX + 12, 12.5], [CX + 12.5, 19], [CX + 15, 22.5], [CX + 9.5, 28]];
  P.poly(far, mix(col, '#000000', .25), { curve: .7 });
  const near = [[CX - 3, 31], [CX - 8, 22.5], [CX - 16, 15], [CX - 25, 11.5], [CX - 22.5, 18.5], [CX - 26, 22.5], [CX - 21.5, 27.5], [CX - 24, 33], [CX - 17.5, 36], [CX - 18, 41.5], [CX - 10, 39.5]];
  P.poly(near, col, { curve: .8, hi: true });
  [[[CX - 9, 27], [CX - 21, 20]], [[CX - 9, 31], [CX - 20, 29.5]], [[CX - 9, 35], [CX - 16, 38]]].forEach(([a, b]) => P.line(a[0], a[1], b[0], b[1], col, 3, { line: false }));
}
function topHat(P, col, band, HX, HY) {
  P.rect(HX - 5.5, HY - 17, 10.5, 11.5, col, { hi: true, curve: .8 });
  P.rect(HX - 5.5, HY - 9, 10.5, 2.2, band, { hi: true });
  P.ell(HX - .3, HY - 5.4, 10.5, 2.3, col, { curve: .9, hi: true });
}
function beret(P, col, feather, HX, HY) {
  P.path([[HX - 5, HY - 7.5], [HX - 10, HY - 12], [HX - 15, HY - 13.5]], 1.1, feather, { r2: .4, hi: true });
  P.ell(HX - 1.6, HY - 6.4, 9.6, 3.9, col, { hi: true, curve: .9 });
  P.ell(HX + .5, HY - 9.6, 1.2, 1.2, col, { hi: true });
}
/* a fan of three playing cards held in the front hand */
function cards(P, H, pal) {
  const face = pal.w || '#f4f0e6', ink = [pal.a || '#c0303f', '#1a1a1a', pal.a || '#c0303f'];
  [[-1.5, -6.5, -.5], [1.2, -7.5, 0], [3.8, -6.5, .5]].forEach(([dx, dy, sk], i) => {
    const x = H.x + dx, y = H.y + dy;
    P.poly([[x - 1.6 + sk, y - 2.6], [x + 1.6 + sk, y - 2.6], [x + 1.6 - sk, y + 2.6], [x - 1.6 - sk, y + 2.6]], face, { hi: true });
    P.px(x, y, ink[i], 1, { line: false });
  });
}
/* a round potion flask raised in the front hand */
function flask(P, H, liquid) {
  const x = H.x + 1.5, y = H.y - 4.8;
  P.cap(x, y - 2.8, x, y - 5, .8, '#d8e4ee', { hi: true });
  P.ell(x, y, 2.6, 2.6, '#d8e4ee', { hi: true });
  P.ell(x, y + .6, 2, 1.8, liquid, { hi: true, line: false, tag: 'g' });
}

/* ---------- modern wear: casual, hoodie, uniform, jacket, suit, tactical ---------- */
const MODERN = new Set(['casual', 'hoodie', 'uniform', 'jacket', 'suit', 'tactical']);
function modernTorso(P, s, outfit, T, { cloth, dark, acc, pants, belt }) {
  const pal = s.pal, shade = mix(cloth, '#000000', .3);
  const long = outfit === 'suit' || outfit === 'hoodie';
  P.poly([[CX - 6, 42.5], [CX + 7, 42.5], [CX + 7.3, 47.5], [CX - 6.3, 47.5]], pants);
  if (outfit === 'tactical') {
    P.poly(T, dark);
    P.poly([[CX - 5.4, 30.5], [CX + 6.4, 30.5], [CX + 7.2, 43.5], [CX - 6, 43.5]], cloth, { hi: true });
    [[CX - 4, 38], [CX - .2, 38], [CX + 3.6, 38]].forEach(([x, y]) => P.rect(x, y, 3, 3.2, shade, { hi: true }));
    P.rect(CX - 2.6, 32.2, 3, 2, acc, { hi: true, line: false });
    P.poly([[CX - 6.2, 43], [CX + 7.3, 43], [CX + 7.3, 44.8], [CX - 6.2, 44.8]], belt);
    return;
  }
  P.poly(long ? [...T.slice(0, 4), [CX + 7.4, 47], [CX - 6.6, 47], ...T.slice(6)] : T, cloth);
  if (outfit === 'casual') {
    P.ell(CX + 1.2, 29.9, 2.8, 1.3, shade, { line: false });
    P.rect(CX - 1, 33.5, 4, 3, acc, { hi: true, line: false });
    P.poly([[CX - 6, 43.5], [CX + 7, 43.5], [CX + 7, 44.8], [CX - 6, 44.8]], belt);
  } else if (outfit === 'hoodie') {
    P.poly([[CX - 3, 39], [CX + 5.6, 39], [CX + 6.3, 44], [CX - 3.6, 44]], shade, { line: false });
    [[CX + 1.3, 35.2], [CX + 3.7, 34.6]].forEach(([x, y]) => P.line(x, 30.5, x, y, acc, 2, { line: false }));
    P.line(CX - 6.4, 46.5, CX + 7.2, 46.5, shade, 2, { line: false });
  } else if (outfit === 'jacket') {
    P.poly([[CX + .5, 30], [CX + 3.8, 30], [CX + 3.4, 44.5], [CX + 1, 44.5]], dark, { line: false });
    P.line(CX + 3.9, 31, CX + 3.6, 44.5, acc, 1, { line: false });
    P.poly([[CX - 3.5, 28.5], [CX + 1, 29.5], [CX - 1.2, 34]], cloth, { hi: true });
    P.poly([[CX + 4, 29.5], [CX + 7.4, 28.5], [CX + 5.6, 34]], cloth, { hi: true });
    [[CX - 4.5, 31.5], [CX + 6.2, 31.5]].forEach(([x, y]) => P.px(x, y, acc, 0));
  } else {
    /* uniform / suit: blazer over a shirt (d) and tie (a) */
    P.poly([[CX - .6, 29.5], [CX + 4.4, 29.5], [CX + 1.9, 37]], dark, { line: false, hi: true });
    P.poly([[CX + 1.3, 30.2], [CX + 2.5, 30.2], [CX + 2.9, 35.5], [CX + 1.9, 37], [CX + .9, 35.5]], acc, { hi: true });
    P.line(CX - 1, 29.5, CX + 1.4, 37.5, shade, 2, { line: false }); P.line(CX + 4.8, 29.5, CX + 2.4, 37.5, shade, 2, { line: false });
    [39.5, 42].forEach(y => P.px(CX + 3, y, pal.y || '#d4af37', 1));
    if (outfit === 'uniform') P.rect(CX - 3.8, 33, 2.2, 2.2, pal.y || '#d4af37', { hi: true, line: false });
    else P.px(CX - 3.2, 33.5, acc, 0);
  }
}
function baseballCap(P, col, logo, HX, HY) {
  P.ell(HX - .5, HY - 3.4, 8.9, 6.8, col, { hi: true, clip: (x, y) => y < HY - 2 });
  P.poly([[HX + 3, HY - 3.6], [HX + 12.5, HY - 2.8], [HX + 12, HY - 1.4], [HX + 3, HY - 1.8]], col, { hi: true });
  P.px(HX + 2, HY - 6, logo, 1, { line: false });
}
function visorHelm(P, shell, glow, HX, HY) {
  P.ell(HX - .5, HY - 1.5, 9, 8.8, shell, { hi: true, clip: (x, y) => y < HY - .5 || x < HX - 3.5 });
  P.poly([[HX - 3.2, HY - .9], [HX + 8.8, HY - 1.6], [HX + 8.8, HY + 2.8], [HX - 3.2, HY + 3]], glow, { hi: true, tag: 'g' });
  P.line(HX - 7, HY + 2, HX - 4, HY + 2, mix(shell, '#000000', .35), 2, { line: false });
}
function glasses(P, frame, lens, HX, HY) {
  for (const [x0, x1] of [[HX - 5, HX], [HX + 2, HX + 6]]) {
    P.line(x0, HY, x1, HY, frame, 1); P.line(x0, HY + 4, x1, HY + 4, frame, 1);
    P.line(x0, HY, x0, HY + 4, frame, 1); P.line(x1, HY, x1, HY + 4, frame, 1);
    P.px(x0 + 1, HY + 1, lens, 0, { tag: 'g' });
  }
  P.line(HX, HY + 1, HX + 2, HY + 1, frame, 1); P.line(HX - 7, HY + 1, HX - 5, HY + 1, frame, 1);
}
function headset(P, band, light, HX, HY) {
  P.path([[HX - 6.5, HY - 1], [HX - 4, HY - 8.5], [HX + 1, HY - 10.2], [HX + 5.5, HY - 7.5]], .8, band, { hi: true });
  P.ell(HX - 5.8, HY + 1.4, 2.3, 2.7, band, { hi: true });
  P.path([[HX - 4.5, HY + 3.5], [HX - 1, HY + 6.5], [HX + 2, HY + 6.8]], .45, band);
  P.px(HX + 2.4, HY + 6.6, light, 0, { tag: 'g' }); P.px(HX - 5.8, HY + 1.2, light, 1, { tag: 'g' });
}
