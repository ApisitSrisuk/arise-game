import { S, ui, commit } from '../game/store.js';
import { GATES } from '../game/data.js';
import { HERO, STAR } from '../game/heroes.js';
import { rf, shade, hexA } from '../game/util.js';
import { glowOf, shSrc, myId } from '../game/rules.js';
import { getSprite, artKey } from '../art/sprites.js';
import { sfx } from '../audio/sound.js';

/* Battle stage: a lit dungeon backdrop, the player, hero party and shadow army on the left, the foe on the right.
   The engine queues events (emit) during a turn; play() replays them as timed animations + sounds. */
export const GC = { E: '#8aa3c2', D: '#4fd1c5', C: '#5fe08a', B: '#58a8ff', A: '#ffc85a', S: '#ff4f7b', X: '#b48cff', T: '#e05cff', R: '#c9d2dc' };
export const A = { cv: null, run: false, p: {}, e: {}, sh: {}, hr: {}, parts: [], nums: [], fx: [], motes: [], shake: 0, flash: 0, bg: null, bgKey: '' };

export function resetArena() { A.p = { lunge: 0, flash: 0, dead: 0, cx: 0, cy: 0 }; A.e = { ref: null }; A.sh = {}; A.hr = {}; A.parts = []; A.nums = []; A.fx = []; A.shake = 0; A.flash = 0; }
export function attachArena(cv) { A.cv = cv; if (!A.run) { A.run = true; requestAnimationFrame(loop); } }
export function detachArena(cv) { if (A.cv === cv) A.cv = null; }
function loop(now) { if (!A.cv || !A.cv.isConnected || !S || !S.run) { A.run = false; return; } drawArena(now); requestAnimationFrame(loop); }

export function burst(p, col, n, up) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = rf(1, 4); A.parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: up ? -rf(1, 3) : Math.sin(a) * s - 1, g: up ? -.02 : .12, life: 1, dec: rf(.02, .04), col, sz: rf(2, 5) }); } }
function num(p, text, col, big) { A.nums.push({ x: p.x + rf(-12, 12), y: p.y - 10, text: String(text), col, big, t: performance.now() }); }
export function addFx(t, p, col, big, dir = 1) { A.fx.push({ t, x: p.x, y: p.y, col, big, dir, s: performance.now(), rot: rf(-.5, .5) }); }
const seeded = seed => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

