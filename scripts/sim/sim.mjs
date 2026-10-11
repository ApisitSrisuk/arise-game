/* Balance simulator: plays the real game engine headlessly with a simple bot and reports
   how often each class clears each gate at a given level.

   node scripts/sim/sim.mjs                       full report (gate curve + level each class needs per gate)
   node scripts/sim/sim.mjs --class fighter --gate C --level 15   one data point in detail
   options: --n <runs per point> --seed <n> --target <clear rate, default .8> --gates E,D,C
            --gear mid|shop|none (default mid: best gear up to 70% of the level; shop: up to the level; none: starter gear) --daily <stat points per in-game day, default 3>
   node scripts/sim/sim.mjs --only gates | --only special   just sections 1–2, or rank exams + tower
   node scripts/sim/sim.mjs --probe [raw] [--levels 1,10,20]   player damage per turn vs foe HP, for re-fitting foeBase()

   Every character is rebuilt per run, so skill/grade/subclass rolls are averaged out.
   Random is seeded: the same command gives the same numbers, so before/after a balance change compare cleanly. */
import { OPT, reseed, parseArgs, E, D, R, MO, S, build, botTurn, GATES, TRIAL, gateIdx, opts, baseLv, point, dayPoint, levelNeeded, pct, pad, median, avgOf, examPoint, towerClimb } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
reseed(+args.seed || 1);
if (args.gear) OPT.gear = args.gear;
if (args.daily != null) OPT.daily = +args.daily;

const n = +args.n || 60, target = +args.target || .8, t0 = Date.now();
const gateList = args.gates ? String(args.gates).split(',').map(gateIdx) : GATES.map((g, i) => i).filter(i => !GATES[i].tower && !GATES[i].exam);
const atLv = (gi, d) => Math.max(gi === TRIAL ? D.AWAKE_LV : 1, baseLv(gi) + d);

