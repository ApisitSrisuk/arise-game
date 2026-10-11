import { S, ui, setS, commit, save, wipe, readSave, sys, openModal, closeModal as close } from './store.js';
import { rnd, rf, pick, shuffle } from './util.js';
import {
  CLASSES, ACT, PAS, GR, GATES, AFX, DAILY, ACTIVITIES, SPOT_PER_DAY, HAIR, HC, SKIN, EYES, ORIG,
  TRIAL, AWAKE_LV, ROOM_STA, FLEE_STA, TRAIN_STA, rollGrade, nextGrade, PERK_TIERS, STAT_PERKS, AFF_NEED,
} from './data.js';
import { ITEM, ITEMS, STARTER, LEGACY_WPN, LEGACY_ARM, STARTER_BY_GEAR, sellPrice } from './items.js';
import { SUBCLASSES, SUB, SUB_LV, SUB_OFFER, SUB_REROLL } from './subclass.js';
import { BUILDINGS, BLD, MAX_HALL, maxBlv, slotsOf, upCost, hallCost, WILL, HUNGRY, ROLE_MATCH, FORGE_IRON, shardsOf, gemsOf, EXCUSE, RES_NAME, freshTown } from './town.js';
import {
  cls, pv, pvOf, stat, maxHp, maxMp, maxSta, fatigue, atk, def, mitigation, crit, critMul, dodge, mpCost, staCost, potMul, xpNeed,
  maxSh, shAtk, dailyDone, glowOf, skillCol, ultId, openPaths, awName, skillPow, jobGold, rank,
} from './rules.js';
import { HEROES, HERO, STAR, PULL_COST, PULL10_COST, PITY, MAX_LIMIT, PERSONA_IDS, HERO_SKILL_LV, HERO_SKILL_EVERY, heroCap, heroNeed, RATEUP, bannerHero } from './heroes.js';
import { QUEST_TYPES, DELIVER_RES, questReward, ACHIEVEMENTS, ACH, DAILY_GATE_MUL, dailyGate, BREAK_CHANCE, BREAK_DAYS, BREAK_LOSS, breakReward, AW2_LV, AW2_GATE, REBIRTH_LV, REBIRTH_PTS, respecCost, SWEEP_LV, SWEEP_MUL } from './meta.js';
import { TRAITS, PHASES, WEAK, WEAK_MUL, ULT_CD, monOf, hasTr, weakHit, packLeft, foeBase, shadowTraits } from './monsters.js';
import { DOORS, rollDoors, MYSTERY, EVENTS, eventPrice, HARD_LV, HARD_REWARD, TOWER, towerFloorLv, towerStart, RANKS, EXAM_LV, EXAM_REWARD, EXAM_FOE } from './dungeon.js';
import { emit, runAnim, resetArena, A, burst, addFx } from '../arena/arena.js';
import { sfx } from '../audio/sound.js';
import { artKey } from '../art/sprites.js';

/* ================= STATE ================= */
const freshToday = () => ({ train2: 0, job: 0, nap: 0, spot: 0 });
export function newState(name, look, origin) {
  const o = ORIG[origin];
  return {
    name, look, origin, cls: null, awake: false, awPath: 'pure', lv: 1, xp: 0, pts: 0, alloc: { str: 0, agi: 0, int: 0, vit: 0, per: 0 }, hp: 1, mp: 0, sta: 0,
    gold: 60 + (o.gold || 0), pot: 3 + (o.pot || 0), mpot: 2, spot: 1, stone: 0, wpn: 0, arm: 0, day: 1, daily: { push: 0, sit: 0, squat: 0, run: 0, claimed: false }, today: freshToday(),
    shadows: [], cleared: {}, run: null, kills: 0, deaths: 0, act: [], pas: [], picks: 0, pickOpts: null, found: [], unlocked: [],
    gems: 300, heroes: {}, party: [], pity: 0, pulls: 0,
    eq: { ...STARTER }, inv: [STARTER.weapon, STARTER.body], sub: null, subOffer: null,
    town: freshTown(),
    hrank: 'E', tower: { best: 0 },
    quests: [], qDay: 0, ach: {}, title: null, stats: {}, brk: null, respec: 0, aw2: false, rebirth: 0,
  };
}
export function boot() {
  const d = readSave();
  if (d && d.cls && d.look && CLASSES.some(c => c.id === d.cls)) {
    const s = Object.assign(newState(d.name, d.look, d.origin || 'student'), d);
    s.heroes = Object.fromEntries(Object.entries(s.heroes || {}).filter(([id]) => HERO[id]));
    s.party = (s.party || []).filter(id => s.heroes[id]);
    Object.values(s.heroes).forEach(h => { if (!h.trait) h.trait = pick(PERSONA_IDS); });
    /* saves from before equipment stored weapon/armour as tier numbers */
    if (!d.eq) { s.eq = { ...STARTER, weapon: LEGACY_WPN[d.wpn || 0], body: LEGACY_ARM[d.arm || 0] }; s.inv = [...new Set([STARTER.weapon, STARTER.body, s.eq.weapon, s.eq.body])]; }
    s.inv = s.inv.filter(id => ITEM[id]); for (const k in s.eq) if (s.eq[k] && !ITEM[s.eq[k]]) s.eq[k] = STARTER[k];
    if (s.sub && !SUB[s.sub.id]) s.sub = null;
    { const f = freshTown(), t = s.town || {}; s.town = { ...f, ...t, res: { ...f.res, ...(t.res || {}), shards: ((t.res || {}).shards || 0) + (t.shards || 0) }, b: { ...f.b, ...(t.b || {}) } }; delete s.town.shards; }
    for (const b of BUILDINGS) { s.town.b[b.id] = s.town.b[b.id] || { lv: 1, w: [] }; s.town.b[b.id].w = s.town.b[b.id].w.filter(id => s.heroes[id] && !s.party.includes(id)); }
    s.stats = s.stats || {}; s.ach = s.ach || {};
    Object.values(s.heroes).forEach(h => { h.lv = h.lv || 1; h.xp = h.xp || 0; });
    setS(s); if (s.run) resetArena(); offerSub(); if (s.qDay !== s.day) rollQuests(); checkAch(true); save();
  } else { setS(null); ui.modal = { type: 'intro' }; }
  commit();
}
const done = () => { save(); commit(); };

export const maxParty = () => Math.min(4, 2 + Math.floor(S.lv / 10));
export const heroPow = id => { const h = HERO[id], o = S.heroes[id]; return Math.round((8 + S.lv * 2.4) * STAR[h.star].m * (1 + .15 * (o ? o.lim : 0)) * (1 + .06 * ((o && o.lv || 1) - 1))); };
/* heroes level up from battles and town work, up to a cap that rises with star and limit break */
export const heroCapOf = id => heroCap(HERO[id].star, S.heroes[id].lim);
function heroGainXp(id, n) {
  const o = S.heroes[id]; if (!o) return; o.lv = o.lv || 1; o.xp = (o.xp || 0) + n;
  while (o.lv < heroCapOf(id) && o.xp >= heroNeed(o.lv)) {
    o.xp -= heroNeed(o.lv); o.lv++;
    if (o.lv === HERO_SKILL_LV) sys(`${HERO[id].n} เลเวล ${o.lv} ปลดล็อกสกิลประจำบทบาท!`, 'lv');
  }
  if (o.lv >= heroCapOf(id)) o.xp = Math.min(o.xp, heroNeed(o.lv));
}
/* regular (non-trial) gates, for the daily rotation and dungeon breaks */
/* special gates (trial, tower, rank exam) have their own flow and are left out of rotations */
export const isRegular = g => !g.trial && !g.tower && !g.exam;
export const regularGates = () => GATES.map((g, i) => [g, i]).filter(([g]) => isRegular(g)).map(([, i]) => i);
export const todayGate = () => { const R = regularGates(); return R[dailyGate(S.day, R.length)]; };
const partyRole = r => S.party.filter(id => HERO[id].role === r);
/* ATK bonus from support heroes and damage cut from tank heroes */
export const partyAtkBonus = () => partyRole('support').reduce((a, id) => a + (6 + HERO[id].star * 3) * (id === 'aria' ? 2 : 1), 0);
export const partyCover = () => Math.min(45, partyRole('tank').reduce((a, id) => a + (5 + HERO[id].star * 3) * (id === 'leon' ? 2 : 1), 0));

function gainXp(n) {
  S.xp += n;
  while (S.xp >= xpNeed()) {
    S.xp -= xpNeed(); S.lv++; S.pts += 5; S.hp = maxHp(); S.mp = maxMp(); sfx('levelup');
    sys(`เลเวลอัป! ตอนนี้คุณเลเวล ${S.lv} ได้รับแต้มสถานะ +5`, 'lv');
    if (S.lv % 5 === 0) { S.picks++; sys('ปลดล็อกช่องสกิลใหม่ เลือกได้ที่หน้าสถานะ', 'lv'); }
    if (S.lv % 10 === 0 && S.lv <= 20) sys(`ช่องทีมฮีโร่เพิ่มเป็น ${maxParty()} ช่อง`, 'lv');
    if (S.lv === AWAKE_LV && !S.awake) sys('ภารกิจตื่นรู้ปลดล็อกแล้ว ดูได้ที่หน้าเกต', 'sh');
  }
  offerSub();
}

/* ================= CREATION + CLASSES ================= */
export const randomLook = () => ({ hair: rnd(0, HAIR.length - 1), hc: rnd(0, HC.length - 1), skin: rnd(0, SKIN.length - 1), eye: rnd(0, EYES.length - 1) });
function weighted() {
  const w3 = S && ORIG[S.origin] && ORIG[S.origin].hidden3;
  const pool = CLASSES.filter(c => c.w > 0).map(c => ({ c, w: c.w * (c.hidden && w3 ? 3 : 1) }));
  let r = Math.random() * pool.reduce((a, p) => a + p.w, 0);
  for (const p of pool) { r -= p.w; if (r < 0) return p.c; }
  return pool[0].c;
}
function assignClass(c) {
  if (!pvOf(c, 'extract') && S.shadows.length) { S.shadows = []; sys('กองทัพเงาสลายไปพร้อมกับอาชีพเดิม', 'sh'); }
  /* the first awakening gifts a starter weapon that suits the class */
  if (!S.cls) { const w = STARTER_BY_GEAR[(c.art[0] || []).find(gr => STARTER_BY_GEAR[gr])]; if (w) { if (!S.inv.includes(w)) S.inv.push(w); S.eq.weapon = w; } }
  S.cls = c.id;
  S.act = shuffle(c.act).slice(0, c.hidden ? 2 : 1).map(id => ({ id, g: rollGrade() }));
  S.pas = shuffle(c.pasIds).slice(0, 1).map(id => ({ id, g: rollGrade() }));
  S.picks = Math.floor(S.lv / 5); S.pickOpts = null;
  if (!S.found.includes(c.id)) S.found.push(c.id);
  S.hp = maxHp(); S.mp = maxMp(); S.sta = S.sta ? Math.min(S.sta, maxSta()) : maxSta(); save();
}
export function finishRoll(cid, first) { assignClass(CLASSES.find(c => c.id === cid)); sfx('reveal'); openModal({ type: 'reveal', first }); }
function rollClass(first) { openModal({ type: 'roll', res: weighted().id, first }); }