function buildBg(W, H, rank, dpr) {
  const c = document.createElement('canvas'); c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); const x = c.getContext('2d'); x.scale(dpr, dpr);
  const gc = GC[rank], hz = Math.round(H * .46), rr = seeded(rank.charCodeAt(0) * 7919 + W);
  const wg = x.createLinearGradient(0, 0, 0, hz); wg.addColorStop(0, '#04060c'); wg.addColorStop(1, '#101a30'); x.fillStyle = wg; x.fillRect(0, 0, W, hz);
  const bh = Math.max(10, Math.round(H / 20)), bw = Math.round(bh * 2.4);
  for (let row = 0, y = 0; y < hz; row++, y += bh) for (let xx = -(row % 2) * bw / 2; xx < W; xx += bw) {
    const l = .7 + rr() * .5, depth = .45 + .55 * y / hz; x.fillStyle = shade('#1c2742', l * depth); x.fillRect(Math.round(xx) + 1, y + 1, bw - 2, bh - 2);
    x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(Math.round(xx) + 1, y + 1, bw - 2, 1); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(Math.round(xx) + 1, y + bh - 2, bw - 2, 1);
    if (rr() < .07) { x.fillStyle = hexA(gc, .09); x.fillRect(Math.round(xx) + 1, y + 1, bw - 2, bh - 2); }
    if (rr() < .05) { x.strokeStyle = 'rgba(0,0,0,.5)'; x.beginPath(); x.moveTo(xx + bw * .3, y + 2); x.lineTo(xx + bw * .45, y + bh * .5); x.lineTo(xx + bw * .38, y + bh - 2); x.stroke(); }
  }
  const TW = Math.max(56, Math.round(W / 11)), TH = TW / 2;
  x.save(); x.beginPath(); x.rect(0, hz, W, H - hz); x.clip();
  x.fillStyle = '#0a1120'; x.fillRect(0, hz, W, H - hz);
  for (let j = 0; j * TH / 2 < H - hz + TH; j++) for (let i = -1; i * TW < W + TW; i++) {
    const cx = i * TW + (j % 2 ? TW / 2 : 0), cy = hz + j * TH / 2;
    x.beginPath(); x.moveTo(cx, cy - TH / 2 + 1); x.lineTo(cx + TW / 2 - 1, cy); x.lineTo(cx, cy + TH / 2 - 1); x.lineTo(cx - TW / 2 + 1, cy); x.closePath();
    x.fillStyle = shade('#142038', .75 + rr() * .4); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.05)'; x.beginPath(); x.moveTo(cx - TW / 2 + 2, cy); x.lineTo(cx, cy - TH / 2 + 2); x.lineTo(cx + TW / 2 - 2, cy); x.stroke();
    if (rr() < .05) { x.strokeStyle = hexA(gc, .12); x.beginPath(); x.moveTo(cx - TW / 2 + 1, cy); x.lineTo(cx, cy - TH / 2 + 1); x.lineTo(cx + TW / 2 - 1, cy); x.lineTo(cx, cy + TH / 2 - 1); x.closePath(); x.stroke(); }
  }
  const fg = x.createLinearGradient(0, hz, 0, H); fg.addColorStop(0, 'rgba(3,5,11,.85)'); fg.addColorStop(.35, 'rgba(3,5,11,.25)'); fg.addColorStop(1, 'rgba(3,5,11,.1)'); x.fillStyle = fg; x.fillRect(0, hz, W, H - hz);
  x.restore();
  x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, hz - 3, W, 4); x.fillStyle = hexA(gc, .3); x.fillRect(0, hz + 1, W, 1);
  for (const px0 of [W * .035, W * .965]) {
    const pw = Math.max(26, W * .05), l = px0 - pw / 2, bot = hz + H * .05;
    const pg = x.createLinearGradient(l, 0, l + pw, 0); pg.addColorStop(0, '#28324a'); pg.addColorStop(.35, '#1a2236'); pg.addColorStop(1, '#0a0f1b');
    x.fillStyle = pg; x.fillRect(l, 0, pw, bot); x.fillStyle = '#2f3a55'; x.fillRect(l - 4, bot - 8, pw + 8, 8); x.fillRect(l - 4, 14, pw + 8, 6);
    x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.ellipse(px0 + 6, bot + 2, pw * .9, 6, 0, 0, Math.PI * 2); x.fill();
    for (let y = 30; y < bot - 12; y += bh * 1.5) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(l, y, pw, 1); }
  }
  return c;
}
function drawTorch(x, tx, ty, H, fl, now) {
  x.fillStyle = '#2a2f38'; x.fillRect(tx - 3, ty, 6, 14); x.fillStyle = '#3d4452'; x.fillRect(tx - 6, ty - 2, 12, 4);
  const s = Math.max(3, Math.round(H / 90)), wob = Math.sin(now / 70) * s * .6;
  x.fillStyle = '#ff6a1a'; x.fillRect(tx - 2 * s + wob * .3, ty - 5 * s, 4 * s, 4 * s); x.fillRect(tx - s + wob * .6, ty - 7 * s, 2 * s, 2 * s);
  x.fillStyle = '#ffb020'; x.fillRect(tx - s * 1.5 + wob * .3, ty - 4 * s, 3 * s, 3 * s); x.fillStyle = '#fff3b0'; x.fillRect(tx - s * .5 + wob * .2, ty - 3 * s, s, 2 * s);
  x.save(); x.globalCompositeOperation = 'lighter';
  const r = H * .36 * fl, g = x.createRadialGradient(tx, ty - 3 * s, 2, tx, ty - 3 * s, r); g.addColorStop(0, 'rgba(255,150,60,.32)'); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(tx - r, ty - 3 * s - r, r * 2, r * 2);
  x.restore();
}
function drawPortal(x, cx, cy, H, gc, now) {
  const rx = H * .16, ry = H * .25;
  x.save(); x.globalCompositeOperation = 'lighter';
  const g = x.createRadialGradient(cx, cy, 4, cx, cy, H * .5); g.addColorStop(0, hexA(gc, .32)); g.addColorStop(1, hexA(gc, 0)); x.fillStyle = g; x.fillRect(cx - H * .5, cy - H * .5, H, H);
  x.restore();
  x.save(); x.translate(cx, cy); x.scale(1, ry / rx);
  const ig = x.createRadialGradient(0, 0, 2, 0, 0, rx); ig.addColorStop(0, hexA(gc, .55)); ig.addColorStop(.55, 'rgba(10,6,24,.9)'); ig.addColorStop(1, 'rgba(3,4,10,.95)');
  x.fillStyle = ig; x.beginPath(); x.arc(0, 0, rx, 0, Math.PI * 2); x.fill();
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) { x.save(); x.rotate(now / 1400 + i * 1.26); x.strokeStyle = hexA(gc, .28); x.lineWidth = 2; x.beginPath(); x.arc(0, 0, rx * (.3 + i * .13), 0, Math.PI * .9); x.stroke(); x.restore(); }
  x.lineWidth = 3; x.strokeStyle = hexA(gc, .95); x.beginPath(); x.arc(0, 0, rx, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 10; x.strokeStyle = hexA(gc, .18); x.beginPath(); x.arc(0, 0, rx + 3, 0, Math.PI * 2); x.stroke();
  x.save(); x.rotate(-now / 2600); x.setLineDash([4, 10]); x.lineWidth = 2; x.strokeStyle = hexA(gc, .6); x.beginPath(); x.arc(0, 0, rx * 1.18, 0, Math.PI * 2); x.stroke(); x.restore();
  x.restore();
  x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = gc;
  for (let i = 0; i < 16; i++) { const t = (now / 1700 + i / 16) % 1, a = i * 2.4 + now / 900, rad = 1.7 - t * 1.5; x.globalAlpha = t * .9; x.fillRect(cx + Math.cos(a) * rx * rad, cy + Math.sin(a) * ry * rad, 2, 2); }
  x.restore();
}
/* draws a sprite with its feet at (fx, fy), scaled by sc with crisp pixels */
function ent(x, img, sc, fx, fy, alpha, ox, oy, glow) {
  const w = img.width * sc, h = img.height * sc;
  x.save(); x.globalAlpha = alpha * .5; x.fillStyle = '#000'; x.beginPath(); x.ellipse(fx + ox, fy, w * .26, Math.max(4, h * .045), 0, 0, Math.PI * 2); x.fill();
  x.globalAlpha = alpha; if (glow) { x.shadowColor = glow; x.shadowBlur = 14; }
  x.imageSmoothingEnabled = false;
  x.drawImage(img, Math.round(fx - w / 2 + ox), Math.round(fy - h + oy + sc * 2), Math.round(w), Math.round(h)); x.restore();
  return { w, h };
}
const heroSpot = (i, W, H) => [[W * .17, H * .8], [W * .12, H * .95], [W * .07, H * .78], [W * .04, H * .93]][i];
const shadowSpot = (i, W, H) => [W * .05 + (i % 4) * W * .055, H * .66 + Math.floor(i / 4) * H * .05 + (i % 2) * 4];

