import { S } from './store.js';
import { CLASSES, ORIG, PAS, GR, FLATK, STATS, PERK_TIERS, STAT_PERKS, AFFINITY, AFF_NEED, DAILY, ACT, fxText } from './data.js';
import { fmt } from './util.js';
import { ITEM } from './items.js';
import { SUB, SUB_PAIR } from './subclass.js';
import { HALL_FX } from './town.js';
import { ACH, AW2_STATS, AW2_FX, REBIRTH_FX } from './meta.js';
import { meIdOf } from '../art/sprites.js';

/* equipment */
export const eqItems = () => Object.values(S.eq || {}).map(id => ITEM[id]).filter(Boolean);
export const eqSt = k => eqItems().reduce((a, i) => a + (i.st[k] || 0), 0);
export const myId = (o = {}) => meIdOf({ look: S.look, eq: S.eq, glow: S.awake ? awGlow() : null, path: S.awake ? awPath() : 'pure', ...o });
/* secondary class: grade multiplier, ×SUB_PAIR when it pairs with the main class */
export const subDef = () => S.sub && SUB[S.sub.id];
export const subPaired = () => { const sc = subDef(); return !!sc && sc.pair.includes(S.cls); };
export const subMul = () => GR[S.sub.g].m * (subPaired() ? SUB_PAIR : 1);

export const cls = () => CLASSES.find(c => c.id === S.cls);
export const rc = r => r === '???' ? 'X' : r;

/* awakening path: 'pure' = the class's own awakening; a stat key = hybrid path chosen from that stat */
export const awPath = (c = cls()) => {
  const p = S.awPath;
  return !p || p === 'pure' || !AFFINITY[p] || (c && p === c.main) ? 'pure' : p;
};
export const awTrait = (c = cls()) => awPath(c) === 'pure' ? c.aw.trait : AFFINITY[awPath(c)].trait;
export const ultId = (c = cls()) => awPath(c) === 'pure' ? 'u_' + c.id : 'a_' + awPath(c);
export const awName = (c = cls(), path = awPath(c)) => path === 'pure' ? c.aw.name : c.name + AFFINITY[path].suf;
export const awGlow = (c = cls(), path = awPath(c)) => path === 'pure' ? c.aw.glow : AFFINITY[path].glow;

export const stat = k => {
  const c = cls(), o = ORIG[S.origin] || {};
  return Math.max(0, (c ? c.base[k] : 0) + ((o.st || {})[k] || 0) + (S.alloc[k] || 0) + (S.awake ? 8 : 0) + (S.aw2 ? AW2_STATS : 0));
};
/* perks unlocked by a stat's total value */
export const perksOf = k => STAT_PERKS[k].filter((p, i) => stat(k) >= PERK_TIERS[i]);
export function pv(k) {
  let s = 0; const c = cls();
  if (c) { s += c.trait.fx[k] || 0; if (S.awake) s += awTrait(c).fx[k] || 0; }
  for (const p of S.pas) { const d = PAS[p.id]; if (d && d.fx[k] != null) s += FLATK.has(k) ? d.fx[k] : d.fx[k] * GR[p.g].m; }
  const sc = subDef(); if (sc && sc.fx[k] != null) s += FLATK.has(k) ? sc.fx[k] : sc.fx[k] * subMul();
  for (const i of eqItems()) s += i.fx[k] || 0;
  if (S.town && HALL_FX[k]) s += HALL_FX[k] * (S.town.hall - 1);
  const tt = S.title && ACH[S.title] && ACH[S.title].title; if (tt && tt.fx[k]) s += tt.fx[k];
  if (S.aw2 && AW2_FX[k]) s += AW2_FX[k];
  if (S.rebirth && REBIRTH_FX[k]) s += REBIRTH_FX[k] * S.rebirth;
  for (const [sk] of STATS) for (const p of perksOf(sk)) s += p.fx[k] || 0;
  const o = ORIG[S.origin]; if (o && o.fx && o.fx[k]) s += o.fx[k];
  return s;
}
export const pvOf = (c, k) => (c.trait.fx[k] || 0) + (S.awake ? (awTrait(c).fx[k] || 0) : 0);

