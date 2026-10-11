/* Simulator core shared by sim.mjs (reports) and tune.mjs (curve tuning): loads the real game engine
   headlessly, builds characters at a level, and plays gates with a bot.
   Random is seeded (reseed) so the same command gives the same numbers. */
import { register } from 'node:module';
register('./loader.mjs', import.meta.url);

let seed = 1;
Math.random = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const reseed = s => { seed = (s | 0) || 1; };

export const store = await import('../../src/game/store.js');
export const E = await import('../../src/game/engine.js');
export const D = await import('../../src/game/data.js');
export const R = await import('../../src/game/rules.js');
export const MO = await import('../../src/game/monsters.js');
const DU = await import('../../src/game/dungeon.js');
const { ITEMS } = await import('../../src/game/items.js');
const { SUBCLASSES, SUB_LV } = await import('../../src/game/subclass.js');
export const S = () => store.S;
const pickR = a => a[Math.floor(Math.random() * a.length)];

export const parseArgs = argv => Object.fromEntries(argv.join(' ').split('--').filter(Boolean).map(s => { const [k, ...v] = s.trim().split(/\s+/); return [k, v.join(' ') || true]; }));

/* ---------------- character model ----------------
   points: 5 per level + OPT.daily per in-game day (daily quest); days grow roughly with level².
   gear: shop = best item at or below the level in every slot, mid = best at or below 70% of the level, none = starter gear. */
const days = L => Math.round(L * L / 30);
export const OPT = { gear: 'mid', daily: 3 };
const SPLIT = { main: .6, vit: .25, per: .1, agi: .05 };
const gearScore = i => (i.st.atk || 0) * 3 + (i.st.def || 0) * 2 + (i.st.hp || 0) * .2 + i.p / 400;

export function build(cid, L, o = {}) {
  store.setS(E.newState('Sim', { hair: 0, hc: 0, skin: 0, eye: 0 }, o.origin || 'student'));
  const s = S(); s.lv = L;
  E.finishRoll(cid, true);
  while (s.picks > 0) { if (!s.pickOpts) E.openPick(); if (s.pickOpts) E.H.choose(choosePick(s.pickOpts)); }
  const c = R.cls(), pts = (L - 1) * 5 + OPT.daily * days(L) + s.pts; s.pts = 0;
  const share = { ...SPLIT }; if (c.main !== 'vit') share[c.main] = (share[c.main] || 0) + share.main; else share.vit += share.main; delete share.main;
  let left = pts; for (const [k, f] of Object.entries(share)) { const n = Math.floor(pts * f); s.alloc[k] += n; left -= n; } s.alloc[c.main] += left;
  if (L >= SUB_LV) s.sub = { id: pickR(SUBCLASSES).id, g: D.rollGrade() };
  if (o.awake) { s.awake = true; s.awPath = 'pure'; }
  const cap = OPT.gear === 'shop' ? L : OPT.gear === 'mid' ? Math.max(1, Math.floor(L * .7)) : 0;
  if (cap) for (const slot of Object.keys(s.eq)) {
    const best = ITEMS.filter(i => i.slot === slot && i.lv <= cap).sort((a, b) => gearScore(b) - gearScore(a))[0];
    if (best) { s.eq[slot] = best.id; if (!s.inv.includes(best.id)) s.inv.push(best.id); }
  }
  s.hrank = R.rank(); /* official rank as if every exam was passed on time */
  s.xp = -1e15; /* no level-ups mid-run: a data point measures one level */
  s.hp = R.maxHp(); s.mp = R.maxMp(); s.sta = R.maxSta(); s.pot = o.pot ?? 4; s.mpot = o.mpot ?? 2;
  store.ui.modal = null;
}
/* skill picks: fill active slots first, then passives, then grade-ups */
function choosePick(opts) {
  const s = S(), rank = o => o.k === 'act' && s.act.length < 4 ? 3 : o.k === 'pas' ? 2 : o.k === 'act' ? 1 : 0;
  return opts.reduce((bi, o, i) => rank(o) > rank(opts[bi]) || (rank(o) === rank(opts[bi]) && D.GORDER.indexOf(o.g) > D.GORDER.indexOf(opts[bi].g)) ? i : bi, 0);
}