function drawArena(now) {
  const cv = A.cv, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.imageSmoothingEnabled = false;
  const r = S.run, g = GATES[r.g], gc = GC[g.r], hz = Math.round(H * .46);
  const key = `${W}x${H}${g.r}${dpr}`; if (A.bgKey !== key) { A.bg = buildBg(W, H, g.r, dpr); A.bgKey = key; }
  x.save(); if (now - A.shake < 280) x.translate(rf(-5, 5), rf(-3, 3));
  x.drawImage(A.bg, 0, 0, W, H);
  const fl = .88 + .08 * Math.sin(now / 90) + .05 * Math.sin(now / 37);
  drawTorch(x, W * .2, hz * .5, H, fl, now); drawTorch(x, W * .5, hz * .5, H, fl * .97, now + 300);
  x.save(); x.globalCompositeOperation = 'lighter';
  for (const tx of [W * .2, W * .5]) { const lg = x.createRadialGradient(tx, hz + H * .1, 2, tx, hz + H * .1, W * .16); lg.addColorStop(0, `rgba(255,140,60,${.12 * fl})`); lg.addColorStop(1, 'rgba(255,140,60,0)'); x.fillStyle = lg; x.fillRect(tx - W * .16, hz, W * .32, H * .3); }
  x.restore();
  drawPortal(x, W * .76, hz - H * .06, H, gc, now);
  if (A.motes.length < 30) A.motes.push({ x: Math.random() * W, y: H * rf(.2, 1), v: rf(.15, .5), s: rf(1, 2.5) });
  x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = gc; A.motes.forEach(m => { m.y -= m.v; m.x += Math.sin(now / 900 + m.y * .05) * .2; if (m.y < 0) { m.y = H; m.x = Math.random() * W; } x.globalAlpha = .25 + .25 * Math.sin(now / 500 + m.x); x.fillRect(m.x, m.y, m.s, m.s); }); x.restore();

  const sc = Math.max(1, Math.round(H / 150));
  /* shadow soldiers (back row) */
  S.shadows.forEach((sh, i) => {
    const [sx, sy] = shadowSpot(i, W, H), img = getSprite('mob', shSrc(sh), 'shadow', false);
    const dl = now - (A.sh[i] || 0), off = dl < 240 ? Math.sin(Math.PI * dl / 240) * W * .22 : 0;
    ent(x, img, Math.max(1, sc - 1), sx, sy, .9, off, Math.sin(now / 420 + i) * 2, '#7a4fd6');
  });
  /* hero party */
  S.party.forEach((id, i) => {
    const [hx, hy] = heroSpot(i, W, H), st = A.hr[i] || {}, img = getSprite('hero', id, now - (st.flash || 0) < 110 ? 'flash' : 'n', false);
    const dl = now - (st.lunge || 0), off = dl < 240 ? Math.sin(Math.PI * dl / 240) * W * .2 : 0;
    const d = ent(x, img, sc, hx, hy, 1, off, Math.sin(now / 460 + i * 1.7) * 1.5, HERO[id].star >= 5 ? STAR[5].col : null);
    A.hr[i] = { ...st, cx: hx, cy: hy - d.h * .6 };
  });
  /* foe */
  const eX = W * .74, eY = H * .84;
  if (r.state === 'room' && r.obj) { const img = getSprite('obj', r.obj, 'n', false), d = ent(x, img, sc + 1, eX, eY, 1, 0, Math.sin(now / 600) * 2, r.obj === 'spring' ? '#5fe8ff' : '#ffd34d'); A.e.cx = eX; A.e.cy = eY - d.h * .5; }
  const e = r.enemy;
  if (e) {
    if (A.e.ref !== e) A.e = { ref: e, spawn: now, flash: 0, lunge: 0, dead: 0, cx: eX, cy: eY - 40 };
    let alpha = 1, oy = 0; const ds = now - A.e.spawn; if (ds < 450) { alpha = ds / 450; oy = (1 - alpha) * 18; }
    if (A.e.dead) { const dd = now - A.e.dead; alpha = Math.max(0, 1 - dd / 650); oy = dd / 650 * 9; }
    if (alpha > 0 && (e.hp > 0 || A.e.dead)) {
      const esc = e.boss ? sc + 1 : e.elite ? sc * 1.25 : sc;
      const v = now - A.e.flash < 110 ? 'flash' : (r.stop > 0 ? 'gray' : 'n');
      const img = getSprite('mob', artKey(e.name), v, true);
      const dl = now - A.e.lunge, off = dl < 260 ? -Math.sin(Math.PI * dl / 260) * W * .16 : 0, kb = now - A.e.flash < 200 ? 9 * (1 - (now - A.e.flash) / 200) : 0;
      if (e.boss || e.elite) { x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = (.4 + .15 * Math.sin(now / 250)) * alpha; const w = img.width * esc, ag = x.createRadialGradient(eX, eY, 2, eX, eY, w * .5); ag.addColorStop(0, e.boss ? 'rgba(255,60,90,.6)' : 'rgba(255,200,90,.5)'); ag.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = ag; x.beginPath(); x.ellipse(eX, eY, w * .5, 12, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
      const d = ent(x, img, esc, eX, eY, alpha, off + kb, oy + Math.sin(now / 500) * 1.5, null);
      A.e.cx = eX; A.e.cy = eY - d.h * .55;
      if (e.burn > 0 && e.hp > 0 && Math.random() < .3) A.parts.push({ x: eX + rf(-d.w * .2, d.w * .2), y: eY - rf(0, d.h * .8), vx: 0, vy: -rf(.5, 1.5), g: -.01, life: 1, dec: .03, col: '#ff8a3d', sz: 3 });
    }
  }
  /* player */
  {
    const pX = W * .3, pY = H * .9, gl = glowOf(), img = getSprite('me', myId(), now - A.p.flash < 110 ? 'flash' : 'n', false);
    const dl = now - A.p.lunge, off = dl < 260 ? Math.sin(Math.PI * dl / 260) * W * .18 : 0, kb = now - A.p.flash < 200 ? -9 * (1 - (now - A.p.flash) / 200) : 0;
    const w = img.width * sc, h = img.height * sc;
    x.save(); x.globalCompositeOperation = 'lighter'; const ag = x.createRadialGradient(pX + off, pY, 2, pX + off, pY, w * .5); ag.addColorStop(0, hexA(gl, S.awake ? .45 : .22)); ag.addColorStop(1, hexA(gl, 0)); x.fillStyle = ag; x.beginPath(); x.ellipse(pX + off, pY, w * .5, 12, 0, 0, Math.PI * 2); x.fill(); x.restore();
    ent(x, img, sc, pX, pY, A.p.dead ? Math.max(.25, 1 - (now - A.p.dead) / 600) : 1, off + kb, Math.sin(now / 380) * 1.5, S.awake ? gl : null);
    A.p.cx = pX; A.p.cy = pY - h * .55;
    if (S.awake && Math.random() < .35) A.parts.push({ x: pX + rf(-w * .2, w * .2), y: pY - rf(0, h * .9), vx: 0, vy: -rf(.4, 1.2), g: -.005, life: 1, dec: .025, col: gl, sz: 2 });
    if (r.guard > 0) { x.save(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = '#58c4ff'; x.globalAlpha = .5 + .2 * Math.sin(now / 200); x.lineWidth = 2; x.beginPath(); x.ellipse(pX, pY - h * .45, w * .35, h * .6, 0, 0, Math.PI * 2); x.stroke(); x.globalAlpha = .12; x.fillStyle = '#58c4ff'; x.fill(); x.restore(); }
  }
  A.fx = A.fx.filter(f => now - f.s < 320);
  x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
  A.fx.forEach(f => {
    const k = (now - f.s) / 320; x.globalAlpha = 1 - k; x.strokeStyle = f.col;
    if (f.t === 'slash') { x.save(); x.translate(f.x, f.y); x.rotate(f.rot + (f.dir < 0 ? Math.PI : 0)); const R = f.big ? H * .2 : H * .14; x.lineWidth = (f.big ? 10 : 6) * (1 - k) + 1; x.beginPath(); x.arc(0, 0, R, -1.3 + k * .6, -1.3 + k * .6 + Math.min(2.4, k * 7)); x.stroke(); x.lineWidth = 2; x.strokeStyle = '#ffffff'; x.beginPath(); x.arc(0, 0, R * .96, -1.2 + k * .6, -1.2 + k * .6 + Math.min(2, k * 6)); x.stroke(); x.restore(); }
    else { x.lineWidth = 4 * (1 - k) + 1; x.beginPath(); x.ellipse(f.x, f.y, (f.big ? H * .35 : H * .2) * k + 6, ((f.big ? H * .35 : H * .2) * k + 6) * .45, 0, 0, Math.PI * 2); x.stroke(); }
  });
  x.restore();
  const vg = x.createRadialGradient(W / 2, H * .55, H * .35, W / 2, H * .55, W * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); x.fillStyle = vg; x.fillRect(-6, -6, W + 12, H + 12);
  A.parts = A.parts.filter(p => p.life > 0); x.save(); x.globalCompositeOperation = 'lighter';
  A.parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= p.dec; x.globalAlpha = Math.max(0, p.life); x.fillStyle = p.col; x.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz); }); x.restore();
  A.nums = A.nums.filter(n => now - n.t < 950); x.textAlign = 'center';
  A.nums.forEach(n => { const k = (now - n.t) / 950, yy = n.y - k * 44; x.globalAlpha = 1 - k * k; x.font = `700 ${n.big ? 26 : 18}px "Chakra Petch",sans-serif`; x.lineWidth = 4; x.strokeStyle = '#02050c'; x.strokeText(n.text, n.x, yy); x.fillStyle = n.col; x.fillText(n.text, n.x, yy); });
  x.globalAlpha = 1;
  if (now - A.flash < 90) { x.fillStyle = `rgba(255,255,255,${.22 * (1 - (now - A.flash) / 90)})`; x.fillRect(-6, -6, W + 12, H + 12); }
  x.restore();
}

