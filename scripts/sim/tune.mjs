/* Tunes FOE_K in src/game/monsters.js so each gate plays as intended at its own level, for a player with
   mid gear (best items up to 70% of their level): about --turns turns per fight counting the boss (default 4,
   i.e. ~3 per mob and ~6–7 for the boss) and about --pots HP potions drunk per run (per gate E..S, default
   .5,.8,1,1,1,1 so a fresh character isn't walled). Monster HP sets the fight length and monster ATK sets the
   attrition; the clear rate that results is printed as a check. Classes count by their roll odds (CLASSES w),
   so the common classes most players get decide the curve. Each knob is searched around its current value.

   node scripts/sim/tune.mjs [--n 24] [--rounds 2] [--write]
   Without --write it only prints the FOE_K line; with --write it puts it into monsters.js. */
import { readFileSync, writeFileSync } from 'node:fs';
import { OPT, reseed, parseArgs, D, MO, GATES, point, pct } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
OPT.gear = args.gear || 'mid';
const n = +args.n || 24, rounds = +args.rounds || 2, wantTurns = +args.turns || 4;
const wantPots = String(args.pots || '.5,.8,1,1,1,1').split(',').map(Number);
const classes = D.CLASSES.filter(c => c.w >= 1), wsum = classes.reduce((a, c) => a + c.w, 0);
const wavg = (ps, k) => ps.reduce((a, p, i) => a + p[k] * classes[i].w, 0) / wsum;
/* each FOE_K anchor is the mob level (gate lv + 1.5) of one regular gate; gates without an anchor follow by interpolation */
const gates = MO.FOE_K.lv.map(f => GATES.findIndex(g => !g.trial && !g.tower && !g.exam && g.lv + 1.5 === f));
const K = MO.FOE_K;

/* same seed for every measurement, so a knob change is the only thing that moves the result */
const measure = gi => { reseed(7); const ps = classes.map(c => point(c.id, gi, GATES[gi].lv, n)); return { turns: wavg(ps, 'perFight'), clear: wavg(ps, 'rate'), pots: wavg(ps, 'pots') }; };
/* geometric bisection of one knob within ×/÷ 4 of its current value; `rises` = whether the metric goes up with the knob */
function bisect(arr, j, metric, want, rises) {
  let lo = arr[j] / 4, hi = arr[j] * 4;
  for (let i = 0; i < 8; i++) { const mid = Math.sqrt(lo * hi); arr[j] = mid; if ((metric() < want) === rises) lo = mid; else hi = mid; }
  arr[j] = +Math.sqrt(lo * hi).toFixed(3);
}

const t0 = Date.now();
for (let round = 1; round <= rounds; round++) {
  for (const gi of gates) {
    const j = gates.indexOf(gi);
    bisect(K.hp, j, () => measure(gi).turns, wantTurns, true);
    bisect(K.atk, j, () => measure(gi).pots, wantPots[j] ?? 1, true);
    const m = measure(gi);
    console.log(`round ${round}  ${GATES[gi].r} (lv ${GATES[gi].lv})  hp ×${K.hp[j]}  atk ×${K.atk[j]}  →  turns/fight ${m.turns.toFixed(1)}  potions ${m.pots.toFixed(2)}  clear ${pct(m.clear)}`);
  }
}
const line = `export const FOE_K = { lv: [${K.lv.join(', ')}], hp: [${K.hp.join(', ')}], atk: [${K.atk.join(', ')}] };`;
console.log('\n' + line + `\n(${((Date.now() - t0) / 1000).toFixed(0)}s)`);
if (args.write) {
  const p = new URL('../../src/game/monsters.js', import.meta.url), src = readFileSync(p, 'utf8');
  if (!/^export const FOE_K = .*$/m.test(src)) throw new Error('FOE_K line not found in monsters.js');
  writeFileSync(p, src.replace(/^export const FOE_K = .*$/m, line)); console.log('written to src/game/monsters.js');
}
process.exit(0);
