import { useEffect, useRef } from 'react';
import { S, ui } from '../game/store.js';
import { GATES, AFX, ACT, FLEE_STA, ROOM_STA } from '../game/data.js';
import { cls, fatigue, maxHp, maxMp, mpCost, staCost, maxSh, actDesc, ultId, awName, awGlow } from '../game/rules.js';
import { HERO, PERSONA, STAR } from '../game/heroes.js';
import { artKey } from '../art/sprites.js';
import { attachArena, detachArena } from '../arena/arena.js';
import { Bar, Btn } from './ui.jsx';
import { TRAITS, WEAK, PHASES, packLeft } from '../game/monsters.js';
import { DOORS } from '../game/dungeon.js';
import { H } from '../game/engine.js';

function Arena() {
  const ref = useRef(null);
  useEffect(() => { const cv = ref.current; attachArena(cv); return () => detachArena(cv); }, []);
  return <canvas ref={ref} className="stage" role="img" aria-label="ฉากต่อสู้ในดันเจี้ยน" />;
}

/* auto-battle: after each turn's animation, take the next turn while the toggle is on */
function useAuto() {
  const r = S.run, go = ui.auto && r && r.state === 'fight' && !ui.busy;
  useEffect(() => { if (!go) return; const t = setTimeout(() => H.autoStep(), 380); return () => clearTimeout(t); });
}

