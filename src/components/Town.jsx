import { S, ui } from '../game/store.js';
import { H, jobOf, heroWill, workMul, canPay } from '../game/engine.js';
import { HERO, STAR, ROLE, PERSONA } from '../game/heroes.js';
import { BUILDINGS, BLD, RES, RES_NAME, MAX_HALL, maxBlv, slotsOf, upCost, hallCost, HALL_FX, STRIKES, ROLE_MATCH, HUNGRY, shardsOf, gemsOf } from '../game/town.js';
import { fxText, GATES } from '../game/data.js';
import { Sprite, Btn } from './ui.jsx';

const costText = c => Object.entries(c).filter(([, v]) => v > 0).map(([k, v]) => {
  const have = k === 'gold' ? S.gold : S.town.res[k] || 0;
  return <span key={k} className={have >= v ? '' : 'short'}>{k === 'gold' ? 'ทอง' : RES_NAME[k]} {v.toLocaleString()}</span>;
});

export function ResBar() {
  const T = S.town, mouths = Object.keys(S.heroes).length;
  return (
    <div className="resbar">
      {RES.map(([k, n]) => <span key={k} className={`res r-${k}`} title={n}><Sprite k="res" id={k} scale={1} /><b>{(T.res[k] || 0).toLocaleString()}</b> {n}</span>)}
      <span className={`res ${T.res.food < mouths ? 'short' : ''}`}>ฮีโร่ {mouths} ตัวกินอาหารวันละ {mouths}{mouths ? ` · พอ ${Math.floor(T.res.food / mouths)} วัน` : ''}</span>
    </div>
  );
}

export function TownView() {
  const T = S.town, hc = hallCost(T.hall), idle = Object.keys(S.heroes).filter(id => !S.party.includes(id) && !jobOf(id));
  const stubborn = Object.keys(S.heroes).filter(id => (S.heroes[id].refuse || 0) >= STRIKES);
  const next = BUILDINGS.filter(b => b.hall === T.hall + 1);
  return (
    <section className="win town">
      <div className="sechead"><h2>เมืองของคุณ · ระดับ {T.hall}</h2><span className="small">ผลผลิตออกตอนจบวันที่แท็บตารางวัน</span></div>
      <ResBar />
      <div className="hall">
        <Sprite k="bld" id={`hall|${T.hall}`} scale={2} />
        <div className="hallinfo">
          <div className="gname">ศาลากลาง <span className="chip">ระดับ {T.hall}/{MAX_HALL}</span></div>
          <div className="small">โบนัสเมือง: {T.hall > 1 ? fxText(Object.fromEntries(Object.entries(HALL_FX).map(([k, v]) => [k, v * (T.hall - 1)]))) : 'ยังไม่มี (เริ่มที่ระดับ 2)'} · สิ่งก่อสร้างอัปได้ถึงเลเวล {maxBlv(T.hall)}</div>
          {T.hall < MAX_HALL && <div className="small">ระดับถัดไป: {next.length ? `เปิด ${next.map(b => b.n).join(', ')} · ` : ''}{fxText(HALL_FX)} · เพดานสิ่งก่อสร้าง {maxBlv(T.hall + 1)}</div>}
        </div>
        {T.hall < MAX_HALL
          ? <div className="up"><div className="cost">{costText(hc)}</div><Btn act="upgradeHall" className="btn ult" disabled={!canPay(hc)}>อัปเกรดเมือง</Btn></div>
          : <span className="chip warn">เมืองระดับสูงสุด</span>}
      </div>
      {stubborn.length > 0 && <div className="banner bad"><span>ฮีโร่ดื้องานติดกัน {STRIKES} วันขึ้นไป: {stubborn.map(id => HERO[id].n).join(', ')} · ย่อยเป็นเศษวิญญาณได้ที่การ์ดด้านล่างหรือแท็บฮีโร่</span></div>}
      <div className="bldgrid">{BUILDINGS.map(b => <Building key={b.id} b={b} idle={idle} />)}</div>
      <p className="small">ฮีโร่ที่อยู่ในทีมผจญภัยทำงานในเมืองไม่ได้ · ถ้าบทบาทตรงกับงานจะผลิตได้ ×{ROLE_MATCH} · ถ้าอาหารไม่พอ ฮีโร่จะยอมทำงานน้อยลงเหลือ {Math.round(HUNGRY * 100)}%</p>
    </section>
  );
}