/* probe: player damage per turn against a dummy, and how many turns/hits that means against real foes at the gate level */
if (args.probe) {
  const classes = D.CLASSES.filter((c, i) => i % 2 === 0);
  console.log('gate (lv)            player dmg/turn   mob HP   turns to kill mob  boss   |  mob hits to kill you  boss heavy hits');
  const pts = args.levels ? String(args.levels).split(',').map(v => ({ gi: Math.max(0, GATES.findIndex((g, i) => i !== TRIAL && g.lv > +v) - 1), L: +v }))
    : gateList.filter(i => i !== TRIAL).map(gi => ({ gi, L: GATES[gi].lv }));
  for (const { gi, L } of pts) {
    const g = GATES[gi], fb = MO.foeBase(L + 1.5), bb = MO.foeBase(L + 3.5), acc = { dpt: 0, hp: 0, mit: 0 }; let k = 0;
    for (const c of classes) for (let i = 0; i < 6; i++) {
      build(c.id, L, opts(gi, L)); E.enter(gi); let guard = 0;
      while (S().run && S().run.state !== 'fight' && guard++ < 10) E.next();
      const r = S().run; if (!r || r.state !== 'fight') continue;
      const e = r.enemy; Object.assign(e, { hp: 1e9, max: Math.round(fb.hp), atk: 0, tr: [], pack: 0, p2: null, wk: null, def: Math.floor((L + 1.5) * .9) });
      for (let t = 0; t < 12; t++) { r.stop = 0; botTurn(); }
      acc.dpt += (1e9 - e.hp) / 12; acc.hp += R.maxHp(); acc.mit += R.mitigation(L + 1.5); k++;
    }
    const dpt = acc.dpt / k, php = acc.hp / k, mit = acc.mit / k;
    const mobT = fb.hp / dpt, bossT = bb.hp * 2.2 / dpt, mobH = php / (fb.atk * mit), bossH = php / (bb.atk * 1.2 * 1.9 * mit);
    if (args.probe === 'raw') { console.log(`${L} ${dpt.toFixed(1)} ${php.toFixed(0)} ${mit.toFixed(3)}`); continue; }
    console.log(`${g.r} (${L})`.padEnd(20) + dpt.toFixed(0).padStart(12) + fb.hp.toFixed(0).padStart(11) + mobT.toFixed(1).padStart(14) + bossT.toFixed(1).padStart(10) + '   |' + mobH.toFixed(1).padStart(14) + bossH.toFixed(1).padStart(18));
  }
  process.exit(0);
}
/* rank exams at the level each opens, and how high the tower goes at endgame levels */
/* weighted by roll odds (CLASSES w), like tune.mjs: the numbers describe the classes most players actually get */
if (args.only === 'special') {
  const classes = D.CLASSES.filter(c => c.w >= 1), ws = classes.reduce((a, c) => a + c.w, 0), m = Math.max(10, n / 3 | 0);
  console.log('Rank exam pass rate when taken at the level it opens (mid gear, weighted by roll odds):');
  for (const rk of ['D', 'C', 'B', 'A', 'S']) console.log(`  rank ${rk}: ${pct(classes.reduce((a, c) => a + examPoint(c.id, rk, m) * c.w, 0) / ws)}`);
  console.log('Tower: floors cleared in one climb from floor 1 (median, classes sampled by roll odds):');
  for (const L of [46, 50, 55, 60, 70]) {
    const fl = []; for (const c of classes) for (let i = 0; i < Math.max(2, Math.round(c.w / 2)); i++) fl.push(towerClimb(c.id, L));
    console.log(`  lv ${L}: median floor ${median(fl)}  (best ${Math.max(...fl)})`);
  }
  process.exit(0);
}
if (args.class) {
  const gi = gateIdx(args.gate || 'E'), L = +args.level || baseLv(gi), m = +args.n || 300, p = point(args.class, gi, L, m), d = dayPoint(args.class, gi, L, m);
  console.log(`${args.class} @ ${GATES[gi].name} (${GATES[gi].r}, lv ${GATES[gi].lv}) player lv ${L}`);
  console.log(`  first run of the day: clear ${pct(p.rate)}  died in rooms ${pct(p.room)}  died at boss ${pct(p.boss)}  timeout ${pct(p.timeout)}  turns/fight ${p.perFight.toFixed(1)}  potions ${p.pots.toFixed(1)}`);
  console.log(`  whole day:            runs ${d.runs.toFixed(1)}  clears ${d.clears.toFixed(1)}  days ending in death ${pct(d.deathDays)}`);
} else {
  /* sections 1–2 weight classes by roll odds (the typical player); section 3 lists every class */
  const classes = D.CLASSES, m = Math.max(10, n / 3 | 0), wc = classes.filter(c => c.w >= 1), ws = wc.reduce((a, c) => a + c.w, 0);
  const wavg = (ps, k) => ps.reduce((a, p, i) => a + p[k] * wc[i].w, 0) / ws;
  console.log(`\nArise balance sim  (runs/point ${n}, seed ${args.seed || 1}, target ${target * 100}% clear, gear ${OPT.gear}, ${OPT.daily} pts/day)\n`);
  const offs = [-6, -3, 0, 3];
  console.log('1) First run of the day: clear rate (weighted by roll odds), by player level relative to the gate');
  console.log('gate'.padEnd(26) + offs.map(d => pad(d > 0 ? `+${d}` : d, 6)).join('') + '   turns/fight@+0  potions@+0');
  for (const gi of gateList) {
    let at0 = null; const cells = offs.map(d => { const ps = wc.map(c => point(c.id, gi, atLv(gi, d), m)); if (d === 0) at0 = ps; return pct(wavg(ps, 'rate')) + ' '; });
    console.log(`${GATES[gi].r} ${GATES[gi].name} (lv ${GATES[gi].lv})`.padEnd(26) + cells.join('') + wavg(at0, 'perFight').toFixed(1).padStart(12) + wavg(at0, 'pots').toFixed(1).padStart(12));
  }
  console.log('\n2) Whole day at the gate level (HP/MP carry over, stop after a death)');
  console.log('gate'.padEnd(26) + '  runs  clears  days-ending-in-death');
  for (const gi of gateList) {
    const ps = wc.map(c => dayPoint(c.id, gi, baseLv(gi), m));
    console.log(`${GATES[gi].r} ${GATES[gi].name} (lv ${GATES[gi].lv})`.padEnd(26) + wavg(ps, 'runs').toFixed(1).padStart(6) + wavg(ps, 'clears').toFixed(1).padStart(8) + pct(wavg(ps, 'deathDays')).padStart(10));
  }
  if (args.only === 'gates') process.exit(0);
  console.log(`\n3) Level each class needs to clear each gate ${target * 100}% of the time on the first run ("-" = not even at gate lv +24)`);
  console.log('class'.padEnd(16) + 'rar ' + gateList.map(gi => pad(GATES[gi].r, 5)).join('') + '   vs median');
  const rows = classes.map(c => ({ c, need: gateList.map(gi => levelNeeded(c.id, gi, n, target)) }));
  const med = gateList.map((_, j) => median(rows.map(r => r.need[j])));
  for (const r of rows) {
    const diffs = r.need.map((v, j) => v != null && med[j] != null ? v - med[j] : null).filter(v => v != null);
    const dv = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;
    console.log(r.c.id.padEnd(16) + String(r.c.rar).padEnd(4) + r.need.map(v => pad(v ?? '-', 5)).join('') + '   ' + (dv == null ? '' : (dv > 0 ? '+' : '') + dv.toFixed(1)));
  }
  console.log('median'.padEnd(20) + med.map(v => pad(v ?? '-', 5)).join(''));
  console.log('gate lv'.padEnd(20) + gateList.map(gi => pad(GATES[gi].lv, 5)).join(''));
  console.log(`\n"vs median": average levels above (+, weaker) or below (-, stronger) the median class.  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
process.exit(0);
