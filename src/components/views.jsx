import { useState } from 'react';
import { S, ui } from '../game/store.js';
import {
  STATS, ORIG, GATES, TRIAL, AWAKE_LV, ROOM_STA, FLEE_STA, TRAIN_STA, DAILY, ACTIVITIES, SPOT_PER_DAY, CLASSES, ACT, PAS, fxText,
  PERK_TIERS, STAT_PERKS, AFFINITY, AFF_NEED,
} from '../game/data.js';
import {
  cls, rc, stat, atk, def, crit, dodge, fatigue, FAT, maxHp, maxMp, maxSta, mpCost, staCost, potMul, maxSh, shSrc, shAtk, dailyDone,
  jobGold, actDesc, pasDesc, awTrait, awName, awGlow, awPath, openPaths, skillPow, subDef, subMul, subPaired, myId, eqSt, ultId,
} from '../game/rules.js';
import { H, maxParty, heroPow, partyAtkBonus, partyCover } from '../game/engine.js';
import { ITEMS, ITEM, SLOTS, SLOT_NAME } from '../game/items.js';
import { HEROES, HERO, STAR, ROLE, PERSONA, SIGNATURE, PULL_COST, PULL10_COST, PITY, MAX_LIMIT } from '../game/heroes.js';
import { SUB_PAIR, SUB_REROLL } from '../game/subclass.js';
import { GC } from '../arena/arena.js';
import { Sprite, Bar, Btn, Stars } from './ui.jsx';
import { Dismantle } from './Town.jsx';
import { jobOf, todayGate, canSweep, canHard, heroCapOf, isRegular, gateLock, nextRank, towerBest, towerUnlocked } from '../game/engine.js';
import { DAILY_GATE_MUL, SWEEP_LV, SWEEP_MUL, respecCost } from '../game/meta.js';
import { HARD_LV, HARD_REWARD, EXAM_LV, EXAM_REWARD, TOWER, towerStart, towerFloorLv } from '../game/dungeon.js';
import { shadowFx } from '../game/monsters.js';
import { sellPrice } from '../game/items.js';
import { HERO_SKILL, HERO_SKILL_LV, heroNeed, bannerHero, RATEUP } from '../game/heroes.js';
import { STRIKES } from '../game/town.js';

/* ---------- shared pieces ---------- */
export function SkillList() {
  const c = cls(), sc = subDef();
  return (
    <div className="skills">
      {S.awake && <div className="sk"><span className="chip r-U">ULT</span><div><b>{ACT[ultId()].n}</b><span className="kind">ULTIMATE · MP {mpCost(ACT[ultId()])}</span><div className="small">{actDesc(ultId(), 'C')}</div></div></div>}
      {sc && <div className="sk sub"><span className={`chip r-${S.sub.g}`}>{S.sub.g}</span><div><b>{sc.act.n}</b><span className="kind">คลาสรอง · {sc.name} · MP {mpCost(sc.act)}</span><div className="small">{actDesc('sub_' + sc.id, S.sub.g)}</div></div></div>}
      {S.act.map((s, i) => <div className="sk" key={'a' + i}><span className={`chip r-${s.g}`}>{s.g}</span><div><b>{ACT[s.id].n}</b><span className="kind">ACTIVE · MP {mpCost(ACT[s.id])}</span><div className="small">{actDesc(s.id, s.g)}</div></div></div>)}
      {S.pas.map((s, i) => <div className="sk" key={'p' + i}><span className={`chip r-${s.g}`}>{s.g}</span><div><b>{PAS[s.id].n}</b><span className="kind">PASSIVE</span><div className="small">{pasDesc(s.id, s.g)}</div></div></div>)}
    </div>
  );
}
export function TraitBox({ c }) {
  const t = S.awake ? awTrait(c) : null;
  return <>
    <div className="trait"><b>คุณลักษณะประจำอาชีพ · {c.trait.n}</b><br />{fxText(c.trait.fx)}</div>
    {t && <div className="trait aw"><b>พลังตื่นรู้ · {t.n}</b><br />{fxText(t.fx)}</div>}
  </>;
}