function Building({ b, idle }) {
  const T = S.town, st = T.b[b.id], locked = b.hall > T.hall, cap = slotsOf(st.lv), c = upCost(st.lv), maxed = st.lv >= maxBlv(T.hall);
  return (
    <div className={`bld win ${locked ? 'locked' : ''}`}>
      <div className="bart"><Sprite k="bld" id={`${b.id}|${st.lv}`} v={locked ? 'sil' : 'n'} scale={2} /></div>
      <div className="bhead2"><b>{b.n}</b><span className="chip">Lv {st.lv}</span>{!locked && <span className="small">ถนัด: {ROLE[b.role].n} ×{ROLE_MATCH}</span>}</div>
      <div className="small">{b.d}{b.out ? ` · ฐาน ${b.base} ${RES_NAME[b.out]}/คน/วัน` : ''}</div>
      {locked ? <div className="small">ปลดล็อกเมื่อศาลากลางระดับ {b.hall}</div> : <>
        <div className="workers">
          {st.w.map(id => {
            const h = HERO[id], o = S.heroes[id], p = PERSONA[o.trait];
            return (
              <div key={id} className={`worker ${(o.refuse || 0) >= STRIKES ? 'stubborn' : ''}`} style={{ '--sc': STAR[h.star].col }}>
                <Sprite k="hero" id={id} scale={1} />
                <div><b>{h.n}</b> <span className="small">{'★'.repeat(h.star)} · {p.n}</span>
                  <div className="small">ยอมทำงาน {Math.round(heroWill(id) * 100)}% · ผลผลิต ×{Math.round(workMul(id, b.id) * 10) / 10}{o.refuse ? ` · ไม่มาทำงาน ${o.refuse} วันติด` : ''}</div></div>
                <Btn act="unassign" args={[id]} className="btn sm ghost">ถอน</Btn>
              </div>
            );
          })}
          {st.w.length < cap && idle.length > 0 && (
            <select className="assign" value="" aria-label={`ส่งฮีโร่ไปทำงานที่${b.n}`} onChange={e => e.target.value && H.assign(b.id, e.target.value)}>
              <option value="">+ ส่งฮีโร่มาทำงาน ({st.w.length}/{cap})</option>
              {idle.map(id => { const h = HERO[id]; return <option key={id} value={id}>{'★'.repeat(h.star)} {h.n} · {ROLE[h.role].n}{h.role === b.role ? ' (ถนัด)' : ''} · {PERSONA[S.heroes[id].trait].n}</option>; })}
            </select>
          )}
          {st.w.length < cap && !idle.length && <div className="small">ตำแหน่งว่าง {cap - st.w.length} · ไม่มีฮีโร่ว่างงาน</div>}
        </div>
        <div className="up">{maxed ? <span className="small">เลเวลสูงสุดตามระดับเมือง</span> : <><div className="cost">{costText(c)}</div><Btn act="upgrade" args={[b.id]} className="btn sm" disabled={!canPay(c)}>อัปเกรด</Btn></>}</div>
      </>}
    </div>
  );
}

/* dismantle button shared with hero cards: asks twice */
export function Dismantle({ id }) {
  const h = HERO[id], o = S.heroes[id], armed = ui.confirmDismantle === id;
  return <Btn act="dismantle" args={[id]} className={`btn sm ${armed ? 'bad' : 'ghost'}`} title={`ได้เศษวิญญาณ ${shardsOf(h.star, o.lim)} · คริสตัล ${gemsOf(h.star)}`}>{armed ? 'กดอีกครั้งเพื่อย่อย' : 'ย่อย'}</Btn>;
}

export function DayReport({ rep, day }) {
  const t = rep.tot, gains = [t.gold && `ทอง ${t.gold}`, ...['food', 'wood', 'stone', 'iron'].map(k => t[k] && `${RES_NAME[k]} ${t[k]}`), t.pot && `ยา HP ${t.pot}`, t.mpot && `ยา MP ${t.mpot}`, t.gems && `คริสตัล ${t.gems}`, t.xp && `EXP ${t.xp}`, t.items.length && `อุปกรณ์ ${t.items.length} ชิ้น`].filter(Boolean);
  return (
    <div id="modal"><div className="mwrap win wide"><div className="sysbox">
      <div className="eyebrow">[ระบบ] รายงานเมือง · จบวันที่ {day}</div>
      {rep.raid && <div className="banner bad"><span>เกตแตก! มอนสเตอร์จาก{GATES[rep.raid.g].name}บุกเมือง เสียทอง {rep.raid.lost.gold} · อาหาร {rep.raid.lost.food} · ไม้ {rep.raid.lost.wood} · หิน {rep.raid.lost.stone} · เหล็ก {rep.raid.lost.iron}</span></div>}
      <p className={rep.hungry ? 'warn' : 'small'}>ฮีโร่ {rep.mouths} ตัวกินอาหารไป {rep.eaten}{rep.hungry ? ' · อาหารไม่พอ! ฮีโร่หิวและไม่ค่อยอยากทำงาน' : ''}</p>
      {rep.lines.length ? <div className="report">{rep.lines.map((l, i) => (
        <div key={i} className={`rline ${l.ok ? 'ok' : 'bad'}`}><span className="small">{BLD[l.b].n}</span><b>{HERO[l.id] ? HERO[l.id].n : l.id}</b><span>{l.ok ? l.text : `ไม่มาทำงาน: ${l.text}`}{!l.ok && l.strike >= STRIKES ? ` · ดื้อ ${l.strike} วันติด` : ''}</span></div>
      ))}</div> : <p className="small">ยังไม่มีฮีโร่ทำงานในเมือง ส่งฮีโร่ไปทำงานได้ที่แท็บเมือง</p>}
      {gains.length > 0 && <div className="trait"><b>ได้รับวันนี้</b><br />{gains.join(' · ')}</div>}
      <ResBar />
      <div className="row"><Btn act="closeModal" className="btn solid">ตกลง</Btn><button className="btn ghost" onClick={() => { H.tab('town'); H.closeModal(); }}>ไปที่เมือง</button></div>
    </div></div></div>
  );
}