/* ---------------- bot ---------------- */
function skillOf(ref) {
  const s = S();
  if (ref === 'u') return s.awake ? { id: R.ultId(), g: 'C' } : null;
  if (ref === 's') return s.sub ? { id: 'sub_' + s.sub.id, g: s.sub.g } : null;
  return s.act[+ref] || null;
}
/* a hit on a pack can fell at most one body, so its value is capped at one body's HP */
const capHit = (e, v, a) => e.pack ? Math.min(v, e.max / e.pack / a) : v;
/* value of a skill in "basic attacks" for this turn */
function score(f, q, ctx) {
  const { e, r, hpR, heavyNext } = ctx, amp = 1 + R.skillPow() / 100, a = R.atk();
  const tm = (MO.hasTr(e, 'ward') || e.ph === 'ward' ? .6 : 1) * (MO.weakHit(e, f) ? MO.WEAK_MUL : 1) * (MO.hasTr(e, 'armored') && f.pierce ? 1.6 : 1);
  let v = 0;
  if (f.m) v += (f.hits || 1) * capHit(e, f.m * q * amp * tm * (f.exec && e.hp / e.max < .3 ? 3 : 1), a) + (f.statb ? R.stat(f.statb) * 2.5 / a : 0);
  if (f.missing) v += (R.maxHp() - S().hp) * f.missing * q / a;
  if (f.army) v += S().shadows.length ? f.army * q * amp * S().shadows.length * .5 : 1.6 * q * amp;
  if (f.burn && !e.burn) v += Math.min(f.burn, 4) * e.max * (e.boss ? .03 : .05) / a;
  if (f.stun && !r.stop) v += heavyNext ? 2.5 : .5 * f.stun;
  if ((f.guard || f.evade) && heavyNext) v += 2;
  if (f.weak && !e.weak) v += e.boss ? .8 : .2;
  if (f.heal && hpR < .6) v += f.heal * q * 5;
  if (f.heal && r.poison) v += 1;
  if (f.buff && !(r.buff && r.buff.t > 0) && e.hp > a * 4) v += f.buff * q * 3;
  if (f.drain && hpR < .6) v += f.drain;
  if (f.hpcost && hpR < .4) v -= 3;
  return v;
}
let drunk = 0;
export function botTurn() {
  const s = S(), r = s.run, e = r.enemy, hpR = s.hp / R.maxHp();
  if (hpR < .35 && s.pot > 0) { drunk++; return E.act('pot'); }
  const ctx = { e, r, hpR, heavyNext: e.boss && (e.turn + 1) % (e.heavyEvery || 3) === 0 && !r.stop };
  /* save MP on small fights: a skill must clearly beat a basic attack */
  const basic = capHit(e, 1, R.atk()) * (1 + R.pv('extrahit') / 100 + R.pv('double') / 100 * .7) * (MO.hasTr(e, 'evasive') ? .65 : 1) * (MO.hasTr(e, 'armored') ? .6 : 1);
  let best = null, bar = basic * (e.boss || e.elite ? 1 : 1.3);
  if (R.fatigue() < 2) for (const ref of ['0', '1', '2', '3', 's', 'u']) {
    const sk = skillOf(ref); if (!sk || (ref === 'u' && r.ucd > 0)) continue; const d = D.ACT[sk.id]; if (!d || s.mp < R.mpCost(d)) continue;
    const v = score(d.fx, D.GR[sk.g].m, ctx); if (v > bar) { bar = v; best = ref; }
  }
  if (best != null) return E.act('skill:' + best);
  if (e.boss && s.mpot > 0 && s.mp < R.maxMp() * .2 && e.hp > e.max * .3) return E.act('mpot');
  return E.act('atk');
}
/* doors: rest when hurt, an elite when healthy, otherwise the first door that isn't an elite */
function pickDoor(doors) {
  const hpR = S().hp / R.maxHp(), want = hpR < .5 ? 'rest' : hpR > .8 ? 'elite' : null;
  const i = doors.indexOf(want); return i >= 0 ? i : Math.max(0, doors.findIndex(k => k !== 'elite'));
}
/* events: take the useful option when it's affordable and safe enough, else walk past (always the last option) */
function pickEvent(ev) {
  const s = S(), hpR = s.hp / R.maxHp(), last = ev.opts.length - 1, ok = i => ev.opts[i].ok;
  if (ev.id === 'merchant' && ok(0) && s.pot < 3) return 0;
  if (ev.id === 'shrine' && ok(0) && hpR < .5) return 0;
  if (ev.id === 'altar' && hpR > .7) return 0;
  if (ev.id === 'hunter' && ok(0) && s.pot >= 3) return 0;
  if (ev.id === 'cursed' && hpR > .75) return 0;
  return last;
}
export function runGate(gi, mode) {
  let turns = 0, fights = 0, foe = null; drunk = 0;
  E.enter(gi, mode); if (!S().run) return { res: 'blocked' };
  for (;;) {
    const r = S().run;
    if (!r) return { res: 'fled', turns, fights };
    if (r.state === 'fight') { if (r.enemy !== foe) { foe = r.enemy; fights++; } if (++turns > 400) return { res: 'timeout', turns, fights }; botTurn(); continue; }
    if (r.state === 'won' || r.state === 'room') { E.next(); continue; }
    if (r.state === 'doors') { E.door(pickDoor(r.doors)); continue; }
    if (r.state === 'event') { E.eventPick(pickEvent(r.event)); continue; }
    if (r.state === 'dead') return { res: 'dead', boss: r.stage >= 3, turns, fights, pots: drunk };
    return { res: 'clear', turns, fights, pots: drunk };
  }
}
/* one in-game day on one gate: HP, MP and potions carry over between runs, as in the real game */
function runDay(gi) {
  const s = S(), cost = R.staCost(GATES[gi].sta) + 3 * R.staCost(D.ROOM_STA), o = { runs: 0, clears: 0, deaths: 0 };
  while (s.sta >= cost && o.runs < 8) {
    while (s.hp < R.maxHp() * .6 && s.pot > 0) E.H.quaff('pot');
    while (s.mp < R.maxMp() * .5 && s.mpot > 0) E.H.quaff('mpot');
    const x = runGate(gi); o.runs++;
    if (x.res === 'clear') o.clears++; else if (x.res === 'dead') o.deaths++;
    if (x.res === 'dead') E.H.revive(); else s.run = null;
    if (x.res === 'dead') break; /* a player who just died stops for the day */
  }
  return o;
}