export function Battle() {
  useAuto();
  const r = S.run, g = GATES[r.g], e = r.enemy, af = AFX[r.affix], busy = ui.busy, c = cls(), noSk = fatigue() === 2;
  const skBtn = (ref, s, extra = '') => {
    const d = ACT[s.id], cst = mpCost(d), cd = s.ult ? r.ucd || 0 : 0;
    return <Btn key={ref} act="act" args={['skill:' + ref]} className={`btn ${extra}`} disabled={S.mp < cst || busy || noSk || cd > 0} title={actDesc(s.id, s.g)}>{d.n}<small>{cd > 0 ? `รอ ${cd} เทิร์น` : `${s.ult ? 'ULT' : s.sub ? 'รอง ' + s.g : s.g} · MP ${cst}`}</small></Btn>;
  };
  const quaff = <>
    <Btn act="quaff" args={['pot']} className="btn" disabled={!(S.pot && S.hp < maxHp() && !busy)}>ดื่มยา HP<small>×{S.pot}</small></Btn>
    <Btn act="quaff" args={['mpot']} className="btn" disabled={!(S.mpot && S.mp < maxMp() && !busy)}>ดื่มยา MP<small>×{S.mpot}</small></Btn>
  </>;
  let acts = null;
  if (r.state === 'fight') acts = <>
    <button className={`btn ${ui.auto ? 'ult' : 'ghost'}`} aria-pressed={ui.auto} onClick={() => H.toggleAuto()}>{ui.auto ? 'ออโต้: เปิด' : 'ออโต้'}</button>
    <Btn act="act" args={['atk']} className="btn solid" disabled={busy || ui.auto}>โจมตี</Btn>
    {S.awake && skBtn('u', { id: ultId(), g: 'C', ult: 1 }, 'ult')}
    {S.sub && skBtn('s', { id: 'sub_' + S.sub.id, g: S.sub.g, sub: 1 }, 'subk')}
    {S.act.map((s, i) => skBtn(i, s))}
    <Btn act="act" args={['pot']} className="btn" disabled={!S.pot || busy}>ยา HP<small>×{S.pot}</small></Btn>
    <Btn act="act" args={['mpot']} className="btn" disabled={!S.mpot || busy}>ยา MP<small>×{S.mpot}</small></Btn>
    <Btn act="act" args={['flee']} className="btn ghost" disabled={busy}>หนี<small>STA -{FLEE_STA}</small></Btn>
    {noSk && <p className="roomtext warn">คุณหมดแรง ใช้สกิลไม่ได้จนกว่าจะได้พัก</p>}
  </>;
  else if (r.state === 'won' || r.state === 'room') acts = <>
    {r.state === 'room' ? <><div className="note">{r.room.title}</div><p className="roomtext">{r.room.text}</p></> : <div className="note">[ระบบ] {r.tower ? `ผ่านชั้น ${r.floor} แล้ว` : `ห้องนี้ปลอดภัยแล้ว${r.stage === 2 ? ' ห้องถัดไปคือห้องบอส' : ''}`}</div>}
    <Btn act="next" className="btn solid" disabled={busy}>{r.tower ? 'ขึ้นชั้นถัดไป' : r.stage === 2 ? 'เข้าห้องบอส' : 'เดินต่อ'}<small>STA -{staCost(ROOM_STA)}</small></Btn>
    {quaff}<Btn act="leave" className="btn ghost" disabled={busy}>ออกจากเกต</Btn>
  </>;
  else if (r.state === 'doors') acts = <>
    <div className="note">[ระบบ] ทางแยก · เลือกประตูที่จะเข้า</div>
    <div className="doors">{(r.doors || []).map((k, i) => <button key={i} className="pick door" disabled={busy} onClick={() => H.door(i)}><b>{DOORS[k] ? DOORS[k].n : k}</b><span className="small">{DOORS[k] ? DOORS[k].d : ''}</span></button>)}</div>
    {quaff}
  </>;
  else if (r.state === 'event' && r.event) acts = <>
    <div className="note">{r.event.title}</div><p className="roomtext">{r.event.text}</p>
    <div className="doors">{r.event.opts.map((o, i) => <button key={i} className="pick door" disabled={!o.ok || busy} onClick={() => H.eventPick(i)}><b>{o.n}</b><span className="small">{o.d}</span></button>)}</div>
  </>;
  else if (r.state === 'arise') { const full = S.shadows.length >= maxSh(); acts = <>
    <div className="note r-S">ร่างของ {e.name} ยังคงอยู่… เงาของมันกำลังรอคำสั่ง</div>
    {full && <p className="roomtext small">กองทัพเงาเต็มแล้ว ({maxSh()} ตัว) ปลดเงาออกในแท็บกองทัพเงาก่อน หรือปล่อยร่างนี้ไป</p>}
    <Btn act="arise" className="btn violet" disabled={full || busy}>ARISE<small>เหลือ {r.tries}</small></Btn><Btn act="skipArise" className="btn ghost" disabled={busy}>ปล่อยไป</Btn>
  </>; }
  else if (r.state === 'awaken') acts = <><div className="note" style={{ color: c.aw.glow }}>พลังที่หลับใหลอยู่ในตัวคุณกำลังตื่นขึ้น… ค่าสถานะของคุณกำหนดได้ว่าจะตื่นรู้เป็นอะไร</div><Btn act="awakenStart" className="btn solid" disabled={busy}>เลือกสายตื่นรู้</Btn></>;
  else if (r.state === 'cleared') acts = <><div className="note">[ระบบ] เคลียร์ {g.name} รางวัลรวม EXP +{r.loot.xp} · ทอง +{r.loot.gold}{r.loot.gems ? ` · คริสตัล +${r.loot.gems}` : ''}</div><Btn act="leave" className="btn solid" disabled={busy}>กลับเมือง</Btn></>;
  else if (r.state === 'dead') acts = <><div className="note bad">[ระบบ] ผู้เล่นเสียชีวิต ระบบชุบชีวิตคุณให้ แต่ทองหายไป {r.lost} สตามินา -10 และ HP เหลือ 30%</div><Btn act="revive" className="btn solid" disabled={busy}>ฟื้นคืนชีพในเมือง</Btn></>;
  const alive = e && e.hp > 0;
  return (
    <section className="battle">
      <div className={`bhead g-${g.r}`}><span className="chip">{g.trial ? 'ภารกิจเปลี่ยนอาชีพ' : 'เกตแรงก์ ' + g.r}</span><b>{g.name}</b>
        {r.affix !== 'none' && <span className={`chip ${af.c}`} title={af.d}>{af.n}</span>}
        {r.hard && <span className="chip bad">โหมดฝันร้าย</span>}
        {r.bless > 0 && <span className="chip ok">พร +{Math.round(r.bless * 100)}% ATK</span>}
        {r.curse > 0 && <span className="chip bad">คำสาป ศัตรู +{Math.round(r.curse * 100)}% ATK</span>}
        <span className="stage-num">{r.tower ? `ชั้น ${r.floor}${r.enemy && r.enemy.boss ? ' · ผู้พิทักษ์' : ''}` : g.exam ? 'สอบเลื่อนแรงก์' : g.trial ? 'บททดสอบ' : `ห้อง ${r.stage + 1}/4${r.stage === 3 ? ' · ห้องบอส' : ''}`}</span></div>
      <div className="stage-wrap win"><Arena /></div>
      {S.party.length > 0 && <div className="partybar">{S.party.map(id => { const h = HERO[id], p = PERSONA[S.heroes[id].trait]; return <span key={id} className="pchip" style={{ '--sc': STAR[h.star].col }} title={p.d}>{'★'.repeat(h.star)} {h.n} · {p.n}</span>; })}</div>}
      {e && (r.state === 'fight' || alive) && (
        <div className={`foe win ${e.boss ? 'boss' : ''}`}>
          <div className="fhead"><span className="eyebrow">{e.boss ? 'บอส' : e.elite ? 'ยอดฝีมือ' : 'มอนสเตอร์'} · Lv {e.lv}</span><span className="fname">{artKey(e.name)}</span>
            {alive && <>
              {e.burn > 0 && <span className="chip warn">ดาเมจต่อเนื่อง {e.burn}</span>}
              {r.stop > 0 && <span className="chip cy">ขยับไม่ได้ {r.stop}</span>}
              {e.weak && <span className="chip vi">ATK ลดลง</span>}
              {r.guard > 0 && <span className="chip">ป้องกัน {r.guard}</span>}
              {r.buff && r.buff.t > 0 && <span className="chip warn">ATK +{Math.round(r.buff.v * 100)}% · {r.buff.t}</span>}
              {r.poison > 0 && <span className="chip bad">คุณติดพิษ {r.poison}</span>}
            </>}</div>
          {alive && <div className="traits">
            {(e.tr || []).map(t => TRAITS[t] && <span key={t} className="chip tr" title={TRAITS[t].d}>{TRAITS[t].n}</span>)}
            {e.wk && WEAK[e.wk] && <span className="chip ok" title={WEAK[e.wk].d}>จุดอ่อน: {WEAK[e.wk].n}</span>}
            {e.pack > 0 && <span className="chip warn">เหลือ {packLeft(e)}/{e.pack} ตัว</span>}
            {e.shield > 0 && <span className="chip cy">โล่องครักษ์ {e.shield}</span>}
            {e.ph && PHASES[e.ph] && <span className="chip bad" title={PHASES[e.ph].d}>{PHASES[e.ph].n}</span>}
          </div>}
          <Bar l="HP" v={e.hp} m={e.max} k="hp" /><div className="fmeta">ATK {e.atk} · DEF {e.def}</div>
        </div>
      )}
      <div className="actions">{acts}</div>
      <div className="log win" aria-live="polite">{r.log.slice(-10).reverse().map((l, i) => <div key={r.log.length - i} className={`l ${l.k}`}>{l.t}</div>)}</div>
    </section>
  );
}
export { awName, awGlow };