export const maxHp = () => Math.round((100 + stat('vit') * 12 + S.lv * 10 + eqSt('hp')) * (1 + pv('hpmax') / 100));
export const maxMp = () => Math.round((30 + stat('int') * 5 + S.lv * 2) * (1 + pv('mpmax') / 100));
export const maxSta = () => Math.round((100 + Math.floor(S.lv * 1.5) + pv('stamflat')) * (1 + pv('stam') / 100));
export const fatigue = () => S.sta <= 0 ? 2 : S.sta < maxSta() * .3 ? 1 : 0;
export const FAT = [{ n: 'สดชื่น', c: 'ok', d: 'ไม่มีบทลงโทษ' }, { n: 'เหนื่อยล้า', c: 'warn', d: 'ATK และ DEF -15% · หลบหลีก -5%' }, { n: 'หมดแรง', c: 'bad', d: 'ATK และ DEF -35% · หลบหลีก -10% · ใช้สกิลไม่ได้' }];
/* every class benefits from STR on top of its main stat, so raising STR always pays off */
export function atk() {
  let m = 1 + pv('atkp') / 100; const r = S.hp / maxHp(), c = cls();
  if (r < .4) m += pv('berserk') / 100; if (r < .5) m += pv('lowhpboost') / 100;
  if (S.run && S.run.buff && S.run.buff.t > 0) m += S.run.buff.v; m -= [0, .15, .35][fatigue()];
  const str = c.main === 'str' ? 0 : stat('str');
  return Math.max(1, Math.round((6 + stat(c.main) * 3 + str + S.lv * 1.5 + eqSt('atk')) * m));
}
/* share of a hit that gets through DEF: diminishing returns, scaled to the attacker's level so DEF never makes you immune */
export const mitigation = foeLv => { const d = def(); return 1 - d / (d + 10 + foeLv * 4); };
export function def() { let m = 1 + pv('defp') / 100; if (S.hp / maxHp() < .5) m += pv('lowhpboost') / 100; m -= [0, .15, .35][fatigue()]; return Math.max(0, Math.round((stat('vit') * .8 + eqSt('def')) * m)); }
export const crit = () => Math.min(75, 5 + stat('agi') * .5 + pv('crit'));
export const critMul = () => 1.8 + pv('critdmg') / 100;
export const dodge = () => Math.max(0, Math.min(45, stat('per') * .4 + stat('agi') * .2 + pv('dodge') - [0, 5, 10][fatigue()]));
/* INT powers every class's skills */
export const skillPow = () => pv('skillamp') + stat('int') * .5;
export const mpCost = d => Math.max(1, Math.round(d.mp * (1 - Math.min(50, pv('manaflow')) / 100)));
export const staCost = n => Math.max(1, Math.ceil(n * (1 - Math.min(50, pv('stasave')) / 100)));
export const potMul = () => 1 + pv('potion') / 100;
export const xpNeed = () => Math.round(40 * Math.pow(S.lv, 1.6));
export const maxSh = () => 2 + Math.floor(S.lv / 8) + pv('shslots');
export const shSrc = sh => sh.src || sh.name.replace('เงา·', '');
export const shAtk = sh => Math.round(sh.atk * (1 + Math.max(0, S.lv - sh.lv) * .04) * (1 + pv('shadowp') / 100));
export const rank = () => S.lv < 5 ? 'E' : S.lv < 12 ? 'D' : S.lv < 20 ? 'C' : S.lv < 30 ? 'B' : S.lv < 45 ? 'A' : 'S';
export const dailyDone = () => DAILY.every(([k, , t]) => S.daily[k] >= t);
export const jobName = () => { const c = cls(); return S.awake ? awName(c) + (S.aw2 ? ' ขั้นที่ 2' : '') : c.name; };
export const glowOf = () => { const c = cls(); return S.awake ? awGlow(c) : '#58c4ff'; };
export const jobGold = () => Math.round((40 + S.lv * 10) * (1 + pv('gold') / 100));

/* hybrid paths the player currently qualifies for */
export const openPaths = (c = cls()) => STATS.map(([k]) => k).filter(k => k !== c.main && stat(k) >= AFF_NEED);

export function actDesc(id, g) {
  const f = ACT[id].fx, q = GR[g].m, p = [];
  if (f.m) p.push(`${f.hits > 1 ? `โจมตี ${f.hits} ครั้ง ครั้งละ` : 'โจมตี'} ${fmt(f.m * q)} เท่า`);
  if (f.statb) p.push(`บวกดาเมจตามค่า ${f.statb.toUpperCase()}`);
  if (f.army) p.push(`เงาทุกตัวโจมตีพร้อมกัน ${fmt(f.army * q)} เท่า`);
  if (f.pierce) p.push('ทะลุเกราะ'); if (f.crit) p.push('คริติคอลแน่นอน'); if (f.exec) p.push('ดาเมจ ×3 ถ้าศัตรู HP ต่ำกว่า 30%');
  if (f.missing) p.push('ยิ่ง HP เหลือน้อยยิ่งแรง'); if (f.drain) p.push(`ดูด HP ${Math.round(f.drain * 100)}% ของดาเมจ`);
  if (f.burn) p.push(`ดาเมจต่อเนื่อง ${f.burn} เทิร์น`); if (f.stun) p.push(`ศัตรูขยับไม่ได้ ${f.stun} เทิร์น`); if (f.weak) p.push('ลด ATK ศัตรู 25%');
  if (f.guard) p.push(`ลดดาเมจที่ได้รับ 75% นาน ${f.guard} เทิร์น`); if (f.evade) p.push('หลบการโจมตีครั้งถัดไปแน่นอน');
  if (f.heal) p.push(`ฟื้น HP ${Math.round(f.heal * q * 100)}%`); if (f.buff) p.push(`ATK +${Math.round(f.buff * q * 100)}% นาน 3 เทิร์น`); if (f.hpcost) p.push(`แลกด้วย HP ${Math.round(f.hpcost * 100)}%`);
  return p.join(' · ');
}
export const pasDesc = (id, g) => fxText(PAS[id].fx, GR[g].m);
export function skillCol(f) { return f.army ? '#a37bff' : f.burn ? '#ff8a3d' : f.stun ? '#7fe7ff' : (f.drain || f.hpcost) ? '#ff3355' : (f.heal && !f.m) ? '#4fdc9b' : f.guard ? '#58c4ff' : '#ffd34d'; }