/* ---------- turn playback ---------- */
let EV = [];
export const emit = o => EV.push(o);
function play(ev, done) {
  let t = 0, ph = false; const now = () => performance.now(), P = () => ({ x: A.p.cx, y: A.p.cy }), E = () => ({ x: A.e.cx, y: A.e.cy });
  const Hp = i => ({ x: (A.hr[i] || {}).cx || A.p.cx, y: (A.hr[i] || {}).cy || A.p.cy });
  const at = f => setTimeout(f, t), enemyPhase = () => { if (!ph) { ph = true; t += 200; } };
  for (const v of ev) switch (v.t) {
    case 'patk': at(() => { A.p.lunge = now(); sfx('swing'); }); t += 120; break;
    case 'skill': at(() => { addFx('ring', P(), v.col, true); burst(P(), v.col, 18, true); num(P(), v.name, v.col); sfx('skill'); }); t += 230; break;
    case 'dmg': if (v.v === 0) { at(() => { num(E(), 'กันได้', '#7fe7ff'); sfx('freeze'); }); t += 140; break; } at(() => { A.e.flash = now(); addFx('slash', E(), v.crit ? '#ffc85a' : (v.col || '#bfe9ff'), v.crit, 1); if (v.crit) A.flash = now(); num(E(), v.v, v.crit ? '#ffc85a' : (v.col || '#ffffff'), v.crit); burst(E(), v.col || '#ffffff', v.crit ? 14 : 7); sfx(v.crit ? 'crit' : 'hit'); }); t += 160; break;
    case 'sdmg': { const i = v.i; at(() => { A.sh[i] = now(); }); t += 110; at(() => { A.e.flash = now(); addFx('slash', E(), '#a37bff', false, 1); num(E(), v.v, '#c9a6ff'); burst(E(), '#a37bff', 6); sfx('shadow'); }); t += 60; break; }
    case 'hdmg': { const i = v.i; at(() => { A.hr[i] = { ...(A.hr[i] || {}), lunge: now() }; }); t += 110; at(() => { A.e.flash = now(); addFx('slash', E(), v.col, v.crit, 1); num(E(), v.v, v.crit ? '#ffc85a' : v.col, v.crit); burst(E(), v.col, 6); sfx(v.crit ? 'crit' : 'hit'); }); t += 90; break; }
    case 'hheal': { const i = v.i; at(() => { addFx('ring', Hp(i), '#4fdc9b', false); num(P(), '+' + v.v, '#4fdc9b'); burst(P(), '#4fdc9b', 8, true); sfx('heal'); }); t += 140; break; }
    case 'hidle': { const i = v.i; at(() => num(Hp(i), v.text, '#9fb4cf')); t += 120; break; }
    case 'heal': at(() => { addFx('ring', P(), '#4fdc9b', false); num(P(), '+' + v.v, '#4fdc9b'); burst(P(), '#4fdc9b', 10, true); sfx('heal'); }); t += 150; break;
    case 'pself': at(() => { A.p.flash = now(); num(P(), '-' + v.v, '#ff5470'); sfx('hurt'); }); t += 150; break;
    case 'kill': at(() => { A.e.dead = now(); addFx('ring', E(), '#ffffff', true); burst(E(), '#ffffff', 26); sfx('kill'); }); t += 320; break;
    case 'burn': enemyPhase(); at(() => { A.e.flash = now(); num(E(), v.v, '#ff8a3d'); burst(E(), '#ff8a3d', 10, true); sfx('burn'); }); t += 180; break;
    case 'frozen': enemyPhase(); at(() => { num(E(), 'หยุดนิ่ง', '#7fe7ff'); addFx('ring', E(), '#7fe7ff', false); sfx('freeze'); }); t += 260; break;
    case 'extra': at(() => { num(P(), 'เล่นต่อ!', '#7fe7ff', true); addFx('ring', P(), '#7fe7ff', true); sfx('extra'); }); t += 260; break;
    case 'eatk': enemyPhase(); at(() => { A.e.lunge = now(); sfx(v.heavy ? 'heavy' : 'eswing'); if (v.heavy) { A.shake = now(); burst(E(), '#ff5470', 18); } }); t += 130; break;
    case 'pdmg': at(() => { A.p.flash = now(); addFx('slash', P(), '#ff5470', v.heavy, -1); num(P(), '-' + v.v, '#ff5470', v.heavy); sfx('hurt'); if (v.heavy) A.shake = now(); }); t += 200; break;
    case 'miss': at(() => { num(P(), 'MISS', '#7fe7ff'); sfx('miss'); }); t += 180; break;
    case 'undying': at(() => { num(P(), 'ไม่ยอมตาย!', '#5ff2ff', true); addFx('ring', P(), '#5ff2ff', true); burst(P(), '#5ff2ff', 24, true); sfx('awaken'); }); t += 320; break;
    case 'pdie': at(() => { A.p.dead = now(); sfx('death'); }); t += 500; break;
    case 'eheal': at(() => { num(E(), '+' + v.v, '#7dffb0'); burst(E(), '#7dffb0', 8, true); sfx('heal'); }); t += 150; break;
    case 'poison': at(() => { A.p.flash = now(); num(P(), '-' + v.v, '#c47bff'); burst(P(), '#c47bff', 8, true); sfx('burn'); }); t += 150; break;
    case 'emiss': at(() => { num(E(), 'MISS', '#c9d2dc'); sfx('miss'); }); t += 150; break;
    case 'phase': at(() => { A.shake = now(); A.flash = now(); addFx('ring', E(), '#ff3355', true); burst(E(), '#ff3355', 30, true); num(E(), v.name, '#ff5470', true); sfx('heavy'); }); t += 420; break;
  }
  setTimeout(done, t + 80);
}
export function runAnim(after) {
  ui.busy = true; const ev = EV; EV = [];
  const fin = () => { ui.busy = false; commit(); after && after(); };
  commit();
  if (!A.cv || !A.cv.isConnected || !ev.length) return fin();
  play(ev, fin);
}