/* ---------------- measuring ---------------- */
export const GATES = D.GATES, TRIAL = D.TRIAL;
export const gateIdx = g => { const i = GATES.findIndex(x => x.r === String(g).toUpperCase()); return i >= 0 ? i : +g; };
export const opts = (gi, L) => ({ awake: L >= D.AWAKE_LV && gi !== TRIAL });
export const baseLv = gi => gi === TRIAL ? D.AWAKE_LV : GATES[gi].lv;
/* first run of a day: full HP/MP */
export function point(cid, gi, L, n) {
  const o = { clear: 0, boss: 0, room: 0, timeout: 0, turns: 0, fights: 0, pots: 0 };
  for (let i = 0; i < n; i++) {
    build(cid, L, opts(gi, L));
    const x = runGate(gi);
    if (x.res === 'clear') o.clear++; else if (x.res === 'dead') o[x.boss ? 'boss' : 'room']++; else if (x.res === 'timeout') o.timeout++;
    o.turns += x.turns || 0; o.fights += x.fights || 0; o.pots += x.pots || 0;
  }
  return { rate: o.clear / n, boss: o.boss / n, room: o.room / n, timeout: o.timeout / n, turns: o.turns / n, perFight: o.turns / Math.max(1, o.fights), pots: o.pots / n };
}
export function dayPoint(cid, gi, L, n) {
  const o = { runs: 0, clears: 0, deaths: 0 };
  for (let i = 0; i < n; i++) { build(cid, L, opts(gi, L)); const d = runDay(gi); o.runs += d.runs; o.clears += d.clears; o.deaths += d.deaths; }
  return { runs: o.runs / n, clears: o.clears / n, deathDays: o.deaths / n };
}
/* lowest level where the class clears the gate at `target` or better (null if not within +24 levels) */
export function levelNeeded(cid, gi, n, target) {
  const g = GATES[gi], lo0 = gi === TRIAL ? D.AWAKE_LV : 1, hi0 = gi === TRIAL ? D.AWAKE_LV + 20 : g.lv + 24;
  if (point(cid, gi, hi0, n).rate < target) return null;
  let lo = lo0, hi = hi0;
  if (point(cid, gi, lo, n).rate >= target) return lo;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (point(cid, gi, m, n).rate >= target) hi = m; else lo = m; }
  return hi;
}
export const pct = v => (Math.round(v * 100) + '%').padStart(5);
export const pad = (v, w) => String(v).padStart(w);
export const median = a => { const b = a.filter(x => x != null).sort((x, y) => x - y); return b.length ? b[b.length >> 1] : null; };
export const avgOf = (ps, k) => ps.reduce((a, p) => a + p[k], 0) / ps.length;

/* rank exam taken at exactly the level it opens: pass rate */
export function examPoint(cid, rk, n) {
  const xi = GATES.findIndex(g => g.exam), L = DU.EXAM_LV[rk]; let pass = 0;
  for (let i = 0; i < n; i++) { build(cid, L, opts(xi, L)); S().hrank = DU.RANKS[DU.RANKS.indexOf(rk) - 1]; if (runGate(xi).res === 'clear') pass++; }
  return pass / n;
}
/* endgame tower: climb from floor 1 at level L, drinking potions between floors, until death; returns floors cleared */
export function towerClimb(cid, L, cap = 80) {
  build(cid, L, opts(0, L)); const s = S(); s.cleared[5] = 1; s.tower = { best: 0 }; s.sta = 1e6;
  E.enter(GATES.findIndex(g => g.tower)); let turns = 0, best = 0;
  for (;;) {
    const r = S().run; if (!r) break;
    if (r.state === 'fight') { if (++turns > 4000) break; botTurn(); continue; }
    if (r.state !== 'won') break;
    best = r.floor; if (best >= cap) break;
    while (s.hp < R.maxHp() * .5 && s.pot > 0) E.H.quaff('pot');
    E.next();
  }
  s.run = null; return best;
}