export function checkUnlocks() {
  for (const c of CLASSES) if (c.cond && !S.unlocked.includes(c.id) && c.cond.f(S)) {
    S.unlocked.push(c.id); if (!S.found.includes(c.id)) S.found.push(c.id); save();
    sfx('glitch'); openModal({ type: 'unlock', cid: c.id }); return;
  }
}
function genPicks() {
  const c = cls(), own = new Set([...S.act.map(s => s.id), ...S.pas.map(s => s.id)]); let cand = [];
  if (S.act.length < 4) c.act.filter(id => !own.has(id)).forEach(id => cand.push({ k: 'act', id }));
  if (S.pas.length < 5) c.pasIds.filter(id => !own.has(id)).forEach(id => cand.push({ k: 'pas', id }));
  cand = shuffle(cand).slice(0, 3).map(o => ({ ...o, g: rollGrade() }));
  const ups = [...S.act.map((s, i) => ({ k: 'up', w: 'act', i })), ...S.pas.map((s, i) => ({ k: 'up', w: 'pas', i }))].filter(o => S[o.w][o.i].g !== 'S');
  while (cand.length < 3 && ups.length) cand.push(ups.splice(rnd(0, ups.length - 1), 1)[0]);
  return cand;
}
export function openPick() {
  if (!S.picks) return; if (!S.pickOpts) S.pickOpts = genPicks();
  if (!S.pickOpts.length) { S.picks--; S.pts += 3; S.pickOpts = null; sys('สกิลครบทุกช่องและเกรดสูงสุดแล้ว แปลงเป็นแต้มสถานะ +3'); done(); return; }
  save(); openModal({ type: 'pick' });
}
/* awakening: the player picks the class's own path or a hybrid path opened by a high non-main stat */
export function awaken(path = 'pure') {
  const c = cls(); if (S.awake || !S.run || S.run.state !== 'awaken') return;
  if (path !== 'pure' && !openPaths(c).includes(path)) return;
  S.awake = true; S.awPath = path; S.hp = maxHp(); S.mp = maxMp(); S.run.state = 'cleared'; save();
  sfx('awaken'); openModal({ type: 'awakened' });
}

/* ================= HERO GACHA ================= */
function rollStar(guarantee3) {
  if (S.pity + 1 >= PITY) return 5;
  let r = Math.random() * 100;
  for (const st of [5, 4, 3, 2, 1]) { r -= STAR[st].rate; if (r < 0) return guarantee3 ? Math.max(3, st) : st; }
  return guarantee3 ? 3 : 1;
}
export function summon(n) {
  const cost = n === 10 ? PULL10_COST : PULL_COST * n;
  if (S.gems < cost) { sfx('error'); sys(`คริสตัลไม่พอ ต้องใช้ ${cost}`, 'bad'); return; }
  S.gems -= cost; const res = [];
  for (let i = 0; i < n; i++) {
    const star = rollStar(n === 10 && i === n - 1 && !res.some(r => HERO[r.id].star >= 3));
    S.pity = star === 5 ? 0 : S.pity + 1; S.pulls++;
    const fe = bannerHero(S.day), id = fe.star === star && Math.random() < RATEUP ? fe.id : pick(HEROES.filter(h => h.star === star)).id, own = S.heroes[id];
    if (star === 5) S.stats.got5 = (S.stats.got5 || 0) + 1;
    questTick('summon');
    let kind = 'new', refund = 0;
    if (!own) { S.heroes[id] = { lim: 0, at: S.pulls, trait: pick(PERSONA_IDS), lv: 1, xp: 0 }; if (S.party.length < maxParty()) S.party.push(id); }
    else if (own.lim < MAX_LIMIT) { own.lim++; kind = 'limit'; }
    else { refund = star * 20; S.gems += refund; kind = 'refund'; }
    res.push({ id, kind, refund });
  }
  checkAch(); save(); openModal({ type: 'summon', res, n });
}
export function toggleParty(id) {
  if (!S.heroes[id]) return;
  if (S.party.includes(id)) S.party = S.party.filter(x => x !== id);
  else if (S.party.length < maxParty()) { S.party.push(id); quitJob(id); }
  else { sfx('error'); sys(`ทีมเต็มแล้ว (${maxParty()} ช่อง) ถอดฮีโร่ออกก่อน`, 'bad'); return; }
  done();
}

/* ================= TOWN ================= */
export const jobOf = id => BUILDINGS.find(b => S.town.b[b.id].w.includes(id));
function quitJob(id) { for (const b of BUILDINGS) S.town.b[b.id].w = S.town.b[b.id].w.filter(x => x !== id); }
export const heroWill = id => WILL[S.heroes[id].trait] ?? .8;
export const canPay = cost => Object.entries(cost).every(([k, v]) => k === 'gold' ? S.gold >= v : (S.town.res[k] || 0) >= v);
const pay = cost => Object.entries(cost).forEach(([k, v]) => { if (k === 'gold') S.gold -= v; else S.town.res[k] -= v; });
/* output multiplier for one worker: star, limit break, building level, role match, diligence */
export const workMul = (id, bid) => {
  const h = HERO[id], o = S.heroes[id];
  return STAR[h.star].m * (1 + .15 * o.lim) * (1 + .25 * (S.town.b[bid].lv - 1)) * (h.role === BLD[bid].role ? ROLE_MATCH : 1) * (o.trait === 'diligent' ? 1.3 : 1);
};
/* runs when the day ends: heroes eat, then every assigned hero either works or refuses */
function workDay() {
  const lines = [], tot = { gold: 0, pot: 0, mpot: 0, gems: 0, xp: 0, items: [], food: 0, wood: 0, stone: 0, iron: 0 }, T = S.town;
  const mouths = Object.keys(S.heroes).length, eaten = Math.min(T.res.food, mouths), hungry = eaten < mouths;
  T.res.food -= eaten;
  for (const b of BUILDINGS) for (const id of T.b[b.id].w) {
    const h = HERO[id], o = S.heroes[id];
    if (Math.random() > heroWill(id) * (hungry ? HUNGRY : 1)) {
      o.refuse = (o.refuse || 0) + 1;
      lines.push({ b: b.id, id, ok: false, text: hungry && Math.random() < .5 ? 'หิวจนไม่มีแรงทำงาน' : EXCUSE[o.trait] || 'ไม่ยอมมาทำงาน', strike: o.refuse });
      continue;
    }
    o.refuse = 0; o.worked = (o.worked || 0) + 1; heroGainXp(id, 12); questTick('work');
    const m = workMul(id, b.id); let text = '';
    if (b.out) { const n = Math.max(1, Math.round(b.base * m)); tot[b.out] += n; text = `ได้${RES_NAME[b.out]} ${n}`; }
    if (b.id === 'market') { let g = Math.round((30 + S.lv * 4) * m); if (o.trait === 'greedy') { g = Math.round(g * .8); text = ' (แอบเก็บไว้เอง 20%)'; } tot.gold += g; text = `ขายของได้ทอง ${g}` + text; }
    if (b.id === 'apoth') { const p = Math.floor(.55 * m + Math.random()), q = Math.floor(.35 * m + Math.random()); tot.pot += p; tot.mpot += q; text = p + q ? `ปรุงยา HP ${p} · ยา MP ${q}` : 'ปรุงยาพังหมดทั้งหม้อ'; }
    if (b.id === 'altar') { const g = Math.max(1, Math.round(5 * m)); tot.gems += g; text = `กลั่นได้คริสตัล ${g}`; }
    if (b.id === 'dojo') { const x = Math.round(8 * S.lv * m); tot.xp += x; text = `ซ้อมมือกับคุณ ได้ EXP ${x}`; }
    if (b.id === 'forge') {
      if (T.res.iron < FORGE_IRON) text = `เหล็กไม่พอ (ต้องใช้ ${FORGE_IRON}) เลยได้แต่ขัดเครื่องมือ`;
      else {
        T.res.iron -= FORGE_IRON;
        const pool = ITEMS.filter(i => i.p > 0 && i.lv <= S.lv + 2 && !S.inv.includes(i.id) && !tot.items.includes(i.id));
        if (pool.length && Math.random() < .25 * m) { const it = pick(pool); tot.items.push(it.id); text = `ตีอุปกรณ์สำเร็จ ได้ ${it.n}!`; }
        else { const g = Math.round(25 * m); tot.gold += g; text = `ตีพลาด ขายเศษเหล็กได้ทอง ${g}`; }
      }
    }
    lines.push({ b: b.id, id, ok: true, text });
  }
  S.gold += tot.gold; S.pot += tot.pot; S.mpot += tot.mpot; S.gems += tot.gems; S.inv.push(...tot.items);
  for (const k of ['food', 'wood', 'stone', 'iron']) T.res[k] += tot[k];
  if (tot.xp) gainXp(tot.xp);
  return { lines, tot, eaten, mouths, hungry };
}

/* ================= BATTLE ================= */
/* o.lv / o.name override the gate's level and monster list (the tower draws foes from every gate) */
function mkEnemy(gi, type, o = {}) {
  const g = GATES[gi], af = AFX[S.run.affix], solo = type === 'trial' || type === 'exam';
  const step = type === 'boss' ? 2 : type === 'mob' ? 0 : 1;
  const lv = o.lv != null ? o.lv + step : type === 'trial' ? Math.max(g.lv, S.lv + 2) : type === 'exam' ? EXAM_LV[nextRank()] + EXAM_FOE.lv
    : g.lv + rnd(0, 3) + step + (S.run.hard ? HARD_LV : 0);
  let { hp, atk: a } = foeBase(lv), xp = 10 + lv * 6, gold = 6 + lv * 3;
  if (S.run.hard) { xp *= HARD_REWARD; gold *= HARD_REWARD; }
  let name = o.name || (type === 'boss' || solo ? g.boss : type === 'mimic' ? 'มิมิค' : pick(g.mobs));
  if (type === 'boss') { hp *= 2.2; xp *= 4; gold *= 5; }
  if (type === 'trial') { hp *= 3; a *= 1.25; xp *= 6; gold *= 6; }
  if (type === 'exam') { const xm = EXAM_FOE.rank[nextRank()] || 1; hp *= EXAM_FOE.hp * xm; a *= EXAM_FOE.atk * xm; xp *= 5; gold *= 5; }
  if (type === 'elite') { hp *= 1.6; a *= 1.3; xp *= 2.2; gold *= 2.5; name = 'ยอดฝีมือ·' + name; }
  if (type === 'mimic') { hp *= 1.3; a *= 1.2; xp *= 2; gold *= 4; }
  /* a full hero party makes fights easier, so foes scale slightly with party size */
  hp *= (af.hp || 1) * (1 + S.party.length * .12); a *= af.atk || 1;
  const e = { name, lv, hp: Math.round(hp), max: Math.round(hp), atk: Math.round(a), def: Math.floor(lv * .9), xp: Math.round(xp), gold: Math.round(gold), boss: type === 'boss' || solo, elite: type === 'elite' || type === 'mimic', turn: 0, burn: 0 };
  /* traits and weakness (monsters.js); a boss keeps its second phase for half HP */
  const m = monOf(name); e.tr = m.t; e.wk = m.weak; e.p2 = e.boss ? m.p2 : null; e.p2line = m.line; e.ph = null; e.heavyEvery = 3; e.shield = 0;
  if (hasTr(e, 'pack')) e.pack = 3;
  return e;
}
function enterPhase(e) {
  e.ph = e.p2; emit({ t: 'phase', name: PHASES[e.ph].n });
  log(e.p2line || `${e.name} เข้าสู่ร่างที่สอง!`, 'bad'); log(`[${PHASES[e.ph].n}] ${PHASES[e.ph].d}`, 'warn');
  if (e.ph === 'rage') e.heavyEvery = 2;
  if (e.ph === 'guard') e.shield = Math.round(e.max * .25);
}
const checkPhase = e => { if (e.p2 && !e.ph && e.hp > 0 && e.hp <= e.max * .5) enterPhase(e); };
/* equipment drops favour pieces the player doesn't own yet, up to a level cap */
function dropItem(cap) {
  const pool = ITEMS.filter(i => i.p > 0 && i.lv <= cap), fresh = pool.filter(i => !S.inv.includes(i.id));
  const it = pick(fresh.length ? fresh : pool); if (!it) return;
  if (S.inv.includes(it.id)) { const g = Math.round(it.p * .3); S.gold += g; log(`ได้รับ ${it.n} ซ้ำ ขายได้ทอง ${g}`, 'ok'); return; }
  S.inv.push(it.id); checkAch(); log(`ดรอปอุปกรณ์! ได้รับ ${it.n}`, 'crit'); sys(`ได้รับอุปกรณ์ [${it.n}] ไปลองสวมได้ที่แท็บแต่งตัว`, 'lv'); sfx('chest');
}
function log(t, k = '') { S.run.log.push({ t, k }); if (S.run.log.length > 30) S.run.log.shift(); }
function rollAffix() { let r = Math.random() * 100; for (const [k, v] of Object.entries(AFX)) { r -= v.w; if (r < 0) return k; } return 'none'; }
function initFight(e) { const r = S.run; r.guard = pv('startguard'); r.poison = 0; const w = pv('enemyweak'); if (w) e.atk = Math.round(e.atk * (1 - w / 100)); }

