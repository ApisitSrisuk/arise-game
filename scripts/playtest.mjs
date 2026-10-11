/* Full-game playtest: drives the real engine for N in-game days per run (no browser).
   Usage: node scripts/playtest.mjs [runs=3] [days=40] */
globalThis.performance ??= { now: () => Date.now() };
const G = new URL('../src/game/', import.meta.url).href;
const st = await import(G + 'store.js');
const E = await import(G + 'engine.js');
const R = await import(G + 'rules.js');
const D = await import(G + 'data.js');
const HZ = await import(G + 'heroes.js');
const IT = await import(G + 'items.js');
const TW = await import(G + 'town.js');
const M = await import(G + 'meta.js');
globalThis.setTimeout = () => 0; // toasts and animations are skipped
let errors = 0;
function run(seedName, days = 40) {
  st.setS(E.newState('Sim', { hair: 1, hc: 2, skin: 1, eye: 3 }, 'student'));
  const S = () => st.S;
  // roll a class directly
  E.finishRoll(D.CLASSES[Math.floor(Math.random() * 10)].id, true); st.ui.modal = null;
  const stats = { turns: 0, wins: 0, deaths: 0, gates: 0, summons: 0, dismantled: 0 };
  for (let day = 0; day < days; day++) {
    // spend points: main stat + int for hybrid path
    const c = R.cls();
    while (S().pts > 0) E.H.addStat(S().pts % 2 ? c.main : (c.main === 'int' ? 'agi' : 'int'), 1);
    if (S().gems >= 100) { E.summon(S().gems >= 900 ? 10 : 1); stats.summons++; st.ui.modal = null; }
    if (S().subOffer) E.H.pickSub(0);
    // town: idle heroes go to work (role match first), dismantle stubborn ones, upgrade when affordable
    for (const id of Object.keys(S().heroes)) { if (S().party.includes(id) || E.jobOf(id)) continue; const b = TW.BUILDINGS.filter(b => b.hall <= S().town.hall && S().town.b[b.id].w.length < TW.slotsOf(S().town.b[b.id].lv)).sort((x, y) => (y.role === HZ.HERO[id].role) - (x.role === HZ.HERO[id].role))[0]; if (b) E.H.assign(b.id, id); }
    for (const id of Object.keys(S().heroes)) if ((S().heroes[id].refuse || 0) >= 3 && !S().party.includes(id)) { E.H.dismantle(id); E.H.dismantle(id); stats.dismantled++; }
    E.H.upgradeHall(); for (const b of TW.BUILDINGS) E.H.upgrade(b.id);
    // association: claim quests, wear the newest title, second awakening, rebirth
    (S().quests || []).forEach((q, i) => E.H.claimQuest(i));
    const t = Object.keys(S().ach).filter(id => M.ACH[id].title).pop(); if (t && S().title !== t) E.H.setTitle(t);
    E.H.awaken2(); st.ui.modal = null;
    if (S().lv >= M.REBIRTH_LV) { E.H.rebirth(); E.H.rebirth(); stats.rebirths = (stats.rebirths || 0) + 1; st.ui.modal = null; }
    // sweep gates that are far below us before fighting
    D.GATES.forEach((g, i) => { if (E.canSweep(i) && g.lv + 8 <= S().lv && S().sta > 60) { E.H.sweep(i); stats.sweeps = (stats.sweeps || 0) + 1; } });
    // buy best affordable item per slot
    for (const it of IT.ITEMS.filter(i => i.p > 0 && i.lv <= S().lv && !S().inv.includes(i.id)).sort((a, b) => b.p - a.p)) if (S().gold >= it.p + 50) E.H.buyItem(it.id);
    // gates
    for (let tries = 0; tries < 4; tries++) {
      const exam = D.GATES.findIndex(g => g.exam);
      const gi = S().lv >= D.AWAKE_LV && !S().awake ? D.TRIAL : E.nextRank() && !E.gateLock(exam) ? exam
        : D.GATES.map((g, i) => [g, i]).filter(([g, i]) => E.isRegular(g) && g.lv <= S().lv + 2 && !E.gateLock(i)).sort((a, b) => a[0].lv - b[0].lv).pop()[1];
      if (S().sta < R.staCost(D.GATES[gi].sta)) break;
      E.enter(gi); stats.gates++;
      let guard = 0;
      while (S().run && guard++ < 200) {
        const r = S().run;
        if (r.state === 'fight') {
          stats.turns++;
          if (S().hp < R.maxHp() * .35 && S().pot) E.act('pot');
          else {
            /* skills are skipped while exhausted and the ult only when its cooldown is up, otherwise act() is a no-op */
            const sk = R.fatigue() < 2 && ['u', 's', 0, 1].find(ref => { const s = ref === 'u' ? (S().awake && !r.ucd ? { id: R.ultId() } : null) : ref === 's' ? (S().sub ? { id: 'sub_' + S().sub.id } : null) : S().act[ref]; return s && S().mp >= R.mpCost(D.ACT[s.id]); });
            E.act(sk != null && sk !== false ? 'skill:' + sk : 'atk');
          }
          st.ui.busy = false;
        } else if (r.state === 'won' || r.state === 'room') { stats.wins += r.state === 'won'; if (S().sta < 3) E.H.leave(); else E.next(); }
        else if (r.state === 'doors') E.H.door(S().hp < R.maxHp() * .5 ? Math.max(0, r.doors.indexOf('rest')) : 0);
        else if (r.state === 'event') E.H.eventPick(r.event.opts.length - 1);
        else if (r.state === 'arise') { E.H.skipArise(); }
        else if (r.state === 'awaken') { const p = R.openPaths(); E.awaken(p[0] || 'pure'); st.ui.modal = null; }
        else if (r.state === 'cleared') E.H.leave();
        else if (r.state === 'dead') { stats.deaths++; E.H.revive(); }
        st.ui.modal = null;
      }
    }
    E.H.trainAll();
    E.H.claim(); E.H.endDay();
  }
  const s = S();
  console.log(`${seedName}: class=${s.cls} lv=${s.lv} awake=${s.awake} path=${s.awPath} sub=${s.sub && s.sub.id + s.sub.g} heroes=${Object.keys(s.heroes).length} party=${s.party.map(id => HZ.HERO[id].n + '(' + s.heroes[id].trait + ')').join(',')} inv=${s.inv.length} eq=${Object.values(s.eq).join(',')} gold=${s.gold} gems=${s.gems} perks=${['str','agi','int','vit','per'].map(k => R.perksOf(k).length).join('')} hall=${s.town.hall} res=${JSON.stringify(s.town.res)} blv=${Object.values(s.town.b).map(b=>b.lv).join('')} ach=${Object.keys(s.ach).length} title=${s.title} quests=${(s.stats||{}).quests||0} breaksStopped=${(s.stats||{}).breaksStopped||0} heroLv=${Object.values(s.heroes).map(h=>h.lv).join('/')} aw2=${s.aw2} rebirth=${s.rebirth} | ${JSON.stringify(stats)} turns/gate=${(stats.turns / stats.gates).toFixed(1)}`);
}
const [runs = 3, days = 40] = process.argv.slice(2).map(Number);
try { for (let i = 0; i < runs; i++) run('run' + i, days); } catch (e) { errors++; console.error('ERROR', e.stack); }
console.log('errors', errors);