/* ---------- status ---------- */
export function StatusView() {
  const c = cls(), main = STATS.find(s => s[0] === c.main), o = ORIG[S.origin], f = fatigue(), sc = subDef();
  return (
    <section className="win">
      <div className="sechead"><h2>หน้าต่างสถานะ</h2>{S.pts ? <span className="pts">แต้มคงเหลือ {S.pts}</span> : <span className="small">ได้แต้มจากเลเวลอัป ภารกิจรายวัน และการฝึกพิเศษ</span>}</div>
      {S.picks > 0 && <div className="banner"><span>มีช่องสกิลใหม่รอเลือก {S.picks} ช่อง</span><Btn act="openPick" className="btn solid sm">เลือกสกิล</Btn></div>}
      {S.subOffer && <div className="banner vi"><span>ปลดล็อกคลาสรองแล้ว เลือกได้ 1 จาก {S.subOffer.length} ตัวเลือก</span><Btn act="openSub" className="btn solid sm">เลือกคลาสรอง</Btn></div>}
      <div className="statgrid">
        <div className="showcase" style={{ '--aura': `${awGlowA()}` }}><Sprite k="me" id={myId()} scale={3} /></div>
        <div className="sysbox">
          <div className="small">ภูมิหลัง: <b style={{ color: 'var(--text)' }}>{o.n}</b> · {o.d}</div>
          <div className="stats">
            {STATS.map(([k, th, ab]) => {
              const v = stat(k), tier = PERK_TIERS.filter(t => v >= t).length, nextT = PERK_TIERS[tier];
              return (
                <div className="st" key={k}>
                  <span className={`ab ${k === c.main ? 'main' : ''}`}>{ab}</span>
                  <span>{th}<span className="pips" title={STAT_PERKS[k].map((p, i) => `${PERK_TIERS[i]}: ${p.n} (${fxText(p.fx)})`).join('\n')}>{PERK_TIERS.map((t, i) => <i key={t} className={i < tier ? 'on' : ''} />)}</span>
                    {nextT && <span className="nextp">อีก {nextT - v} → {STAT_PERKS[k][tier].n}</span>}</span>
                  <b>{v}</b>
                  <Btn act="addStat" args={[k, 1]} className="btn sm" disabled={!S.pts} aria-label={`เพิ่ม${th} 1 แต้ม`}>+1</Btn>
                  <Btn act="addStat" args={[k, 5]} className="btn sm ghost" disabled={S.pts < 5} aria-label={`เพิ่ม${th} 5 แต้ม`}>+5</Btn>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="hint">ค่าหลักของ{c.name}คือ {main[2]} ({main[1]}) · ทุกอาชีพได้ ATK จาก STR · INT เพิ่ม MP และดาเมจสกิล (ตอนนี้ +{Math.round(skillPow())}%) · VIT เพิ่ม HP/DEF · AGI เพิ่มคริติคอล · PER เพิ่มการหลบหลีก · สเตตัสถึง {PERK_TIERS.join(' / ')} ปลดล็อกความสามารถพิเศษ</p>
      <div className="derived">
        <div><span className="lbl">ATK</span><b>{atk()}</b></div><div><span className="lbl">DEF</span><b>{def()}</b></div>
        <div><span className="lbl">คริติคอล</span><b>{Math.round(crit() * 10) / 10}%</b></div><div><span className="lbl">หลบหลีก</span><b>{Math.round(dodge() * 10) / 10}%</b></div>
      </div>
      {f > 0 && <p className="warn">สถานะ{FAT[f].n}: {FAT[f].d} ค่าที่แสดงด้านบนรวมบทลงโทษแล้ว</p>}
      <PerkList />
      <TraitBox c={c} />
      {sc && <div className="trait sub"><b>คลาสรอง · {sc.name} <span className={`chip r-${S.sub.g}`}>{S.sub.g}</span>{subPaired() && <span className="chip vi">เข้าคู่ ×{SUB_PAIR}</span>}</b><br />{fxText(sc.fx, subMul())}<div className="small">{sc.desc}</div></div>}
      <AwakenPaths />
      <div className="sechead"><h2>สกิล</h2><span className="small">Active {S.act.length}/4 · Passive {S.pas.length}/5 · ได้ช่องใหม่ทุก 5 เลเวล</span></div>
      <SkillList />
      <div className="derived">
        <div><span className="lbl">ล่ามอนสเตอร์</span><b>{S.kills}</b></div><div><span className="lbl">เสียชีวิต</span><b>{S.deaths}</b></div>
        <div><span className="lbl">อัญเชิญ</span><b>{S.pulls}</b></div><div><span className="lbl">ฮีโร่</span><b>{Object.keys(S.heroes).length}</b></div>
      </div>
      <div className="row">
        {S.stone > 0 && <Btn act="useStone" className="btn">ใช้หินปลุกพลังใหม่ ({S.stone})</Btn>}
        {S.respec > 0 && <Btn act="useRespec" className="btn">ใช้ยาล้างแต้ม ({S.respec}) คืนแต้ม {Object.values(S.alloc).reduce((a, v) => a + v, 0)}</Btn>}
        <Btn act="reset" className={`btn ${ui.confirmReset ? 'bad' : 'ghost'}`}>{ui.confirmReset ? 'กดอีกครั้งเพื่อลบเซฟทั้งหมด' : 'เริ่มเกมใหม่'}</Btn>
      </div>
    </section>
  );
}
const awGlowA = () => S.awake ? hexToA(awGlow(), .35) : 'rgba(88,196,255,.2)';
const hexToA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };

function PerkList() {
  const got = STATS.flatMap(([k, , ab]) => STAT_PERKS[k].map((p, i) => ({ ...p, ab, t: PERK_TIERS[i], on: stat(k) >= PERK_TIERS[i] })));
  const on = got.filter(p => p.on);
  return (
    <div className="perks">
      <div className="eyebrow">ความสามารถจากค่าสถานะ · {on.length}/{got.length}</div>
      {on.length ? <div className="perkgrid">{on.map(p => <div key={p.n} className="perk"><b>{p.n}</b><span className="small">{p.ab} {p.t} · {fxText(p.fx)}</span></div>)}</div>
        : <p className="small">อัปค่าสถานะใดก็ได้ให้ถึง {PERK_TIERS[0]} เพื่อปลดล็อกความสามารถแรก ทุกอาชีพใช้ได้เหมือนกัน</p>}
    </div>
  );
}
function AwakenPaths() {
  const c = cls(), open = openPaths(c);
  if (S.awake) return <div className="paths"><div className="eyebrow">สายตื่นรู้ที่เลือก</div><div className="path on" style={{ '--pc': awGlow() }}><b>{awName()}</b><span className="small">{awPath() === 'pure' ? 'สายดั้งเดิมของอาชีพ' : AFFINITY[awPath()].d}</span></div></div>;
  return (
    <div className="paths">
      <div className="eyebrow">เส้นทางการตื่นรู้ (เลเวล {AWAKE_LV}) · อัปค่าสถานะรองถึง {AFF_NEED} เพื่อเปิดสายผสม</div>
      <div className="pathgrid">
        <div className="path on" style={{ '--pc': c.aw.glow }}><b>{c.aw.name}</b><span className="small">สายดั้งเดิม · เปิดเสมอ</span></div>
        {STATS.filter(([k]) => k !== c.main).map(([k, , ab]) => (
          <div key={k} className={`path ${open.includes(k) ? 'on' : ''}`} style={{ '--pc': AFFINITY[k].glow }}>
            <b>{awName(c, k)}</b><span className="small">{ab} {stat(k)}/{AFF_NEED} · {AFFINITY[k].d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- daily ---------- */
export function DailyView() {
  const done = dailyDone(), xp = 20 * S.lv, f = fatigue(), ms = maxSta();
  return (
    <section className="win">
      <div className="sechead"><h2>ตารางวันที่ {S.day}</h2><span className="small">สตามินาคือเวลาและแรงที่มีในหนึ่งวัน วางแผนให้ดี</span></div>
      <div className="stabox">
        <div className="row" style={{ justifyContent: 'space-between' }}><div><div className="lbl">สตามินาวันนี้</div><div className="stabig">{S.sta}<span className="small"> / {ms}</span></div></div><span className={`chip ${FAT[f].c}`}>{FAT[f].n}</span></div>
        <Bar l="STA" v={S.sta} m={ms} k={'st f' + f} />
        <div className="costs"><span>เข้าเกต <b>{GATES.filter(g => !g.trial).map(g => `${g.r} ${staCost(g.sta)}`).join(' · ')}</b></span><span>เดินห้องถัดไป <b>{staCost(ROOM_STA)}</b></span><span>หนี <b>{FLEE_STA}</b></span><span>ฝึกภารกิจ <b>{TRAIN_STA}</b>/ครั้ง</span></div>
        <p className="small">ต่ำกว่า 30% = เหนื่อยล้า (ATK/DEF -15%) · เหลือ 0 = หมดแรง (ATK/DEF -35% และใช้สกิลไม่ได้) · ตายในเกตเสียสตามินาเพิ่ม 10</p>
      </div>
      <div className="sechead"><h2>ภารกิจรายวัน</h2><span className="row"><span className="small">ใช้สตามินารวม {TRAIN_STA * 20} ถ้าทำครบ</span><Btn act="trainAll" className="btn sm solid" disabled={done || S.daily.claimed || S.sta < TRAIN_STA}>ทำทั้งหมด</Btn></span></div>
      {DAILY.map(([k, n, t, u, s]) => (
        <div key={k} className={`quest ${S.daily[k] >= t ? 'done' : ''}`}>
          <span className="q">{n}</span><div className="bar xp"><i style={{ width: `${S.daily[k] / t * 100}%` }} /></div><span className="n">{S.daily[k]}/{t} {u}</span>
          <Btn act="train" args={[k]} className="btn sm" disabled={S.daily[k] >= t || S.daily.claimed || S.sta < TRAIN_STA}>+{s}</Btn>
        </div>
      ))}
      <div className="reward"><span>รางวัล: แต้มสถานะ +3 · คริสตัล +50 · ฟื้น HP/MP เต็ม · สตามินา +20 · EXP +{xp}</span>
        <Btn act="claim" className="btn solid" disabled={!(done && !S.daily.claimed)}>{S.daily.claimed ? 'รับแล้ววันนี้' : 'รับรางวัล'}</Btn></div>
      <p className="warn">หากจบวันโดยไม่ทำภารกิจให้เสร็จ จะถูกส่งไปยังโซนลงโทษ เสียทอง 20% และวันถัดไปเริ่มด้วยสตามินาครึ่งเดียว</p>
      <div className="sechead"><h2>กิจกรรมในเมือง</h2><span className="small">จำกัดจำนวนครั้งต่อวัน</span></div>
      <div className="acts">
        {ACTIVITIES.map(a => {
          const left = a.max - S.today[a.id];
          return (
            <div className="actrow" key={a.id}>
              <div><div className="nm">{a.n}</div><div className="small">{a.id === 'job' ? `ได้ทอง ${jobGold()}` : a.d} · เหลือ {left}/{a.max} ครั้งวันนี้</div></div>
              <span className="price" style={{ color: a.cost ? 'var(--ok)' : 'var(--glow)' }}>{a.cost ? `STA -${a.cost}` : 'STA +20'}</span>
              <Btn act="doActivity" args={[a.id]} className="btn sm" disabled={left <= 0 || S.sta < a.cost || (a.id === 'nap' && S.sta >= ms)}>ทำ</Btn>
            </div>
          );
        })}
      </div>
      <div className="row"><Btn act="endDay" className="btn">พักผ่อนและจบวันที่ {S.day}</Btn><span className="small">การนอนฟื้นฟู HP, MP และสตามินาเต็ม</span></div>
    </section>
  );
}

/* ---------- gates ---------- */
export function GatesView() {
  const c = cls(), g = GATES[TRIAL], ok = S.lv >= AWAKE_LV, tcost = staCost(g.sta);
  return (
    <div className="gates">
      {!S.awake && (
        <div className={`gate win trial g-X ${ok ? '' : 'locked'}`}>
          <div className="grank"><span>!</span></div>
          <div><div className="eyebrow">ภารกิจเปลี่ยนอาชีพ</div><div className="gname">{g.name}</div>
            <div className="gmeta">{ok ? <>เอาชนะ{g.boss}แล้วเลือกสายตื่นรู้ · เปิดอยู่ {1 + openPaths(c).length} สาย</> : `ปลดล็อกที่เลเวล ${AWAKE_LV} · ทุกอาชีพตื่นรู้ได้`}</div>
            <div className="gmeta">{ok ? `ได้พลังตื่นรู้ สกิลสุดยอด และค่าสถานะทุกอย่าง +8 · สตามินา ${tcost}` : `ร่างตื่นรู้ขึ้นกับค่าสถานะที่คุณอัป เช่น อัป INT ถึง ${AFF_NEED} จะเปิดสาย${awName(c, 'int')}`}</div></div>
          <div className="gact"><Sprite k="mob" id={g.boss} v={ok ? 'n' : 'sil'} flip scale={1} /><Btn act="enter" args={[TRIAL]} className="btn" disabled={!(ok && S.sta >= tcost)}>{ok ? 'เริ่มภารกิจ' : 'ล็อกอยู่'}</Btn></div>
        </div>
      )}
      {GATES.map((g, i) => {
        if (!g.exam && !g.tower) return null;
        const lock = gateLock(i), cost = staCost(g.sta);
        return (
          <div key={i} className={`gate win special g-${g.r} ${lock ? 'locked' : ''}`}>
            <div className="grank"><span>{g.r}</span></div>
            {g.exam ? <div><div className="eyebrow">สอบเลื่อนแรงก์ · แรงก์ทางการของคุณ {S.hrank || 'E'}</div><div className="gname">{g.name}</div>
              <div className="gmeta">{nextRank() ? `ดวลกับ${g.boss}เพื่อเลื่อนเป็นแรงก์ ${nextRank()} (ต้องเลเวล ${EXAM_LV[nextRank()]})` : 'คุณเป็นฮันเตอร์แรงก์สูงสุดแล้ว'}</div>
              <div className="gmeta">ผ่านแล้วได้แต้มสถานะ +{EXAM_REWARD.pts} · คริสตัล +{EXAM_REWARD.gems} · เข้าเกตได้สูงกว่าแรงก์ตัวเอง 1 ขั้น · สตามินา {cost}</div></div>
              : <div><div className="eyebrow">เอนด์เกม · สถิติสูงสุดชั้น {towerBest()}</div><div className="gname">{g.name}</div>
              <div className="gmeta">ชั้นละ 1 การต่อสู้ ทุก {TOWER.every} ชั้นเป็นผู้พิทักษ์และจุดเช็กพอยต์ · รอบถัดไปเริ่มชั้น {towerStart(towerBest())} (ศัตรูเลเวล {towerFloorLv(towerStart(towerBest()))})</div>
              <div className="gmeta">ได้คริสตัลเมื่อทำสถิติใหม่ · สตามินา {cost} + ชั้นละ {staCost(ROOM_STA)}</div></div>}
            <div className="gact">{g.boss && <Sprite k="mob" id={g.boss} flip scale={1} />}{lock && <span className="lock">{lock}</span>}
              <Btn act="enter" args={[i]} className="btn" disabled={!!lock || S.sta < cost}>{g.exam ? 'เข้าสอบ' : 'ปีนหอคอย'}</Btn></div>
          </div>
        );
      })}
      {GATES.map((g, i) => [g, i]).sort((a, b) => a[0].lv - b[0].lv).map(([g, i]) => !isRegular(g) ? null : (
        <div key={i} className={`gate win g-${g.r} ${S.brk && S.brk.g === i ? 'breaking' : ''}`}>
          <div className="grank"><span>{g.r}</span></div>
          <div><div className="gname">{g.name}</div>
            <div className="gtags">{i === todayGate() && <span className="chip warn">เกตประจำวัน EXP/ทอง ×{DAILY_GATE_MUL}</span>}{S.brk && S.brk.g === i && <span className="chip bad">เกตแตกในอีก {Math.max(0, S.brk.due - S.day)} วัน!</span>}</div>
            <div className="gmeta">เลเวลแนะนำ {g.lv}+ · 3 ห้องสุ่ม + บอส</div><div className="gmeta">บอส: {g.boss}</div>
            <div className="gmeta">สตามินา {staCost(g.sta)} + ห้องละ {staCost(ROOM_STA)}</div>{S.cleared[i] ? <div className="gmeta ok">เคลียร์แล้ว {S.cleared[i]} ครั้ง</div> : null}</div>
          <div className="gact"><Sprite k="mob" id={g.boss} flip scale={1} />{S.lv < g.lv && <span className="chip bad">อันตราย</span>}
            {gateLock(i) && <span className="lock">{gateLock(i)}</span>}
            <Btn act="enter" args={[i]} className="btn" disabled={!!gateLock(i) || S.sta < staCost(g.sta)}>เข้าเกต</Btn>
            {canHard(i) && <Btn act="enterHard" args={[i]} className="btn bad sm" disabled={S.sta < staCost(g.sta + 6)} title={`ศัตรู +${HARD_LV} เลเวล · รางวัล ×${HARD_REWARD}`}>ฝันร้าย</Btn>}
            {(S.cleared[i] || 0) > 0 && <Btn act="sweep" args={[i]} className="btn ghost sm" disabled={!canSweep(i) || S.sta < staCost(g.sta) + 3 * staCost(ROOM_STA)} title={canSweep(i) ? `รับรางวัล ${Math.round(SWEEP_MUL * 100)}% ทันทีโดยไม่ต้องสู้` : `ต้องเลเวล ${g.lv + SWEEP_LV} ขึ้นไป`}>กวาดเกต</Btn>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- equipment (wardrobe + shop share the list) ---------- */
const statLine = it => [it.st.atk && `ATK +${it.st.atk}`, it.st.def && `DEF +${it.st.def}`, it.st.hp && `HP +${it.st.hp}`, Object.keys(it.fx).length && fxText(it.fx)].filter(Boolean).join(' · ') || 'ไม่มีค่าพลัง';
function ItemRows({ items, mode, sel, setSel }) {
  return items.map(it => {
    const own = S.inv.includes(it.id), worn = S.eq[it.slot] === it.id, locked = S.lv < it.lv;
    return (
      <div key={it.id} className={`item ${sel === it.id ? 'sel' : ''} ${worn ? 'worn' : ''}`} onMouseEnter={() => setSel(it.id)} onFocus={() => setSel(it.id)}>
        <button className="itm" onClick={() => setSel(it.id)}><span className="nm">{it.n}</span><span className="small">{statLine(it)}{locked ? ` · ต้องเลเวล ${it.lv}` : ''}</span></button>
        {mode === 'shop' ? <span className="price">{it.p.toLocaleString()} ทอง</span> : <span className="chip">{SLOT_NAME[it.slot]}</span>}
        {mode === 'shop'
          ? <Btn act="buyItem" args={[it.id]} className="btn sm" disabled={own || locked || S.gold < it.p}>{own ? 'มีแล้ว' : 'ซื้อ'}</Btn>
          : <span className="row"><Btn act="equip" args={[it.id]} className={`btn sm ${worn ? 'ghost' : ''}`} disabled={worn}>{worn ? 'สวมอยู่' : 'สวมใส่'}</Btn>
            {it.p > 0 && !worn && <Btn act="sellItem" args={[it.id]} className={`btn sm ${ui.confirmSell === it.id ? 'bad' : 'ghost'}`} title={`ขายได้ทอง ${sellPrice(it)}`}>{ui.confirmSell === it.id ? `ยืนยันขาย ${sellPrice(it)}` : 'ขาย'}</Btn>}</span>}
      </div>
    );
  });
}
function Preview({ sel }) {
  const it = sel && ITEM[sel];
  const id = it ? myId({ eq: { ...S.eq, [it.slot]: it.id } }) : myId();
  return (
    <div className="dressing">
      <div className="showcase"><Sprite k="me" id={id} scale={3} /></div>
      <div className="small" style={{ textAlign: 'center' }}>{it ? `ลองสวม: ${it.n}` : 'ชุดปัจจุบัน'}</div>
    </div>
  );
}
export function WardrobeView() {
  const [sel, setSel] = useState(null), [slot, setSlot] = useState('all');
  const mine = ITEMS.filter(i => S.inv.includes(i.id) && (slot === 'all' || i.slot === slot));
  return (
    <section className="win">
      <div className="sechead"><h2>แต่งตัว</h2><span className="small">ชุดไม่ผูกกับอาชีพ แต่งได้อิสระ ค่าพลังมาจากอุปกรณ์ที่สวม</span></div>
      <div className="wardrobe">
        <div>
          <Preview sel={sel} />
          <div className="slots">
            {SLOTS.map(([k, n]) => {
              const it = ITEM[S.eq[k]];
              return <div key={k} className="slotrow"><span className="lbl">{n}</span><span className="nm">{it ? it.n : '—'}</span>
                {it && k !== 'body' ? <Btn act="unequip" args={[k]} className="btn sm ghost">ถอด</Btn> : <span />}</div>;
            })}
            <div className="small">รวม ATK +{eqSt('atk')} · DEF +{eqSt('def')} · HP +{eqSt('hp')}</div>
          </div>
        </div>
        <div>
          <div className="opts" role="group" aria-label="กรองตามช่อง">
            {[['all', 'ทั้งหมด'], ...SLOTS].map(([k, n]) => <button key={k} className={`opt ${slot === k ? 'on' : ''}`} aria-pressed={slot === k} onClick={() => setSlot(k)}>{n}</button>)}
          </div>
          <div className="itemlist"><ItemRows items={mine} mode="inv" sel={sel} setSel={setSel} /></div>
          <p className="small">ได้อุปกรณ์เพิ่มจากร้านค้า หีบสมบัติ บอสในเกต และโรงตีเหล็กในเมือง · ขายของที่ไม่ใช้ได้ 40% ของราคาร้าน (ต้องถอดก่อน)</p>
        </div>
      </div>
    </section>
  );
}

export function ShopView() {
  const [sel, setSel] = useState(null), [slot, setSlot] = useState('weapon');
  const pp = 20 + S.lv * 2, mp = 18 + S.lv * 2, sp = 40 + S.lv * 2, spLeft = SPOT_PER_DAY - S.today.spot;
  const row = (nm, desc, price, k, extra, ok = true) => (
    <div className="item">
      <div><div className="nm">{nm}</div><div className="small">{desc}</div></div>
      <span className="price">{price.toLocaleString()} ทอง</span>
      <div className="row">{extra}<Btn act="buy" args={[k]} className="btn sm" disabled={!(S.gold >= price && ok)}>ซื้อ</Btn></div>
    </div>
  );
  const drink = (k, ok) => <Btn act="quaff" args={[k]} className="btn sm ghost" disabled={!ok}>ใช้</Btn>;
  const list = ITEMS.filter(i => i.p > 0 && i.slot === slot).sort((a, b) => a.lv - b.lv || a.p - b.p);
  return (
    <section className="win">
      <div className="sechead"><h2>ร้านค้าสมาคมฮันเตอร์</h2><span className="pts">{S.gold.toLocaleString()} ทอง</span></div>
      <div>
        {row(<>ยาฟื้นพลัง <span className="small">มี {S.pot}</span></>, `ฟื้น HP ${Math.round(50 * potMul())}%`, pp, 'pot', drink('pot', S.pot && S.hp < maxHp()))}
        {row(<>ยามานา <span className="small">มี {S.mpot}</span></>, `ฟื้น MP ${Math.round(60 * potMul())}%`, mp, 'mpot', drink('mpot', S.mpot && S.mp < maxMp()))}
        {row(<>ยากระตุ้นพลังงาน <span className="small">มี {S.spot}</span></>, `ฟื้นสตามินา 40 ใช้ได้เฉพาะในเมือง · ร้านมีขายวันละ ${SPOT_PER_DAY} ขวด (เหลือ ${spLeft})`, sp, 'spot', drink('spot', S.spot && S.sta < maxSta()), spLeft > 0)}
        {row(<>หินปลุกพลังใหม่ <span className="small">มี {S.stone}</span></>, 'สุ่มอาชีพและสกิลใหม่ทั้งหมด หรือใช้สุ่มตัวเลือกคลาสรองใหม่', 400, 'stone')}
        {row(<>คริสตัลอัญเชิญ ×100 <span className="small">มี {S.gems}</span></>, 'ใช้อัญเชิญฮีโร่ที่แท็บฮีโร่', 500, 'gems')}
        {row(<>ยาล้างแต้มสถานะ <span className="small">มี {S.respec || 0}</span></>, 'คืนแต้มสถานะที่ลงไว้ทั้งหมดให้กระจายใหม่ ใช้ได้ที่หน้าสถานะ', respecCost(S.lv), 'respec')}
      </div>
      <div className="sechead"><h2>อุปกรณ์สวมใส่</h2><span className="small">ชี้หรือแตะเพื่อลองสวมก่อนซื้อ</span></div>
      <div className="wardrobe">
        <Preview sel={sel} />
        <div>
          <div className="opts" role="group" aria-label="ประเภทอุปกรณ์">{SLOTS.map(([k, n]) => <button key={k} className={`opt ${slot === k ? 'on' : ''}`} aria-pressed={slot === k} onClick={() => setSlot(k)}>{n}</button>)}</div>
          <div className="itemlist"><ItemRows items={list} mode="shop" sel={sel} setSel={setSel} /></div>
        </div>
      </div>
    </section>
  );
}

/* ---------- heroes (gacha) ---------- */
export function HeroesView() {
  const owned = HEROES.filter(h => S.heroes[h.id]).sort((a, b) => b.star - a.star || (S.party.includes(b.id) - S.party.includes(a.id)));
  return (
    <section className="win">
      <div className="sechead"><h2>อัญเชิญฮีโร่</h2><span className="pts gem">{S.gems.toLocaleString()} คริสตัล</span></div>
      <div className="summon">
        <div className="gacha-portal" aria-hidden="true"><i /><i /><i /></div>
        <div className="sysbox">
          <p>ฮีโร่ระดับ ★1 ถึง ★5 พร้อมนิสัยสุ่มที่มีผลต่อการต่อสู้ ได้ตัวซ้ำจะทะลวงขีดจำกัด (สูงสุด +{MAX_LIMIT})</p>
          <div className="odds">{[5, 4, 3, 2, 1].map(n => <span key={n} style={{ color: STAR[n].col }}>★{n} {STAR[n].rate}%</span>)}</div>
          <div className="row">
            <Btn act="summon" args={[1]} className="btn solid" disabled={S.gems < PULL_COST}>อัญเชิญ ×1<small>{PULL_COST}</small></Btn>
            <Btn act="summon" args={[10]} className="btn ult" disabled={S.gems < PULL10_COST}>อัญเชิญ ×10<small>{PULL10_COST} · การันตี ★3+</small></Btn>
          </div>
          <p className="small">การันตี ★5 ในอีก {PITY - S.pity} ครั้ง · ได้คริสตัลจากบอส ยอดฝีมือ หีบ ภารกิจรายวัน และร้านค้า</p>
          <div className="banner rate"><span>ตู้เรตอัปสัปดาห์นี้: <b style={{ color: STAR[bannerHero(S.day).star].col }}>{'★'.repeat(bannerHero(S.day).star)} {bannerHero(S.day).n}</b> · {bannerHero(S.day).t} · ได้ ★{bannerHero(S.day).star} แล้วมีโอกาส {Math.round(RATEUP * 100)}% เป็นตัวนี้ · เปลี่ยนทุก 7 วัน</span></div>
        </div>
      </div>
      <div className="sechead"><h2>ทีมฮีโร่ {S.party.length}/{maxParty()}</h2><span className="small">ฮีโร่ในทีมสู้ข้างคุณทุกเทิร์น · ช่องเพิ่มที่เลเวล 10 และ 20{partyAtkBonus() ? ` · บัฟ ATK +${partyAtkBonus()}%` : ''}{partyCover() ? ` · รับดาเมจแทน ${partyCover()}%` : ''}</span></div>
      {owned.length ? <div className="herogrid">{owned.map(h => <HeroCard key={h.id} h={h} />)}</div>
        : <p className="small">ยังไม่มีฮีโร่ ลองอัญเชิญครั้งแรกด้วยคริสตัลเริ่มต้น</p>}
      <p className="small">สะสมแล้ว {owned.length}/{HEROES.length} ตัว</p>
    </section>
  );
}
export function HeroCard({ h, fresh, kind }) {
  const o = S.heroes[h.id], inParty = S.party.includes(h.id), p = o && PERSONA[o.trait], sig = SIGNATURE[h.id];
  return (
    <div className={`hcard ${STAR[h.star].frame} ${inParty ? 'inparty' : ''}`}>
      <div className="hart"><Sprite k="hero" id={h.id} scale={2} /></div>
      <div className="hinfo">
        <Stars n={h.star} />
        <div className="hname">{h.n}{o && o.lim ? <span className="lim">+{o.lim}</span> : null}</div>
        <div className="small">{h.t} · {ROLE[h.role].n}{o && !fresh ? ` · Lv ${o.lv || 1}/${heroCapOf(h.id)}` : ''}</div>
        {o && !fresh && <div className="bar xp hxp"><i style={{ width: `${(o.lv || 1) >= heroCapOf(h.id) ? 100 : Math.min(100, (o.xp || 0) / heroNeed(o.lv || 1) * 100)}%` }} /></div>}
        {o && !fresh && <div className="small">{(o.lv || 1) >= HERO_SKILL_LV ? <b style={{ color: 'var(--cyan)' }}>สกิล: {HERO_SKILL[h.role].n}</b> : `ปลดสกิลที่ Lv ${HERO_SKILL_LV}`} · {HERO_SKILL[h.role].d}</div>}
        {p && <div className="persona" title={p.d}><span className="chip">{p.n}</span> <span className="small">{p.d}</span></div>}
        {sig && <div className="small sig">★ {sig.n}: {sig.d}</div>}
        {fresh ? <div className="small quote">“{p ? p.q : h.q}”</div> : <>
          <div className="small">{inParty ? 'อยู่ในทีมผจญภัย' : jobOf(h.id) ? `ทำงานที่${jobOf(h.id).n}` : 'ว่างงาน'}{o.refuse ? ` · ไม่ยอมทำงาน ${o.refuse} วันติด` : ''}{o.refuse >= STRIKES && <span className="chip bad">ดื้องาน</span>}</div>
          <div className="row" style={{ justifyContent: 'space-between' }}><span className="small">พลัง {heroPow(h.id)}</span>
            <span className="row"><Btn act="toggleParty" args={[h.id]} className={`btn sm ${inParty ? 'ghost' : ''}`}>{inParty ? 'ออกจากทีม' : 'เข้าทีม'}</Btn>{!inParty && <Dismantle id={h.id} />}</span></div>
        </>}
        {kind === 'limit' && <span className="chip warn">ทะลวงขีดจำกัด!</span>}
        {kind === 'refund' && <span className="chip cy">ขีดจำกัดเต็ม แปลงเป็นคริสตัล</span>}
        {kind === 'new' && <span className="chip ok">ใหม่!</span>}
      </div>
    </div>
  );
}

/* ---------- codex ---------- */
export function CodexView() {
  return (
    <section className="win">
      <div className="sechead"><h2>สมุดอาชีพ</h2><span className="small">ค้นพบแล้ว {S.found.length} / {CLASSES.length}</span></div>
      <p className="hint">ทุกอาชีพมีคุณลักษณะ พาสซีฟ สกิล และร่างตื่นรู้ของตัวเอง ภาพประกอบเป็นชุดแนะนำของอาชีพ ส่วนชุดจริงของคุณแต่งได้อิสระ</p>
      <div className="codex">
        {CLASSES.map(c => {
          const known = !c.hidden || S.found.includes(c.id), cur = S.cls === c.id;
          return (
            <div key={c.id} className={`cx ${cur ? 'cur' : ''}`}>
              <div className="cxhead"><Sprite k="cls" id={`${c.id}|${S.look.hair}|${S.look.hc}|${S.look.skin}|${S.look.eye}`} v={known ? 'n' : 'sil'} scale={1} />
                <div><div className={`cxname ${known ? 'r-' + rc(c.rar) : ''}`}>{known ? c.name : '???'}</div>
                  <span className={`chip r-${rc(c.rar)}`}>{known ? c.rar : '???'}</span> {cur && <span className="chip">อาชีพปัจจุบัน</span>}</div></div>
              {known ? <>
                <div className="small"><b style={{ color: 'var(--gold)' }}>{c.trait.n}</b> · {fxText(c.trait.fx)}</div>
                <div className="pool">Active: <b>{c.act.map(id => ACT[id].n).join(', ')}</b></div>
                <div className="pool">Passive: <b>{c.pasIds.map(id => PAS[id].n).join(', ')}</b></div>
                <div className="pool">ตื่นรู้: <b style={{ color: c.aw.glow }}>{c.aw.name}</b> · {c.aw.trait.n} · สกิลสุดยอด {c.aw.ult.n}</div>
              </> : <div className="small">{c.cond ? c.cond.hint : 'อาชีพลับ ได้จากการปลุกพลังเท่านั้น โอกาสต่ำมาก'}</div>}
              {c.cond && S.unlocked.includes(c.id) && !cur && <Btn act="switchCls" args={[c.id]} className="btn sm">เปลี่ยนเป็นอาชีพนี้</Btn>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- shadow army ---------- */
export function ShadowView() {
  return (
    <section className="win">
      <div className="sechead"><h2>กองทัพเงา</h2><span className="pts">{S.shadows.length} / {maxSh()}</span></div>
      <p className="hint">ล้มบอสแล้วสั่ง ARISE เพื่อดึงเงามาเป็นทหาร เงาจะโจมตีทุกเทิร์นและแข็งแกร่งขึ้นเมื่อคุณเลเวลอัป ความจุเพิ่ม 1 ทุก 8 เลเวล</p>
      {S.shadows.length ? S.shadows.map((sh, i) => (
        <div className="shrow" key={i}><Sprite k="mob" id={shSrc(sh)} v="shadow" scale={1} />
          <div><div className="r-S" style={{ fontWeight: 600 }}>{sh.name}</div><div className="small">ดึงจากเกตแรงก์ {sh.rank} ตอนเลเวล {sh.lv}</div>
            {shadowFx(sh).length > 0 && <div className="small" style={{ color: 'var(--violet)' }}>{shadowFx(sh).map(f => `${f.n}: ${f.d}`).join(' · ')}</div>}</div>
          <span className="price" style={{ color: 'var(--violet)' }}>ATK {shAtk(sh)}</span><Btn act="release" args={[i]} className="btn sm ghost">ปลดปล่อย</Btn></div>
      )) : <p className="small">ยังไม่มีเงา ลองเคลียร์เกตแรงก์ E แล้วสั่ง ARISE ใส่หัวหน้าก๊อบลิน</p>}
    </section>
  );
}
export { GC, SUB_REROLL };