/* official hunter rank (raised by the guild exam); old saves start at the rank their level already shows */
const hrank = () => { if (!S.hrank) S.hrank = rank(); return S.hrank; };
export const nextRank = () => RANKS[RANKS.indexOf(hrank()) + 1] || null;
export const towerUnlocked = () => (S.cleared[TOWER.unlockGate] || 0) > 0;
export const towerBest = () => (S.tower && S.tower.best) || 0;
/* why a gate can't be entered right now, or null: rank gates allow up to one rank above yours */
export function gateLock(gi) {
  const g = GATES[gi], hr = hrank();
  if (g.tower) return towerUnlocked() ? null : `ปลดล็อกเมื่อเคลียร์${GATES[TOWER.unlockGate].name}`;
  if (g.exam) { const nx = nextRank(); return !nx ? 'คุณเป็นแรงก์สูงสุดแล้ว' : S.lv < EXAM_LV[nx] ? `สอบเลื่อนเป็นแรงก์ ${nx} ได้เมื่อเลเวล ${EXAM_LV[nx]}` : null; }
  if (g.trial) return S.awake ? 'ตื่นรู้แล้ว' : S.lv < AWAKE_LV ? `ปลดล็อกที่เลเวล ${AWAKE_LV}` : null;
  const gr = RANKS.indexOf(g.r); return gr > RANKS.indexOf(hr) + 1 ? `ต้องเป็นฮันเตอร์แรงก์ ${RANKS[gr - 1]} ก่อน สอบเลื่อนแรงก์ได้ที่สมาคม` : null;
}
/* mode 'hard': a gate cleared at least once, with foes HARD_LV levels higher and richer rewards */
export const canHard = gi => isRegular(GATES[gi]) && (S.cleared[gi] || 0) > 0;
export function enter(gi, mode) {
  gi = +gi; const g = GATES[gi], hard = mode === 'hard', cost = staCost(g.sta + (hard ? 6 : 0));
  const lock = gateLock(gi); if (lock) { sfx('error'); sys(lock, 'bad'); return; }
  if (hard && !canHard(gi)) return;
  if (S.sta < cost) { sfx('error'); sys(`สตามินาไม่พอ ต้องใช้ ${cost} (มี ${S.sta}) จบวันเพื่อพักฟื้น งีบ หรือดื่มยากระตุ้น`, 'bad'); return; }
  S.sta -= cost; resetArena(); sfx('gate');
  S.run = { g: gi, stage: g.trial || g.exam ? 3 : 0, enemy: null, obj: null, room: null, guard: 0, stop: 0, evade: 0, buff: null, state: 'fight', log: [], loot: { xp: 0, gold: 0, gems: 0 }, tries: 3, affix: isRegular(g) ? rollAffix() : 'none', undyingLeft: pv('undying'), lsAcc: 0, hard, bless: 0, curse: 0, doors: null, event: null };
  if (g.tower) { S.run.tower = true; S.run.floor = towerStart(towerBest()); }
  if (g.exam) log(`[สมาคมฮันเตอร์] การสอบเลื่อนเป็นแรงก์ ${nextRank()} เริ่มขึ้น`, 'warn');
  if (g.tower) log(`[หอคอย] เริ่มปีนจากชั้น ${S.run.floor} (สถิติสูงสุด ชั้น ${towerBest()})`, 'warn');
  const af = AFX[S.run.affix];
  log(`[ระบบ] คุณได้เข้าสู่${g.trial ? '' : 'ดันเจี้ยน '}${g.name}${hard ? ' [โหมดฝันร้าย]' : ''} (สตามินา -${cost})`, 'sys');
  if (hard) log(`[ฝันร้าย] ศัตรูเลเวล +${HARD_LV} · EXP และทอง ×${HARD_REWARD}`, 'warn');
  if (S.run.affix !== 'none') log(`[ระบบ] ตรวจพบความผิดปกติ: ${af.n} (${af.d})`, 'warn');
  if (g.trial) log('[ภารกิจเปลี่ยนอาชีพ] เอาชนะผู้คุมบททดสอบเพื่อตื่นรู้', 'warn');
  if (S.party.length) log(`ทีมฮีโร่ ${S.party.map(id => HERO[id].n).join(', ')} ติดตามคุณเข้ามา`, 'sk');
  startRoom(); done();
}
/* a new fight announces the foe's traits; an ambusher strikes first unless your PER spots it */
function startRoom(kind) { if (S.run.tower) towerRoom(); else openRoom(kind); announce(); }
/* ---------- endgame tower: one fight per floor, foes from every gate, a floor guardian every TOWER.every floors ---------- */
function towerRoom() {
  const r = S.run, f = r.floor, boss = f % TOWER.every === 0, src = pick(GATES.filter(isRegular));
  r.stop = 0; r.evade = 0; r.buff = null; r.obj = null; r.room = null; r.guard = 0;
  r.enemy = mkEnemy(r.g, boss ? 'boss' : f % 3 === 0 ? 'elite' : 'mob', { lv: towerFloorLv(f), name: boss ? src.boss : pick(src.mobs) });
  r.state = 'fight'; initFight(r.enemy); log(`[ชั้น ${f}] ${boss ? 'ผู้พิทักษ์ชั้น ' : ''}${r.enemy.name} ปรากฏตัว!`, boss ? 'bad' : '');
}
/* tower floors and the rank exam end differently from a gate; win() calls this before its boss rewards */
export function specialWin(e) {
  const r = S.run, g = GATES[r.g];
  if (r.tower) {
    S.tower = S.tower || { best: 0 }; const f = r.floor;
    if (f > S.tower.best) { S.tower.best = f; const gm = TOWER.gemsPerFloor + (e.boss ? TOWER.bossGems : 0); S.gems += gm; r.loot.gems += gm; log(`สถิติใหม่ ชั้น ${f}! ได้รับคริสตัล ${gm}`, 'crit'); }
    if (e.boss) { if (Math.random() < .3) dropItem(e.lv); log(`[หอคอย] ผ่านจุดเช็กพอยต์ ครั้งหน้าเริ่มที่ชั้น ${f + 1}`, 'sys'); }
    r.state = 'won'; return true;
  }
  if (g.exam) {
    const nx = nextRank(); S.hrank = nx; S.pts += EXAM_REWARD.pts; S.gems += EXAM_REWARD.gems; r.loot.gems += EXAM_REWARD.gems; sfx('levelup');
    log(`[สมาคมฮันเตอร์] ผ่านการสอบ! คุณเป็นฮันเตอร์แรงก์ ${nx} อย่างเป็นทางการ`, 'sys');
    sys(`เลื่อนเป็นแรงก์ ${nx} · แต้มสถานะ +${EXAM_REWARD.pts} · คริสตัล +${EXAM_REWARD.gems}`, 'lv');
    r.state = 'cleared'; return true;
  }
  return false;
}
function announce() {
  const r = S.run, e = r.enemy; if (r.state !== 'fight' || !e) return;
  const tags = [...e.tr.map(t => TRAITS[t].n), e.wk && 'จุดอ่อน: ' + WEAK[e.wk].n].filter(Boolean);
  if (tags.length) log(`[วิเคราะห์] ${tags.join(' · ')}`, 'sys');
  if (hasTr(e, 'ambush') && stat('per') < e.lv * .8) { log(`${e.name} ซุ่มโจมตีก่อน!`, 'bad'); enemyTurn(); runAnim(); }
}
const weighted2 = tbl => { let x = Math.random() * tbl.reduce((a, [, w]) => a + w, 0); return (tbl.find(([, w]) => (x -= w) < 0) || tbl[0])[0]; };
/* kind: 'mob' | 'elite' | 'chest' | 'spring' | 'trap' | 'event' | 'mystery'; none = a random room at the usual odds */
function openRoom(kind) {
  const r = S.run, g = GATES[r.g]; r.stop = 0; r.evade = 0; r.buff = null; r.obj = null; r.room = null; r.enemy = null; r.guard = 0;
  if (r.stage === 3) { r.enemy = mkEnemy(r.g, g.trial ? 'trial' : g.exam ? 'exam' : 'boss'); r.state = 'fight'; initFight(r.enemy); log(`บอส ${r.enemy.name} ปรากฏตัว!`, 'bad'); return; }
  if (kind === 'mystery') kind = weighted2(MYSTERY);
  if (!kind) kind = weighted2([['mob', 60], ['elite', 14], ['chest', 10], ['spring', 8], ['trap', 8]]);
  if (kind === 'event') { openEvent(); return; }
  if (kind === 'mob') { r.enemy = mkEnemy(r.g, 'mob'); r.state = 'fight'; initFight(r.enemy); log(`${r.enemy.name} ปรากฏตัว!`); return; }
  if (kind === 'elite') { r.enemy = mkEnemy(r.g, 'elite'); r.state = 'fight'; initFight(r.enemy); log(`ศัตรูระดับยอดฝีมือ ${artKey(r.enemy.name)} ขวางทางอยู่!`, 'warn'); return; }
  if (kind === 'chest') {
    if (Math.random() < .25) { r.enemy = mkEnemy(r.g, 'mimic'); r.state = 'fight'; initFight(r.enemy); log('หีบสมบัติขยับได้! มันคือมิมิค!', 'bad'); sfx('glitch'); return; }
    const gold = Math.round((10 + g.lv * 4) * rf(1, 2.5) * (1 + pv('gold') / 100)); S.gold += gold; r.loot.gold += gold; const got = [`ทอง ${gold}`];
    if (Math.random() < .4) { S.pot++; got.push('ยาฟื้นพลัง'); } if (Math.random() < .2) { S.mpot++; got.push('ยามานา'); }
    if (Math.random() < .15) { S.spot++; got.push('ยากระตุ้นพลังงาน'); } if (Math.random() < .06) { S.stone++; got.push('หินปลุกพลังใหม่!'); }
    if (Math.random() < .35) { const gm = 10 + rnd(0, 2) * 5; S.gems += gm; r.loot.gems += gm; got.push(`คริสตัล ${gm}`); }
    if (Math.random() < .08) { const pool = ITEMS.filter(i => i.p > 0 && i.lv <= g.lv + 3 && !S.inv.includes(i.id)); const it = pool.length && pick(pool); if (it) { S.inv.push(it.id); got.push(`อุปกรณ์ ${it.n}!`); } }
    { const w = rnd(2, 6), st = rnd(2, 6); S.town.res.wood += w; S.town.res.stone += st; got.push(`ไม้ ${w} · หิน ${st}`); }
    r.state = 'room'; r.obj = 'chest'; r.room = { title: 'ห้องสมบัติ', text: `คุณพบหีบสมบัติ ได้รับ ${got.join(' · ')}` }; log(r.room.text, 'ok'); sfx('chest'); return;
  }
  if (kind === 'spring') {
    const h = Math.round(maxHp() * .35), m = Math.round(maxMp() * .35), st = 8;
    S.hp = Math.min(maxHp(), S.hp + h); S.mp = Math.min(maxMp(), S.mp + m); S.sta = Math.min(maxSta(), S.sta + st);
    r.state = 'room'; r.obj = 'spring'; r.room = { title: 'น้ำพุมานา', text: `น้ำพุเรืองแสงฟื้นฟู HP ${h} · MP ${m} · สตามินา ${st}` }; log(r.room.text, 'ok'); sfx('heal'); return;
  }
  const avoid = Math.random() * 100 < dodge() + stat('per') * .5; let text;
  if (avoid) text = 'คุณสัมผัสได้ถึงกับดักและหลบพ้นได้ทัน';
  else { const d = Math.round(maxHp() * .12); S.hp = Math.max(1, S.hp - d); S.sta = Math.max(0, S.sta - 5); text = `กับดักหนามพุ่งขึ้นจากพื้น คุณเสีย HP ${d} และสตามินา 5`; }
  r.state = 'room'; r.room = { title: 'ห้องกับดัก', text }; log(text, avoid ? 'ok' : 'bad'); sfx(avoid ? 'miss' : 'trap');
}

/* ---------- event rooms (dungeon.js): r.event = { id, title, text, price, opts: [{ n, d, ok }] }; the last option is always safe ---------- */
function openEvent() {
  const r = S.run, id = pick(Object.keys(EVENTS)), ev = EVENTS[id], price = eventPrice(id, S.lv);
  const ok = o => o.need === 'pot' ? S.pot > 0 : o.need === 'gold' ? S.gold >= price : true;
  r.state = 'event'; r.event = { id, title: ev.title, text: ev.text, price, opts: ev.opts.map(o => ({ n: o.n, d: o.d.replace('{price}', price), ok: ok(o) })) };
  log(`[เหตุการณ์] ${ev.title}: ${ev.text}`, 'sys'); sfx('reveal');
}
function eventFight(line) { const r = S.run; r.event = null; r.enemy = mkEnemy(r.g, 'elite'); r.state = 'fight'; initFight(r.enemy); log(line, 'bad'); sfx('glitch'); announce(); }
export function eventPick(i) {
  const r = S.run; if (!r || r.state !== 'event' || ui.busy) return; const ev = r.event, o = ev && ev.opts[+i]; if (!o || !o.ok) return;
  const g = GATES[r.g], last = +i === ev.opts.length - 1; let text = 'คุณเดินผ่านไปอย่างระมัดระวัง';
  if (!last) {
    if (ev.id === 'hunter') {
      S.pot--;
      if (Math.random() < .25) { eventFight('ฮันเตอร์คนนั้นหัวเราะ… มันคือกับดัก! ศัตรูยอดฝีมือโผล่ออกมา'); done(); return; }
      const gm = 20 + rnd(0, 4) * 5, xp = 15 * S.lv; S.gems += gm; r.loot.gems += gm; r.loot.xp += xp; gainXp(xp);
      text = `ฮันเตอร์ขอบคุณและมอบคริสตัล ${gm} ให้ คุณได้ EXP ${xp} จากเรื่องเล่าของเขา`;
    }
    if (ev.id === 'merchant') { S.gold -= ev.price; if (+i === 0) S.pot += 2; else S.mpot += 2; sfx('coin'); text = `ซื้อ${+i === 0 ? 'ยา HP' : 'ยามานา'} 2 ขวด จ่ายไป ${ev.price} ทอง`; }
    if (ev.id === 'altar' && +i === 0) { const c = Math.round(maxHp() * .25); S.hp = Math.max(1, S.hp - c); r.bless += .2; emit({ t: 'pself', v: c }); text = `เลือดของคุณซึมลงแท่นหิน ATK +${Math.round(r.bless * 100)}% จนกว่าจะออกจากเกต`; }
    if (ev.id === 'altar' && +i === 1) {
      if (Math.random() < .5) { S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * .4)); S.mp = Math.min(maxMp(), S.mp + Math.round(maxMp() * .4)); sfx('heal'); text = 'แสงอบอุ่นห่อหุ้มร่าง ฟื้น HP และ MP 40%'; }
      else { r.curse += .15; sfx('glitch'); text = 'เสียงหัวเราะดังก้อง… คำสาปทำให้ศัตรูในเกตนี้ ATK +15%'; }
    }
    if (ev.id === 'cursed') {
      const gold = Math.round((10 + g.lv * 4) * 5 * (1 + pv('gold') / 100)), gm = 30; S.gold += gold; r.loot.gold += gold; S.gems += gm; r.loot.gems += gm;
      log(`หีบต้องสาปให้ทอง ${gold} · คริสตัล ${gm}`, 'ok'); if (Math.random() < .4) dropItem(g.lv + 5);
      eventFight('โซ่ดำขาดสะบั้น ผู้พิทักษ์หีบตื่นขึ้นมา!'); done(); return;
    }
    if (ev.id === 'shrine') { S.gold -= ev.price; S.hp = maxHp(); S.mp = maxMp(); sfx('heal'); text = `ถวายทอง ${ev.price} รูปปั้นเปล่งแสง ฟื้น HP และ MP เต็ม`; }
  }
  r.event = null; r.state = 'room'; r.room = { title: ev.title, text }; log(text, 'ok'); done();
}
/* before the 2nd and 3rd rooms: r.doors = two DOORS keys; pick one */
export function door(i) {
  const r = S.run; if (!r || r.state !== 'doors' || ui.busy) return; const k = r.doors && r.doors[+i]; if (!k) return;
  r.doors = null; log(`คุณเลือก${DOORS[k].n}`, ''); startRoom(DOORS[k].room); done();
}
function hitEnemy(mult, o = {}) {
  const r = S.run, e = r.enemy; if (!e || e.hp <= 0) return 0;
  if (!o.skill && hasTr(e, 'evasive') && Math.random() < .35) { emit({ t: 'emiss' }); log(`${e.name} หลบการโจมตีได้`, ''); return 0; }
  let force = o.force; if (!e.fsUsed && pv('firststrike')) { force = true; e.fsUsed = true; }
  const c = force || Math.random() * 100 < crit();
  let base = atk() * mult * (1 + partyAtkBonus() / 100) + (o.bonus || 0);
  if (o.exec && e.hp / e.max < .3) base *= 3;
  if (o.skill) base *= 1 + skillPow() / 100;
  if (e.boss || e.elite) base *= 1 + pv('bossdmg') / 100;
  /* traits: ward cuts skill damage, a weakness boosts it, a stunned foe takes more from everything */
  if (!o.pierce && hasTr(e, 'armored')) base *= .5;
  if (o.skill && (hasTr(e, 'ward') || e.ph === 'ward')) base *= .6;
  if (o.skill && weakHit(e, o.fx)) base *= WEAK_MUL;
  if (r.stop > 0) base *= 1.25;
  if (r.bless) base *= 1 + r.bless;
  let d = Math.max(1, Math.round(base * rf(.9, 1.1) * (c ? critMul() : 1) - (o.pierce ? 0 : e.def)));
  if (e.shield > 0) {
    const s = Math.min(e.shield, d); e.shield -= s; d -= s; log(`องครักษ์รับดาเมจแทน ${s}${e.shield ? '' : ' จนแตกพ่าย'}`, 'warn');
    if (!d) { emit({ t: 'dmg', v: 0, col: '#9fb4cf' }); return 0; }
  }
  /* one blow fells at most one body of a pack, so multi-hit skills sweep it */
  if (e.pack) d = Math.min(d, Math.ceil(e.hp - (packLeft(e) - 1) * e.max / e.pack));
  e.hp = Math.max(0, e.hp - d); emit({ t: 'dmg', v: d, crit: c, col: o.col });
  log(`${c ? 'คริติคอล! ' : ''}คุณสร้างความเสียหาย ${d}`, c ? 'crit' : '');
  const ls = pv('ls') + (o.drain ? o.drain * 100 : 0); if (ls > 0) r.lsAcc += d * ls / 100;
  if (e.hp > 0 && pv('poisonhit') && Math.random() * 100 < pv('poisonhit')) { e.burn = Math.max(e.burn, 2); log(`${e.name} ติดดาเมจต่อเนื่อง`, 'warn'); }
  if (e.hp > 0 && pv('stunchance') && !r.stop && Math.random() * 100 < pv('stunchance')) { r.stop = 1; log(`${e.name} ชะงัก!`, 'sk'); }
  return d;
}
function heal(n, label = 'ฟื้น HP') { const b = S.hp; S.hp = Math.min(maxHp(), S.hp + Math.round(n * (1 + pv('healamp') / 100))); const got = S.hp - b; if (got > 0) { emit({ t: 'heal', v: got }); log(`${label} ${got}`, 'ok'); } }
/* shadows fight with their source monster's traits (SHADOW_FX in monsters.js) */
function shadowsAttack(mult) {
  const e = S.run.enemy; e.shAmb = e.shAmb || [];
  S.shadows.forEach((sh, i) => {
    if (e.hp <= 0) return; const t = shadowTraits(sh), swings = t.includes('pack') ? 2 : 1;
    for (let k = 0; k < swings && e.hp > 0; k++) {
      let m = mult * (swings > 1 ? .6 : 1);
      if (t.includes('ambush') && !e.shAmb.includes(i)) { m *= 2.5; e.shAmb.push(i); }
      if (t.includes('enrage') && e.hp < e.max * .4) m *= 1.6;
      const c = t.includes('evasive') && Math.random() < .3;
      let d = Math.max(1, Math.round(shAtk(sh) * m * (c ? 2 : 1) * rf(.85, 1.15) - (t.includes('ward') ? 0 : e.def * .5)));
      if (e.pack) d = Math.min(d, Math.ceil(e.hp - (packLeft(e) - 1) * e.max / e.pack));
      e.hp = Math.max(0, e.hp - d); emit({ t: 'sdmg', i, v: d }); log(`${sh.name} โจมตี ${d}${c ? ' (รุนแรง)' : ''}`, 'sh');
      if (t.includes('venom') && e.hp > 0 && Math.random() < .25) e.burn = Math.max(e.burn, 2);
      if (t.includes('drain')) S.hp = Math.min(maxHp(), S.hp + Math.round(d * .2));
    }
    if (t.includes('regen')) S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * .02));
  });
}
const shadowCover = () => Math.min(.3, .06 * S.shadows.filter(sh => shadowTraits(sh).includes('armored')).length);
/* each hero in the party acts once per player turn according to its role and personality */
function heroesAct() {
  const r = S.run, e = r.enemy, low = S.hp < maxHp() * .4;
  r.hturn = (r.hturn || 0) + 1; const skillTurn = r.hturn % HERO_SKILL_EVERY === 0;
  S.party.forEach((id, i) => {
    if (e.hp <= 0) return; const h = HERO[id], pw = heroPow(id), tr = S.heroes[id].trait;
    if (tr === 'coward' && S.hp >= maxHp() * .3 && Math.random() < .25) { emit({ t: 'hidle', i, text: 'แอบหลบ…' }); log(`${h.n} (ขี้ขลาด) แอบหลบอยู่ข้างหลัง`, ''); return; }
    if (tr === 'lazy' && Math.random() < .25) { emit({ t: 'hidle', i, text: 'zZz' }); log(`${h.n} (ขี้เกียจ) นอนอู้`, ''); return; }
    if (tr === 'kind' && Math.random() < .2 && S.hp < maxHp()) { const b = S.hp; S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * .05)); emit({ t: 'hheal', i, v: S.hp - b }); log(`${h.n} (ใจดี) ปฐมพยาบาลให้คุณ ${S.hp - b}`, 'ok'); return; }
    if (tr === 'cunning' && !e.cunning && Math.random() < .2) { e.cunning = 1; e.atk = Math.round(e.atk * .9); log(`${h.n} (เจ้าเล่ห์) วางกลลวง ATK ของ ${e.name} ลดลง`, 'sk'); }
    let mul = 1;
    if (tr === 'brave') mul *= 1.2;
    if (tr === 'coward' && S.hp < maxHp() * .3) mul *= 2;
    if (tr === 'lazy') mul *= 1.4;
    if (tr === 'reckless') mul *= 1.4;
    if (tr === 'loyal' && low) mul *= 1.5;
    if (tr === 'greedy') mul *= .9;
    if (tr === 'arrogant') mul *= e.boss || e.elite ? 1.35 : .85;
    const strike = (m, o = {}) => {
      if (tr === 'reckless' && Math.random() < .15) { emit({ t: 'hidle', i, text: 'พลาด!' }); log(`${h.n} (บ้าระห่ำ) ตีพลาด`, ''); return; }
      const roll = tr === 'playful' ? rf(.5, 1.9) : 1;
      const c = (id === 'vesper' && Math.random() < .35) || (tr === 'calm' && Math.random() < .2);
      let d = pw * m * mul * roll * rf(.88, 1.12) * (c ? (id === 'vesper' ? 2.2 : 1.8) : 1) - (o.pierce ? 0 : e.def * .5);
      d = Math.max(1, Math.round(d)); e.hp = Math.max(0, e.hp - d); emit({ t: 'hdmg', i, v: d, crit: c, col: STAR[h.star].col }); log(`${h.n} โจมตี ${d}${c ? ' (คริติคอล)' : ''}`, 'hero');
    };
    const turn = () => {
      if (e.hp <= 0) return;
      /* role skill: every few turns once the hero reaches HERO_SKILL_LV */
      if (skillTurn && (S.heroes[id].lv || 1) >= HERO_SKILL_LV) {
        emit({ t: 'hidle', i, text: '★ สกิล!' });
        if (h.role === 'dps') { strike(2.5); log(`${h.n} ใช้ท่าไม้ตาย`, 'hero'); }
        else if (h.role === 'mage') { strike(2, { pierce: true }); if (e.hp > 0) e.burn = Math.max(e.burn, 2); log(`${h.n} ใช้เวทระเบิด`, 'hero'); }
        else if (h.role === 'tank') { r.guard = Math.max(r.guard, 1); log(`${h.n} ยืนบังให้คุณ`, 'sk'); strike(.5); }
        else if (h.role === 'healer') { const b = S.hp; S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * .15)); emit({ t: 'hheal', i, v: S.hp - b }); log(`${h.n} ใช้ฟื้นฟูหมู่ ${S.hp - b}`, 'ok'); }
        else { if (!r.buff || r.buff.t <= 0 || r.buff.v < .2) r.buff = { v: .2, t: 2 }; log(`${h.n} ร้องเพลงปลุกใจ ATK +20%`, 'sk'); strike(.5); }
        return;
      }
      if (h.role === 'healer' && S.hp < maxHp() * .85) { const b = S.hp; S.hp = Math.min(maxHp(), S.hp + Math.round(pw * 1.3 * (tr === 'loyal' && low ? 1.5 : 1) * (1 + pv('healamp') / 100))); emit({ t: 'hheal', i, v: S.hp - b }); log(`${h.n} ฟื้น HP ให้คุณ ${S.hp - b}`, 'ok'); return; }
      if (h.role === 'dps') { strike(1); if (id === 'raiden' && e.hp > 0) strike(.8); }
      else if (h.role === 'mage') { strike(.95, { pierce: true }); if (e.hp > 0 && Math.random() < (id === 'opal' ? .5 : .2)) { e.burn = Math.max(e.burn, 2); log(`${h.n} เผาศัตรู`, 'warn'); } if (e.hp > 0 && id === 'aeon' && !r.stop && Math.random() < .15) { r.stop = 1; log(`${h.n} หยุดเวลาของศัตรู!`, 'sk'); } }
      else strike(id === 'leon' ? 1 : h.role === 'healer' ? .45 : .55);
    };
    turn(); if (tr === 'diligent' && Math.random() < .15) { log(`${h.n} (ขยัน) ลงมืออีกครั้ง!`, 'sk'); turn(); }
  });
}
function skillRef(ref) {
  if (ref === 'u') return S.awake ? { id: ultId(), g: 'C', ult: 1 } : null;
  if (ref === 's') return S.sub ? { id: 'sub_' + S.sub.id, g: S.sub.g, sub: 1 } : null;
  return S.act[+ref] || null;
}
function useSkill(ref) {
  const r = S.run, e = r.enemy, s = skillRef(ref); if (!s || fatigue() === 2) return false;
  const d = ACT[s.id], cost = mpCost(d); if (S.mp < cost || (s.ult && r.ucd > 0)) return false;
  S.mp -= cost; const q = GR[s.g].m, f = d.fx, col = s.ult ? glowOf() : skillCol(f); if (s.ult) r.ucd = ULT_CD;
  emit({ t: 'skill', name: d.n, col, ult: s.ult }); log(`ใช้สกิล${s.ult ? 'สุดยอด' : ''} [${d.n}]`, 'sk'); if (s.ult) A.shake = performance.now();
  if (weakHit(e, f)) log(`โจมตีจุดอ่อน [${WEAK[e.wk].n}]!`, 'crit');
  if (f.hpcost) { const c = Math.round(maxHp() * f.hpcost); S.hp = Math.max(1, S.hp - c); emit({ t: 'pself', v: c }); }
  if (f.heal) { heal(maxHp() * f.heal * q); if (r.poison) { r.poison = 0; log('ล้างพิษออกจากร่างแล้ว', 'ok'); } }
  if (f.guard) r.guard = Math.max(r.guard, f.guard);
  if (f.evade) r.evade = 1;
  if (f.buff) { r.buff = { v: f.buff * q, t: 3 }; log(`ATK เพิ่มขึ้น ${Math.round(f.buff * q * 100)}%`, 'sk'); }
  if (f.army) { if (S.shadows.length) shadowsAttack(f.army * q * (1 + skillPow() / 100)); else { log('ยังไม่มีเงาในกองทัพ พลังเงาระเบิดออกมาแทน', 'sh'); hitEnemy(1.6 * q, { pierce: true, col, skill: 1, fx: f }); } }
  if (f.m) {
    const hits = f.hits || 1, sb = f.statb ? stat(f.statb) * 2.5 : 0;
    for (let h = 0; h < hits && e.hp > 0; h++) hitEnemy(f.m * q, { pierce: f.pierce, force: f.crit, drain: f.drain, exec: f.exec, bonus: (f.missing ? (maxHp() - S.hp) * f.missing * q : 0) + sb, col, skill: 1, fx: f });
  }
  if (e.hp > 0) {
    if (f.burn) { e.burn = Math.max(e.burn, f.burn); log(`${e.name} ได้รับดาเมจต่อเนื่อง ${f.burn} เทิร์น`, 'warn'); }
    if (f.stun) { r.stop = Math.max(r.stop, f.stun); log(`${e.name} ขยับไม่ได้`, 'sk'); }
    if (f.weak && !e.weak) { e.weak = 1; e.atk = Math.round(e.atk * .75); log(`ATK ของ ${e.name} ลดลง`, 'sk'); }
  }
  return true;
}
export function act(arg) {
  const r = S.run; if (!r || r.state !== 'fight' || ui.busy) return; const e = r.enemy; let shDone = false;
  if (arg === 'atk') {
    emit({ t: 'patk' }); hitEnemy(1);
    if (e.hp > 0 && pv('extrahit')) hitEnemy(pv('extrahit') / 100);
    if (e.hp > 0 && pv('double') && Math.random() * 100 < pv('double')) { log('โจมตีซ้ำ!', 'sk'); hitEnemy(.7); }
  } else if (arg.startsWith('skill:')) {
    const ref = arg.split(':')[1]; if (!useSkill(ref)) return; const s = skillRef(ref); if (ACT[s.id].fx.army) shDone = true;
  } else if (arg === 'pot') { if (S.pot < 1) return; S.pot--; heal(maxHp() * .5 * potMul(), 'ดื่มยา ฟื้น HP'); }
  else if (arg === 'mpot') { if (S.mpot < 1) return; S.mpot--; const b = S.mp; S.mp = Math.min(maxMp(), S.mp + Math.round(maxMp() * .6 * potMul())); log(`ฟื้น MP ${S.mp - b}`, 'ok'); sfx('heal'); }
  else if (arg === 'flee') {
    const ch = (e.boss ? 25 : 50) + stat('agi') * .5; S.sta = Math.max(0, S.sta - FLEE_STA);
    if (Math.random() * 100 < ch) { S.run = null; sfx('miss'); sys(`หนีออกจากเกตสำเร็จ (สตามินา -${FLEE_STA}) รางวัลที่ได้ระหว่างทางยังอยู่ครบ`); done(); return; }
    log(`หนีไม่สำเร็จ! เสียสตามินา ${FLEE_STA}`, 'bad'); shDone = true;
  }
  if (!shDone && e.hp > 0 && S.shadows.length) shadowsAttack(1);
  if (arg !== 'flee' && e.hp > 0 && S.party.length) heroesAct();
  if (r.lsAcc >= 1) heal(r.lsAcc, 'ดูดซับ HP'); r.lsAcc = 0;
  checkPhase(e);
  if (e.hp <= 0) win();
  else if (arg !== 'flee' && pv('extraturn') && Math.random() * 100 < pv('extraturn')) { emit({ t: 'extra' }); log('[เวลาเหลื่อม] คุณได้เล่นต่อทันที', 'sk'); }
  else { enemyTurn(); if (r.state === 'fight' && e.hp <= 0) win(); }
  if (r.state !== 'dead') { const mr = (1 + Math.floor(stat('int') / 8) + pv('mpr')) * (r.affix === 'mana' ? 3 : 1); S.mp = Math.min(maxMp(), S.mp + mr); }
  save(); runAnim();
}
function enemyTurn() {
  const r = S.run, e = r.enemy, burning = e.burn > 0; e.turn++; checkPhase(e);
  if (e.burn > 0) { const d = Math.max(1, Math.round(e.max * (e.boss ? .03 : .05) * (1 + pv('burnamp') / 100))); e.hp = Math.max(0, e.hp - d); e.burn--; emit({ t: 'burn', v: d }); log(`${e.name} ได้รับดาเมจต่อเนื่อง ${d}`, 'warn'); if (e.hp <= 0) return; }
  /* regenerating foes heal unless something is burning them */
  if ((hasTr(e, 'regen') || e.ph === 'regen') && !burning && e.hp < e.max) { const h = Math.round(e.max * (e.ph === 'regen' ? .04 : .05)); e.hp = Math.min(e.max, e.hp + h); emit({ t: 'eheal', v: h }); log(`${e.name} ฟื้นตัว HP +${h}`, 'warn'); }
  if (r.ucd > 0) r.ucd--;
  if (r.stop > 0) { r.stop--; emit({ t: 'frozen' }); log(`${e.name} ขยับไม่ได้`, 'sk'); }
  else {
    /* a pack swings once per body still standing, each blow weaker; enrage and a rage phase hit harder */
    const heavy = e.boss && e.turn % e.heavyEvery === 0, n = e.pack ? packLeft(e) : 1;
    const am = (e.pack ? .45 : 1) * (hasTr(e, 'enrage') && e.hp < e.max * .4 ? 1.5 : 1) * (e.ph === 'rage' ? 1.25 : 1);
    for (let k = 0; k < n && S.hp > 0 && e.hp > 0; k++) enemyStrike(e, heavy, am);
    if (r.guard > 0) r.guard--;
  }
  if (r.buff && r.buff.t > 0) r.buff.t--;
  if (S.hp > 0) {
    const rg = pv('regen'); if (rg && S.hp < maxHp()) S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * rg / 100 * (1 + pv('healamp') / 100)));
    if (r.affix === 'mist') { const n = Math.max(1, Math.round(maxHp() * .03)); S.hp = Math.max(1, S.hp - n); log(`หมอกพิษกัดกร่อน HP ${n}`, 'bad'); }
    if (r.poison > 0) { const n = Math.max(1, Math.round(maxHp() * .04)); S.hp = Math.max(1, S.hp - n); r.poison--; emit({ t: 'poison', v: n }); log(`พิษกัดกร่อน HP ${n}${r.poison ? '' : ' (พิษหมดฤทธิ์)'}`, 'bad'); }
  }
  if (S.hp <= 0) {
    if (r.undyingLeft > 0) { r.undyingLeft--; S.hp = 1; emit({ t: 'undying' }); log(`[ปฏิเสธความตาย] คุณลุกขึ้นอีกครั้งด้วย HP 1 (เหลือ ${r.undyingLeft} ครั้ง)`, 'sk'); }
    else { const lost = Math.floor(S.gold * .3); S.gold -= lost; r.lost = lost; r.state = 'dead'; S.deaths++; S.sta = Math.max(0, S.sta - 10); emit({ t: 'pdie' }); log('คุณล้มลง…', 'bad'); return; }
  }
  if (e.boss && e.hp > 0 && (e.turn + 1) % e.heavyEvery === 0 && !r.stop) log(`${e.name} กำลังรวบรวมพลัง เทิร์นหน้าจะโจมตีรุนแรง`, 'warn');
}
function enemyStrike(e, heavy, am) {
  const r = S.run; emit({ t: 'eatk', heavy });
  if (r.evade) { r.evade = 0; emit({ t: 'miss' }); log(`หลบการโจมตีของ ${e.name} ได้อย่างสมบูรณ์`, 'ok'); return; }
  if (Math.random() * 100 < dodge()) { emit({ t: 'miss' }); log(`คุณหลบการโจมตีของ ${e.name}`, 'ok'); return; }
  let d = Math.max(1, Math.round(e.atk * am * (1 + (r.curse || 0)) * (heavy ? 1.7 : 1) * rf(.85, 1.15) * mitigation(e.lv))); if (r.guard > 0) d = Math.max(1, Math.round(d * .25));
  const cov = partyCover(); if (cov) d = Math.max(1, Math.round(d * (1 - cov / 100)));
  const scv = shadowCover(); if (scv) d = Math.max(1, Math.round(d * (1 - scv)));
  S.hp = Math.max(0, S.hp - d); emit({ t: 'pdmg', v: d, heavy }); log(`${e.name}${heavy ? ' ปล่อยท่าไม้ตาย!' : ' โจมตี'} คุณเสีย HP ${d}${cov ? ` (ฮีโร่แนวหน้ารับแทน ${cov}%)` : ''}${scv ? ` (เงาเกราะรับแทน ${Math.round(scv * 100)}%)` : ''}`, 'bad');
  if (hasTr(e, 'venom')) { if (!r.poison) log('คุณติดพิษ!', 'bad'); r.poison = 3; }
  if (hasTr(e, 'drain') && e.hp > 0) { const h = Math.min(e.max - e.hp, Math.round(d * .5)); if (h > 0) { e.hp += h; emit({ t: 'eheal', v: h }); log(`${e.name} ดูดชีวิต HP +${h}`, 'warn'); } }
  if (pv('thorns') && e.hp > 0) { const t = Math.max(1, Math.round(d * pv('thorns') / 100)); e.hp = Math.max(0, e.hp - t); emit({ t: 'dmg', v: t, col: '#7fe7ff' }); log(`สะท้อนดาเมจ ${t}`, 'sk'); }
  if (S.hp > 0 && e.hp > 0 && pv('counter') && Math.random() * 100 < pv('counter')) { log('สวนกลับ!', 'sk'); hitEnemy(.8); }
}
function win() {
  const r = S.run, e = r.enemy, af = AFX[r.affix], g = GATES[r.g]; S.kills++;
  const greedy = S.party.filter(id => S.heroes[id].trait === 'greedy').length;
  const dg = r.g === todayGate() ? DAILY_GATE_MUL : 1;
  const xp = Math.round(e.xp * (1 + pv('xp') / 100) * (af.xp || 1) * dg), gold = Math.round(e.gold * (1 + pv('gold') / 100 + greedy * .1) * (af.gold || 1) * dg);
  S.party.forEach(id => heroGainXp(id, Math.round(e.xp * .4)));
  questTick('kill'); if (e.elite) questTick('elite'); if (e.boss) questTick('boss');
  emit({ t: 'kill' }); S.gold += gold; r.loot.xp += xp; r.loot.gold += gold; log(`${e.name} ถูกกำจัด +${xp} EXP +${gold} ทอง`, 'ok'); gainXp(xp);
  if (pv('killheal')) { const b = S.hp; S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * pv('killheal') / 100)); if (S.hp > b) log(`ฟื้น HP ${S.hp - b} จากการสังหาร`, 'ok'); }
  if (pv('killmp')) S.mp = Math.min(maxMp(), S.mp + Math.round(maxMp() * pv('killmp') / 100));
  if (Math.random() < (e.elite ? .6 : .25)) { S.pot++; log('ได้รับ ยาฟื้นพลัง ×1', 'ok'); }
  if (e.elite) { const gm = 5 + rnd(0, 1) * 5; S.gems += gm; r.loot.gems += gm; log(`ได้รับ คริสตัลอัญเชิญ ${gm}`, 'ok'); }
  if (Math.random() < (e.boss ? .35 : e.elite ? .1 : .02)) dropItem(g.lv + (e.boss ? 6 : 3));
  if (specialWin(e)) { checkAch(); return; }
  if (e.boss) {
    S.cleared[r.g] = (S.cleared[r.g] || 0) + 1;
    stopBreak(r.g);
    const gm = 30 + r.g * 15; S.gems += gm; r.loot.gems += gm; log(`ได้รับ คริสตัลอัญเชิญ ${gm}`, 'crit');
    { const fe = rnd(2, 4) + r.g, st = rnd(2, 5) + r.g, wd = rnd(3, 6) + r.g; S.town.res.iron += fe; S.town.res.stone += st; S.town.res.wood += wd; log(`ได้รับวัสดุจากบอส ไม้ ${wd} · หิน ${st} · เหล็ก ${fe}`, 'ok'); }
    checkAch();
    if (g.trial) { log('[ระบบ] ผ่านบททดสอบแล้ว พลังที่หลับใหลกำลังตื่นขึ้น', 'sys'); r.state = 'awaken'; return; }
    if (Math.random() < .08) { S.stone++; log('ได้รับ หินปลุกพลังใหม่ ×1!', 'crit'); }
    log('[ระบบ] เคลียร์ดันเจี้ยนแล้ว เกตกำลังจะปิด', 'sys'); r.state = pv('extract') ? 'arise' : 'cleared';
  } else {
    r.state = 'won';
    if (r.affix === 'blessed') { const b = S.hp; S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * .1)); if (S.hp > b) log(`พรแห่งเกตฟื้น HP ${S.hp - b}`, 'ok'); }
  }
}
export function next() {
  const r = S.run; if (ui.busy) return; const c = staCost(ROOM_STA); S.sta = Math.max(0, S.sta - c);
  if (r.tower) { r.floor++; log(`ขึ้นไปชั้น ${r.floor} (สตามินา -${c})`, ''); startRoom(); done(); return; }
  r.stage++;
  log(`เดินลึกเข้าไป (สตามินา -${c})`, ''); if (S.sta === 0) log('คุณหมดแรง! ATK/DEF ลดลงอย่างหนักและใช้สกิลไม่ได้', 'bad');
  /* rooms 2 and 3 start at a fork: the hunter picks a door */
  if (r.stage < 3 && !GATES[r.g].trial) { r.doors = rollDoors(); r.state = 'doors'; r.enemy = null; r.room = null; r.obj = null; log('[ระบบ] ทางแยกข้างหน้ามีสองประตู', 'sys'); done(); return; }
  startRoom(); done();
}
export function arise() {
  const r = S.run, e = r.enemy; if (ui.busy || S.shadows.length >= maxSh()) return;
  r.tries--; const ch = Math.min(90, 40 + stat('int') * .4 + pv('arise'));
  if (Math.random() * 100 < ch) {
    const sh = { name: 'เงา·' + e.name, src: e.name, atk: Math.round(e.atk * .55 + S.lv), lv: S.lv, rank: GATES[r.g].r }; S.shadows.push(sh); r.state = 'cleared';
    log(`${sh.name} เข้าร่วมกองทัพ`, 'sh'); save(); sfx('arise');
    burst({ x: A.e.cx, y: A.e.cy }, '#a37bff', 40, true); addFx('ring', { x: A.e.cx, y: A.e.cy }, '#a37bff', true);
    setTimeout(() => openModal({ type: 'arise', name: e.name, atk: shAtk(sh) }), 650);
    commit(); return;
  }
  sfx('error'); log(r.tries > 0 ? `เงาไม่ตอบสนอง… (เหลือ ${r.tries} ครั้ง)` : 'ร่างของบอสสลายไปแล้ว', 'sh');
  if (r.tries <= 0) r.state = 'cleared'; done();
}

/* ================= ACTIONS ================= */
/* ================= META ================= */
export const canSweep = gi => { const g = GATES[gi]; return g && isRegular(g) && (S.cleared[gi] || 0) > 0 && S.lv >= g.lv + SWEEP_LV && !S.run; };
export const canAwaken2 = () => S.awake && !S.aw2 && S.lv >= AW2_LV && (S.cleared[AW2_GATE] || 0) > 0;
/* guild board: three distinct quest types a day */
function rollQuests() {
  const types = shuffle(Object.keys(QUEST_TYPES)).slice(0, 3);
  S.quests = types.map(type => { const res = pick(DELIVER_RES); return { type, res, need: QUEST_TYPES[type].need(S.lv), p: 0, done: false, rw: questReward(type, S.lv) }; });
  S.qDay = S.day;
}
function questTick(type) { for (const q of S.quests || []) if (q.type === type && !q.done) q.p = Math.min(q.need, q.p + 1); }
/* achievements are checked after notable events; each pays crystals once */
export function checkAch(quiet = false) {
  const now = ACHIEVEMENTS.filter(a => !S.ach[a.id] && a.test(S));
  now.forEach(a => { S.ach[a.id] = S.day; S.gems += a.gems; });
  if (!now.length) return;
  /* on load, achievements earned before they existed are granted in one summary */
  if (quiet) { sys(`ได้รับความสำเร็จย้อนหลัง ${now.length} รายการ +คริสตัล ${now.reduce((x, a) => x + a.gems, 0)} ดูได้ที่แท็บสมาคม`, 'lv'); return; }
  sfx('perk'); now.forEach(a => sys(`ความสำเร็จ [${a.n}] +คริสตัล ${a.gems}${a.title ? ` · ปลดล็อกฉายา "${a.title.n}"` : ''}`, 'lv'));
}
/* dungeon break: clearing the threatened gate's boss in time pays out; otherwise the town is raided */
function stopBreak(gi) {
  if (!S.brk || S.brk.g !== gi) return;
  const rw = breakReward(gi); S.gold += rw.gold; S.gems += rw.gems; S.stats.breaksStopped = (S.stats.breaksStopped || 0) + 1; S.brk = null;
  sys(`ปิดเกตได้ก่อนเกตแตก! สมาคมมอบทอง ${rw.gold} · คริสตัล ${rw.gems}`, 'lv');
}
function dayBreaks() {
  let raid = null;
  if (S.brk && S.day >= S.brk.due) {
    const lost = {}; for (const k of ['food', 'wood', 'stone', 'iron']) { lost[k] = Math.floor(S.town.res[k] * BREAK_LOSS); S.town.res[k] -= lost[k]; }
    lost.gold = Math.floor(S.gold * .1); S.gold -= lost.gold; raid = { g: S.brk.g, lost }; S.brk = null; sfx('heavy');
  }
  if (!S.brk && S.lv >= 3 && Math.random() < BREAK_CHANCE) {
    const pool = regularGates().filter(i => GATES[i].lv <= S.lv + 5);
    if (pool.length) { const g = pick(pool); S.brk = { g, due: S.day + BREAK_DAYS }; sys(`คำเตือน! ${GATES[g].name} กำลังจะเกตแตกภายใน ${BREAK_DAYS} วัน ล้มบอสให้ทันก่อนมอนสเตอร์บุกเมือง`, 'bad'); }
  }
  return raid;
}

/* secondary class: offered once the player reaches SUB_LV; weighted, no repeats, each with a grade */
function rollSubOffer() {
  const pool = [...SUBCLASSES], out = [];
  while (out.length < SUB_OFFER && pool.length) {
    let r = Math.random() * pool.reduce((a, x) => a + x.w, 0);
    const i = pool.findIndex(x => (r -= x.w) < 0); const sc = pool.splice(i < 0 ? 0 : i, 1)[0];
    out.push({ id: sc.id, g: rollGrade() });
  }
  return out;
}
function offerSub() {
  if (S && S.lv >= SUB_LV && !S.sub && !S.subOffer) { S.subOffer = rollSubOffer(); sys('ปลดล็อกคลาสรองแล้ว เลือกได้ที่หน้าสถานะ', 'lv'); }
}

export const H = {
  toCreate() { ui.draft = { name: 'Hunter', look: randomLook(), origin: 'student' }; openModal({ type: 'create' }); },
  look(k, v) { ui.draft.look = { ...ui.draft.look, [k]: v }; commit(); },
  randLook() { ui.draft.look = randomLook(); commit(); },
  origin(id) { ui.draft.origin = id; commit(); },
  name(v) { ui.draft.name = v; commit(); },
  confirmCreate() { const d = ui.draft; const n = (d.name || '').trim() || 'Hunter'; setS(newState(n, { ...d.look }, d.origin)); rollClass(true); },
  closeModal() { close(); },
  tab(t) { ui.tab = t; ui.confirmReset = false; ui.confirmDismantle = null; ui.confirmSell = null; ui.confirmRebirth = false; commit(); },
  addStat(k, n) {
    const m = Math.min(n, S.pts); if (!m) return;
    const hpPct = S.hp / maxHp(), before = PERK_TIERS.filter(t => stat(k) >= t).length;
    S.alloc[k] += m; S.pts -= m; if (k === 'vit') S.hp = Math.round(maxHp() * hpPct);
    const after = PERK_TIERS.filter(t => stat(k) >= t).length;
    for (let i = before; i < after; i++) { sfx('perk'); sys(`ปลดล็อกความสามารถ [${STAT_PERKS[k][i].n}] จาก ${k.toUpperCase()} ${PERK_TIERS[i]}`, 'sh'); }
    const c = cls(); if (!S.awake && k !== c.main && stat(k) >= AFF_NEED && stat(k) - m < AFF_NEED) sys(`เปิดสายตื่นรู้ใหม่: ${awName(c, k)}`, 'lv');
    done();
  },
  choose(i) {
    const o = S.pickOpts && S.pickOpts[+i]; if (!o) return;
    if (o.k === 'act') { S.act.push({ id: o.id, g: o.g }); sys(`ได้รับสกิล [${ACT[o.id].n}] เกรด ${o.g}`, 'lv'); }
    else if (o.k === 'pas') { S.pas.push({ id: o.id, g: o.g }); sys(`ได้รับสกิลติดตัว [${PAS[o.id].n}] เกรด ${o.g}`, 'lv'); }
    else { const s = S[o.w][o.i]; s.g = nextGrade(s.g); sys(`ยกระดับสกิลเป็นเกรด ${s.g}`, 'lv'); }
    sfx('perk'); S.picks--; S.pickOpts = null; save(); if (S.picks > 0) openPick(); else close();
  },
  enter, act, next, arise, openPick, summon, toggleParty,
  door, eventPick, enterHard(gi) { enter(gi, 'hard'); },
  awakenStart() { if (S.run && S.run.state === 'awaken') openModal({ type: 'awakenPath' }); },
  awaken,
  skipArise() { S.run.state = 'cleared'; log('คุณปล่อยให้ร่างของบอสสลายไป', 'sh'); done(); },
  leave() { S.run = null; sys('ออกจากเกตแล้ว'); done(); checkUnlocks(); },
  revive() { S.run = null; S.hp = Math.round(maxHp() * .3); S.mp = Math.round(maxMp() * .5); done(); checkUnlocks(); },
  quaff(k) {
    if (ui.busy) return;
    if (k === 'pot' && S.pot) { S.pot--; S.hp = Math.min(maxHp(), S.hp + Math.round(maxHp() * .5 * potMul())); }
    if (k === 'mpot' && S.mpot) { S.mpot--; S.mp = Math.min(maxMp(), S.mp + Math.round(maxMp() * .6 * potMul())); }
    if (k === 'spot' && S.spot && !S.run) { S.spot--; S.sta = Math.min(maxSta(), S.sta + 40); }
    sfx('heal'); done();
  },
  train(k) { const q = DAILY.find(d => d[0] === k); if (S.sta < TRAIN_STA || S.daily[k] >= q[2]) return; S.sta -= TRAIN_STA; S.daily[k] = Math.min(q[2], S.daily[k] + q[4]); if (dailyDone()) { sfx('perk'); sys('ภารกิจรายวันสำเร็จแล้ว รับรางวัลได้'); } done(); },
  claim() { if (!dailyDone() || S.daily.claimed) return; S.daily.claimed = true; S.pts += 3; S.gems += 50; gainXp(20 * S.lv); S.hp = maxHp(); S.mp = maxMp(); S.sta = Math.min(maxSta(), S.sta + 20); sfx('levelup'); sys('ได้รับแต้มสถานะ +3 คริสตัล +50 ฟื้นฟูร่างกายเต็ม และสตามินา +20', 'lv'); done(); },
  doActivity(id) {
    const a = ACTIVITIES.find(x => x.id === id); if (!a || S.today[id] >= a.max || S.sta < a.cost) return;
    S.sta -= a.cost; S.today[id]++;
    if (id === 'train2') { S.pts++; sfx('perk'); sys('ฝึกพิเศษเสร็จ ได้แต้มสถานะ +1', 'lv'); }
    if (id === 'job') { const g = jobGold(); S.gold += g; sfx('coin'); sys(`ทำงานคุ้มกันเสร็จ ได้ทอง ${g}`); }
    if (id === 'nap') { S.sta = Math.min(maxSta(), S.sta + 20); sfx('rest'); sys('งีบพักฟื้น สตามินา +20'); }
    done();
  },
  endDay() {
    if (!S.daily.claimed) { const lost = Math.floor(S.gold * .2); S.gold -= lost; S.hp = Math.max(S.hp, Math.round(maxHp() * .5)); S.mp = Math.max(S.mp, Math.round(maxMp() * .5)); S.sta = Math.round(maxSta() * .5); sfx('death'); sys(`คุณถูกส่งไปยังโซนลงโทษ… รอดมาได้แต่เสียทอง ${lost} และเหนื่อยล้า สตามินาเหลือครึ่งเดียว`, 'bad'); }
    else { S.hp = maxHp(); S.mp = maxMp(); S.sta = maxSta(); sfx('rest'); sys('พักผ่อนเต็มที่ HP, MP และสตามินาฟื้นฟูแล้ว'); }
    const rep = workDay();
    rep.raid = dayBreaks();
    S.day++; S.daily = { push: 0, sit: 0, squat: 0, run: 0, claimed: false }; S.today = freshToday();
    rollQuests(); checkAch();
    if (rep.lines.length || rep.mouths || rep.raid) openModal({ type: 'day', rep, day: S.day - 1 });
    done();
  },
  /* one click: train every daily quest as far as stamina allows */
  trainAll() {
    let any = false;
    for (const [k, , t, , step] of DAILY) while (S.daily[k] < t && S.sta >= TRAIN_STA && !S.daily.claimed) { S.sta -= TRAIN_STA; S.daily[k] = Math.min(t, S.daily[k] + step); any = true; }
    if (!any) return; sfx(dailyDone() ? 'perk' : 'click'); sys(dailyDone() ? 'ภารกิจรายวันครบแล้ว กดรับรางวัลได้เลย' : 'สตามินาหมดก่อนภารกิจจะครบ', dailyDone() ? 'lv' : 'bad'); done();
  },
  useRespec() {
    if (!S.respec || S.run) return;
    const back = Object.values(S.alloc).reduce((a, v) => a + v, 0); S.respec--; S.pts += back;
    S.alloc = { str: 0, agi: 0, int: 0, vit: 0, per: 0 }; S.hp = Math.min(S.hp, maxHp()); S.mp = Math.min(S.mp, maxMp());
    sfx('reveal'); sys(`ล้างแต้มสถานะแล้ว ได้แต้มคืน ${back}`, 'lv'); done();
  },
  toggleAuto() { ui.auto = !ui.auto; commit(); },
  /* auto-battle: one simple decision per turn, driven by the battle screen while ui.auto is on */
  autoStep() {
    const r = S.run; if (!ui.auto || !r || r.state !== 'fight' || ui.busy) return;
    if (S.hp < maxHp() * .35 && S.pot) return act('pot');
    const ok = (ref, s) => s && S.mp >= mpCost(ACT[s.id]) && fatigue() < 2 && !(ref === 'u' && r.ucd > 0);
    const opts = [['u', S.awake ? { id: ultId() } : null], ['s', S.sub ? { id: 'sub_' + S.sub.id } : null], ...S.act.map((x, i) => [String(i), x])];
    const pickSk = opts.find(([ref, sk]) => ok(ref, sk) && ACT[sk.id].fx.m);
    act(pickSk ? 'skill:' + pickSk[0] : 'atk');
  },
  /* sweep: re-clear a gate you've beaten at least once and outlevelled, for reduced rewards and no fight */
  sweep(gi) {
    gi = +gi; const g = GATES[gi]; if (!canSweep(gi)) return;
    const cost = staCost(g.sta) + 3 * staCost(ROOM_STA); if (S.sta < cost) { sfx('error'); sys(`สตามินาไม่พอ ต้องใช้ ${cost}`, 'bad'); return; }
    S.sta -= cost;
    const L = g.lv + 1, dg = gi === todayGate() ? DAILY_GATE_MUL : 1;
    const xp = Math.round(((10 + L * 6) * 3 + (10 + (L + 2) * 6) * 4) * SWEEP_MUL * (1 + pv('xp') / 100) * dg);
    const gold = Math.round(((6 + L * 3) * 3 + (6 + (L + 2) * 3) * 5) * SWEEP_MUL * (1 + pv('gold') / 100) * dg);
    const gm = Math.round((30 + gi * 15) * SWEEP_MUL), wd = rnd(3, 6) + gi, st = rnd(2, 5) + gi, fe = rnd(2, 4) + gi;
    S.gold += gold; S.gems += gm; S.town.res.wood += wd; S.town.res.stone += st; S.town.res.iron += fe; S.kills += 4;
    S.cleared[gi] = (S.cleared[gi] || 0) + 1; S.party.forEach(id => heroGainXp(id, Math.round(xp * .2)));
    for (let k = 0; k < 4; k++) questTick('kill'); questTick('boss'); stopBreak(gi);
    gainXp(xp); sfx('chest'); sys(`กวาด${g.name}เสร็จ EXP +${xp} · ทอง +${gold} · คริสตัล +${gm} · ไม้ ${wd} หิน ${st} เหล็ก ${fe}`, 'lv');
    checkAch(); done();
  },
  claimQuest(i) {
    const q = S.quests[+i]; if (!q || q.done) return;
    if (q.type === 'deliver') { if (S.town.res[q.res] < q.need) return; S.town.res[q.res] -= q.need; }
    else if (q.p < q.need) return;
    q.done = true; S.gold += q.rw.gold; S.gems += q.rw.gems; S.town.res.shards += q.rw.shards;
    S.stats.quests = (S.stats.quests || 0) + 1; sfx('coin'); sys(`ภารกิจสมาคมสำเร็จ ได้ทอง ${q.rw.gold} · คริสตัล ${q.rw.gems}${q.rw.shards ? ` · เศษวิญญาณ ${q.rw.shards}` : ''}`, 'lv');
    checkAch(); done();
  },
  setTitle(id) { S.title = S.title === id ? null : id; sfx('click'); done(); },
  awaken2() {
    if (!canAwaken2()) return; S.aw2 = true; S.hp = maxHp(); S.mp = maxMp();
    sfx('awaken'); openModal({ type: 'aw2' }); checkAch(); save();
  },
  rebirth() {
    if (S.lv < REBIRTH_LV || S.run) return;
    if (!ui.confirmRebirth) { ui.confirmRebirth = true; commit(); return; }
    ui.confirmRebirth = false; S.rebirth = (S.rebirth || 0) + 1;
    S.lv = 1; S.xp = 0; S.alloc = { str: 0, agi: 0, int: 0, vit: 0, per: 0 }; S.pts = REBIRTH_PTS * S.rebirth; S.picks = 0; S.pickOpts = null;
    S.hp = maxHp(); S.mp = maxMp(); S.sta = maxSta();
    sfx('arise'); openModal({ type: 'rebirth' }); checkAch(); save();
  },
  assign(bid, id) {
    if (!S.heroes[id] || !BLD[bid] || BLD[bid].hall > S.town.hall) return; const b = S.town.b[bid];
    if (b.w.includes(id)) return;
    if (b.w.length >= slotsOf(b.lv)) { sfx('error'); sys('ตำแหน่งงานเต็มแล้ว อัปเกรดสิ่งก่อสร้างเพื่อเพิ่มช่อง', 'bad'); return; }
    quitJob(id); S.party = S.party.filter(x => x !== id); b.w.push(id); sfx('click'); done();
  },
  unassign(id) { quitJob(id); done(); },
  upgrade(bid) {
    const b = S.town.b[bid], c = upCost(b.lv); if (b.lv >= maxBlv(S.town.hall) || BLD[bid].hall > S.town.hall || !canPay(c)) return;
    pay(c); b.lv++; sfx('levelup'); sys(`${BLD[bid].n} อัปเกรดเป็นเลเวล ${b.lv}`, 'lv'); done();
  },
  upgradeHall() {
    const T = S.town, c = hallCost(T.hall); if (T.hall >= MAX_HALL || !canPay(c)) return;
    pay(c); T.hall++; sfx('awaken');
    const opened = BUILDINGS.filter(b => b.hall === T.hall).map(b => b.n);
    sys(`ศาลากลางอัปเป็นระดับ ${T.hall}${opened.length ? ` · เปิด ${opened.join(', ')}` : ''}`, 'lv'); done();
  },
  /* dismantle a hero into soul shards + crystals (asks twice) */
  dismantle(id) {
    const o = S.heroes[id]; if (!o || S.run) return;
    if (ui.confirmDismantle !== id) { ui.confirmDismantle = id; commit(); return; }
    const h = HERO[id], sh = shardsOf(h.star, o.lim), gm = gemsOf(h.star);
    quitJob(id); S.party = S.party.filter(x => x !== id); delete S.heroes[id];
    S.town.res.shards += sh; S.gems += gm; ui.confirmDismantle = null; S.stats.dismantled = (S.stats.dismantled || 0) + 1; checkAch();
    sfx('shadow'); sys(`ย่อย ${h.n} แล้ว ได้เศษวิญญาณ ${sh} และคริสตัล ${gm}`, 'sh'); done();
  },
  buy(k) {
    const cost = { pot: 20 + S.lv * 2, mpot: 18 + S.lv * 2, spot: 40 + S.lv * 2, stone: 400, gems: 500, respec: respecCost(S.lv) }[k];
    if (!cost || S.gold < cost) return;
    if (k === 'spot') { if (S.today.spot >= SPOT_PER_DAY) return; S.today.spot++; }
    S.gold -= cost; sfx('coin');
    if (k === 'pot') S.pot++; if (k === 'mpot') S.mpot++; if (k === 'spot') S.spot++; if (k === 'stone') S.stone++; if (k === 'gems') S.gems += 100; if (k === 'respec') S.respec = (S.respec || 0) + 1;
    done();
  },
  buyItem(id) {
    const it = ITEM[id]; if (!it || S.inv.includes(id) || S.gold < it.p || S.lv < it.lv) return;
    S.gold -= it.p; S.inv.push(id); sfx('coin'); sys(`ซื้อ ${it.n} แล้ว`); H.equip(id);
  },
  equip(id) {
    const it = ITEM[id]; if (!it || !S.inv.includes(id) || S.run) return;
    const hpPct = S.hp / maxHp(); S.eq[it.slot] = id; S.hp = Math.max(1, Math.round(maxHp() * hpPct)); S.mp = Math.min(S.mp, maxMp());
    sfx('click'); done();
  },
  /* sell an owned item for SELL_RATE of its shop price (asks twice; worn items must be taken off first) */
  sellItem(id) {
    const it = ITEM[id]; if (!it || !S.inv.includes(id) || S.run || !it.p || Object.values(S.eq).includes(id)) return;
    if (ui.confirmSell !== id) { ui.confirmSell = id; commit(); return; }
    const g = sellPrice(it); S.inv = S.inv.filter(x => x !== id); S.gold += g; ui.confirmSell = null;
    sfx('coin'); sys(`ขาย ${it.n} ได้ทอง ${g}`); done();
  },
  unequip(slot) {
    if (S.run || !S.eq[slot] || slot === 'body') return;
    const hpPct = S.hp / maxHp(); S.eq[slot] = null; S.hp = Math.max(1, Math.round(maxHp() * hpPct)); done();
  },
  pickSub(i) {
    const o = S.subOffer && S.subOffer[+i]; if (!o) return;
    S.sub = { id: o.id, g: o.g }; S.subOffer = null; sfx('reveal'); sys(`ได้รับคลาสรอง [${SUB[o.id].name}] เกรด ${o.g}`, 'lv'); close(); done();
  },
  rerollSub() {
    if (!S.subOffer || S.stone < SUB_REROLL) return;
    S.stone -= SUB_REROLL; S.subOffer = rollSubOffer(); sfx('roll'); done();
  },
  openSub() { if (S.subOffer) openModal({ type: 'sub' }); },
  useStone() { if (!S.stone || S.run) return; S.stone--; save(); rollClass(false); },
  switchCls(id) { const c = CLASSES.find(x => x.id === id); if (!c || !S.unlocked.includes(id) || S.run) return; assignClass(c); sfx('reveal'); openModal({ type: 'reveal', first: false }); },
  release(i) { const sh = S.shadows.splice(+i, 1)[0]; if (sh) sys(`${sh.name} กลับคืนสู่ความมืด`, 'sh'); done(); },
  reset() {
    if (!ui.confirmReset) { ui.confirmReset = true; commit(); return; }
    wipe(); setS(null); ui.confirmReset = false; ui.tab = 'gates'; ui.modal = { type: 'intro' }; commit();
  },
};
