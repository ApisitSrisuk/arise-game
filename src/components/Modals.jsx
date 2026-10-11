import { useEffect, useRef, useState } from 'react';
import { S, ui } from '../game/store.js';
import { CLASSES, HAIR, HC, SKIN, EYES, ORIGINS, STATS, ACT, PAS, GR, fxText, AFFINITY, AFF_NEED, nextGrade } from '../game/data.js';
import { cls, rc, stat, jobName, actDesc, pasDesc, awName, awGlow, awTrait, openPaths, ultId, mpCost, myId } from '../game/rules.js';
import { H, finishRoll } from '../game/engine.js';
import { HERO, STAR } from '../game/heroes.js';
import { SUB, SUB_PAIR, SUB_REROLL } from '../game/subclass.js';
import { STARTER } from '../game/items.js';
import { meIdOf } from '../art/sprites.js';
import { sfx } from '../audio/sound.js';
import { Sprite, Btn } from './ui.jsx';
import { DayReport } from './Town.jsx';
import { SkillList, TraitBox, HeroCard } from './views.jsx';

const Wrap = ({ wide, children }) => <div id="modal"><div className={`mwrap win ${wide ? 'wide' : ''}`}>{children}</div></div>;
const Primary = ({ act, args, children, className = 'btn solid' }) => {
  const ref = useRef(null); useEffect(() => { ref.current && ref.current.focus(); }, []);
  return <button ref={ref} className={className} onClick={() => H[act](...(args || []))}>{children}</button>;
};

export function Modal() {
  const m = ui.modal;
  switch (m.type) {
    case 'intro': return <Intro />;
    case 'create': return <Create />;
    case 'roll': return <ClassRoll res={m.res} first={m.first} />;
    case 'reveal': return <Reveal first={m.first} />;
    case 'unlock': return <Unlock cid={m.cid} />;
    case 'pick': return <Pick />;
    case 'awakenPath': return <AwakenPath />;
    case 'awakened': return <Awakened />;
    case 'arise': return <Arise name={m.name} atk={m.atk} />;
    case 'summon': return <Summon res={m.res} />;
    case 'sub': return <SubPick />;
    case 'day': return <DayReport rep={m.rep} day={m.day} />;
    case 'aw2': return <Aw2 />;
    case 'rebirth': return <Rebirth />;
    default: return null;
  }
}

function Intro() {
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] แจ้งเตือน</div>
    <h1 className="big">คุณมีคุณสมบัติที่จะเป็น “ผู้เล่น”</h1>
    <p>เมื่อยอมรับ คุณจะได้สร้างตัวตนของตัวเอง จากนั้นระบบจะปลุกพลัง สุ่มอาชีพ และสุ่มสกิลพร้อมเกรดให้ แม้ได้อาชีพเดียวกันสกิลก็อาจไม่เหมือนกัน</p>
    <div className="row"><Primary act="toCreate">ยอมรับ</Primary></div>
    <p className="small">หากปฏิเสธ หัวใจของคุณจะหยุดเต้นภายใน 0.02 วินาที</p>
  </div></Wrap>;
}

function Create() {
  const d = ui.draft, L = d.look;
  const sw = (key, arr, label) => (
    <div className="fgroup"><span className="flabel">{label}</span><div className="opts">
      {arr.map((c, i) => <button key={i} className={`sw ${L[key] === i ? 'on' : ''}`} style={{ '--c': c }} aria-label={`${label} ${i + 1}`} aria-pressed={L[key] === i} onClick={() => H.look(key, i)} />)}
    </div></div>
  );
  return <Wrap wide><div className="sysbox">
    <div className="eyebrow">[ระบบ] สร้างตัวตนของผู้เล่น</div>
    <div className="create">
      <div className="fgroup"><div className="rollstage"><Sprite k="me" id={meIdOf({ look: L, eq: STARTER })} scale={4} /></div><Btn act="randLook" className="btn ghost">สุ่มรูปลักษณ์</Btn></div>
      <div className="sysbox">
        <div className="fgroup"><label htmlFor="hname">ชื่อฮันเตอร์</label><input id="hname" maxLength={16} value={d.name} autoComplete="off" onChange={e => H.name(e.target.value)} onKeyDown={e => e.key === 'Enter' && H.confirmCreate()} /></div>
        <div className="fgroup"><span className="flabel">ทรงผม</span><div className="opts">{HAIR.map((h, i) => <button key={i} className={`opt ${L.hair === i ? 'on' : ''}`} aria-pressed={L.hair === i} onClick={() => H.look('hair', i)}>{h.n}</button>)}</div></div>
        {sw('hc', HC, 'สีผม')}{sw('skin', SKIN, 'สีผิว')}{sw('eye', EYES, 'สีตา')}
        <p className="small">เริ่มเกมด้วยเสื้อยืดกับยีนส์ แล้วไปหาชุดใหม่ได้จากร้านค้าและดันเจี้ยน</p>
      </div>
    </div>
    <div className="fgroup"><span className="flabel">ภูมิหลังก่อนปลุกพลัง</span><div className="origins">
      {ORIGINS.map(o => <button key={o.id} className={`pick ${d.origin === o.id ? 'on' : ''}`} aria-pressed={d.origin === o.id} onClick={() => H.origin(o.id)}><b>{o.n}</b><span className="small">{o.d}</span></button>)}
    </div></div>
    <div className="row"><button className="btn solid" onClick={() => H.confirmCreate()}>ยืนยันและเริ่มปลุกพลัง</button><span className="small">อาชีพจะถูกสุ่มหลังจากนี้ เลือกเองไม่ได้</span></div>
  </div></Wrap>;
}

/* slot-machine style class roll; hidden classes glitch before revealing */
function ClassRoll({ res, first }) {
  const vis = CLASSES.filter(c => !c.hidden), target = CLASSES.find(c => c.id === res);
  const [cur, setCur] = useState(vis[0]), [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let steps = 0, delay = 55, i = Math.floor(Math.random() * vis.length), alive = true, timer;
    const total = reduce ? 1 : 22;
    const tick = () => {
      if (!alive) return;
      if (steps >= total) {
        if (target.hidden && !glitch) { setGlitch(true); sfx('glitch'); timer = setTimeout(() => { if (!alive) return; setGlitch(false); setCur(target); timer = setTimeout(() => alive && finishRoll(res, first), 650); }, 1300); return; }
        setCur(target); timer = setTimeout(() => alive && finishRoll(res, first), 650); return;
      }
      setCur(vis[i++ % vis.length]); sfx('roll'); steps++; delay *= 1.09; timer = setTimeout(tick, delay);
    };
    tick();
    return () => { alive = false; clearTimeout(timer); };
  }, [res]);
  const hp = CLASSES.filter(c => c.hidden).reduce((a, c) => a + c.w, 0);
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] กำลังวิเคราะห์คุณสมบัติของผู้เล่น…</div>
    <div className="rollstage"><Sprite k="cls" id={`${cur.id}|${S.look.hair}|${S.look.hc}|${S.look.skin}|${S.look.eye}`} v={glitch ? 'sil' : 'n'} scale={3} /></div>
    <div className={`slot ${glitch ? 'r-X glitch' : 'r-' + rc(cur.rar)}`}>{glitch ? '▓▒░ ข้อมูลถูกปิดกั้น ░▒▓' : cur.name}</div>
    <div className="odds">{['C', 'B', 'A'].map(r => <span key={r} className={`r-${r}`}>{r} · {CLASSES.filter(c => !c.hidden && c.rar === r).length} อาชีพ</span>)}<span className="r-X">??? · อาชีพลับ {Math.round(hp * 10) / 10}%</span></div>
  </div></Wrap>;
}

function Reveal({ first }) {
  const c = cls();
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] การปลุกพลังเสร็จสมบูรณ์</div>
    {c.hidden && <p className={`r-${rc(c.rar)}`}>[ระบบ] ตรวจพบอาชีพลับ ข้อมูลของอาชีพนี้ถูกบันทึกลงสมุดอาชีพแล้ว</p>}
    <div className="clsres"><div className="rollstage" style={{ minHeight: 0, padding: '8px 14px' }}><Sprite k="me" id={myId()} scale={2} /></div>
      <div><div className={`rar r-${rc(c.rar)}`}>{c.rar}</div><div className={`cname r-${rc(c.rar)}`}>{jobName()}</div><p>{c.desc}</p></div></div>
    <TraitBox c={c} />
    <div className="eyebrow">สกิลที่ระบบสุ่มให้</div><SkillList />
    <div className="basest">{STATS.map(([k, , ab]) => <span key={k}>{ab} <b>{stat(k)}</b></span>)}</div>
    <div className="row"><Primary act="closeModal">{first ? 'เริ่มล่าเกต' : 'ยอมรับ'}</Primary></div>
  </div></Wrap>;
}

function Unlock({ cid }) {
  const c = CLASSES.find(x => x.id === cid);
  return <Wrap><div className="sysbox">
    <div className="eyebrow r-X">[ระบบ] ตรวจพบเงื่อนไขอาชีพลับ</div>
    <div className="rollstage"><Sprite k="cls" id={c.id} scale={3} /></div>
    <div className="cname r-X" style={{ textAlign: 'center' }}>{c.name}</div><p>{c.desc}</p><p className="small">{c.trait.n}: {fxText(c.trait.fx)}</p>
    <p className="small">ถ้าเปลี่ยนอาชีพ สกิลจะถูกสุ่มใหม่ทั้งหมด เลเวล แต้ม การตื่นรู้ คลาสรอง และชุดที่สวมยังอยู่ครบ</p>
    <div className="row"><Primary act="switchCls" args={[c.id]}>เปลี่ยนเป็นอาชีพนี้</Primary><Btn act="closeModal" className="btn ghost">ไว้ทีหลัง</Btn></div>
  </div></Wrap>;
}

function Pick() {
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] ปลดล็อกสกิลใหม่ · เลือก 1 อย่าง</div>
    <div className="picks">{(S.pickOpts || []).map((o, i) => {
      if (o.k === 'up') {
        const s = S[o.w][o.i], d = o.w === 'act' ? ACT[s.id] : PAS[s.id], ng = nextGrade(s.g);
        return <button key={i} className="pick" onClick={() => H.choose(i)}><span className="eyebrow">ยกระดับสกิล</span><b>{d.n} <span className={`chip r-${s.g}`}>{s.g}</span> → <span className={`chip r-${ng}`}>{ng}</span></b><span className="small">{o.w === 'act' ? actDesc(s.id, ng) : pasDesc(s.id, ng)}</span></button>;
      }
      const d = o.k === 'act' ? ACT[o.id] : PAS[o.id];
      return <button key={i} className="pick" onClick={() => H.choose(i)}><span className="eyebrow">{o.k === 'act' ? 'ACTIVE ใหม่ · MP ' + d.mp : 'PASSIVE ใหม่'}</span><b>{d.n} <span className={`chip r-${o.g}`}>{o.g}</span></b><span className="small">{o.k === 'act' ? actDesc(o.id, o.g) : pasDesc(o.id, o.g)}</span></button>;
    })}</div>
    <p className="small">ตัวเลือกสุ่มไว้แล้ว ปิดหน้าต่างก็ยังเป็นตัวเลือกเดิม · Active สูงสุด 4 · Passive สูงสุด 5</p>
    <div className="row"><Btn act="closeModal" className="btn ghost">ไว้ทีหลัง</Btn></div>
  </div></Wrap>;
}

/* awakening: pure class path or a hybrid path opened by a high non-main stat */
function AwakenPath() {
  const c = cls(), open = openPaths(c);
  const paths = [{ k: 'pure', name: c.aw.name, glow: c.aw.glow, trait: c.aw.trait, ult: c.aw.ult, d: 'สายดั้งเดิมของอาชีพ', ok: true },
    ...STATS.filter(([k]) => k !== c.main).map(([k, , ab]) => ({ k, ab, name: awName(c, k), glow: AFFINITY[k].glow, trait: AFFINITY[k].trait, ult: AFFINITY[k].ult, d: AFFINITY[k].d, ok: open.includes(k) }))];
  return <Wrap wide><div className="sysbox">
    <div className="eyebrow">[ระบบ] เลือกเส้นทางการตื่นรู้</div>
    <p>ร่างตื่นรู้ขึ้นกับค่าสถานะที่คุณฝึกมา สายผสมเปิดเมื่อค่าสถานะรองถึง {AFF_NEED}</p>
    <div className="picks">{paths.map(p => (
      <button key={p.k} className="pick" disabled={!p.ok} style={{ '--pc': p.glow }} onClick={() => H.awaken(p.k)}>
        <span className="eyebrow">{p.k === 'pure' ? 'สายดั้งเดิม' : `สาย${p.ab} · ${stat(p.k)}/${AFF_NEED}`}{!p.ok && ' · ยังไม่เปิด'}</span>
        <b style={{ color: p.ok ? p.glow : undefined }}>{p.name}</b>
        <span className="small">{p.d} · {p.trait.n}: {fxText(p.trait.fx)} · สกิลสุดยอด {p.ult.n}</span>
      </button>
    ))}</div>
  </div></Wrap>;
}

function Awakened() {
  const c = cls(), t = awTrait(c), u = ACT[ultId()];
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] ภารกิจเปลี่ยนอาชีพสำเร็จ</div><div className="arise-big gold">AWAKENED</div>
    <div className="transform">
      <div className="rollstage" style={{ minHeight: 0, padding: 10 }}><Sprite k="me" id={myId({ glow: null, path: 'pure' })} scale={2} /></div>
      <div className="arrow">→</div>
      <div className="rollstage" style={{ minHeight: 0, padding: 10 }}><Sprite k="me" id={myId()} scale={2} /></div>
    </div>
    <div className="cname" style={{ textAlign: 'center', color: awGlow() }}>{awName()}</div>
    <div className="trait aw"><b>พลังตื่นรู้ · {t.n}</b><br />{fxText(t.fx)}</div>
    <div className="sk"><span className="chip r-U">ULT</span><div><b>{u.n}</b><span className="kind">MP {mpCost(u)}</span><div className="small">{actDesc(ultId(), 'C')}</div></div></div>
    <p className="small">ค่าสถานะทุกอย่าง +8 · ถ้าเปลี่ยนอาชีพภายหลัง สายที่เลือกจะติดตัวไปด้วย</p>
    <div className="row"><Primary act="closeModal">รับพลัง</Primary></div>
  </div></Wrap>;
}

function Arise({ name, atk }) {
  return <Wrap><div className="sysbox">
    <div className="arise-big">ARISE</div>
    <div className="rollstage"><Sprite k="mob" id={name} v="shadow" scale={3} /></div>
    <p style={{ textAlign: 'center' }}>เงาของ <b className="r-S">{name}</b> ลุกขึ้นจากความมืด<br />พลังโจมตี {atk} · ภักดีต่อคุณตลอดไป</p>
    <div className="row" style={{ justifyContent: 'center' }}><Primary act="closeModal">รับเข้ากองทัพ</Primary></div>
  </div></Wrap>;
}

/* gacha results: cards flip in one by one, the best star sets the portal colour */
function Summon({ res }) {
  const [shown, setShown] = useState(0), best = Math.max(...res.map(r => HERO[r.id].star));
  useEffect(() => {
    sfx('gate'); let i = 0, alive = true;
    const step = () => { if (!alive) return; i++; setShown(i); const st = HERO[res[i - 1].id].star; sfx(st >= 5 ? 'awaken' : st >= 4 ? 'reveal' : 'coin'); if (i < res.length) setTimeout(step, res.length > 1 ? 280 : 0); };
    const t = setTimeout(step, 700); return () => { alive = false; clearTimeout(t); };
  }, [res]);
  return <Wrap wide><div className="sysbox">
    <div className="eyebrow">[ระบบ] ผลการอัญเชิญ</div>
    <div className={`summon-burst ${shown ? 'go' : ''}`} style={{ '--sc': STAR[best].col }}><span>{shown ? (best >= 5 ? 'LEGENDARY' : best >= 4 ? 'EPIC' : 'SUMMON') : '…'}</span></div>
    <div className="herogrid results">{res.slice(0, shown).map((r, i) => <HeroCard key={i} h={HERO[r.id]} fresh kind={r.kind} />)}</div>
    <div className="row"><Primary act="closeModal">ตกลง</Primary>{S.gems >= 100 && shown === res.length && <Btn act="summon" args={[res.length === 10 ? 10 : 1]} className="btn ult" disabled={S.gems < (res.length === 10 ? 900 : 100)}>อัญเชิญอีก ×{res.length}</Btn>}</div>
  </div></Wrap>;
}

function SubPick() {
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] คลาสรอง · เลือก 1 อย่าง</div>
    <p>คลาสรองให้โบนัสติดตัวและสกิลเพิ่ม 1 อย่าง ถ้าเข้าคู่กับอาชีพหลักโบนัสจะแรงขึ้น ×{SUB_PAIR} เปลี่ยนอาชีพหลักภายหลัง คลาสรองยังอยู่</p>
    <div className="picks">{(S.subOffer || []).map((o, i) => {
      const sc = SUB[o.id], paired = sc.pair.includes(S.cls);
      return <button key={i} className="pick" onClick={() => H.pickSub(i)}>
        <span className="eyebrow">{sc.rar} · สกิล {sc.act.n} (MP {sc.act.mp}){paired && ' · เข้าคู่กับอาชีพหลัก'}</span>
        <b>{sc.name} <span className={`chip r-${o.g}`}>{o.g}</span>{paired && <span className="chip vi">เข้าคู่ ×{SUB_PAIR}</span>}</b>
        <span className="small">{sc.desc} · {fxText(sc.fx, GR[o.g].m * (paired ? SUB_PAIR : 1))}</span>
      </button>;
    })}</div>
    <div className="row"><Btn act="rerollSub" className="btn" disabled={S.stone < SUB_REROLL}>สุ่มใหม่ (หินปลุกพลัง {SUB_REROLL} · มี {S.stone})</Btn><Btn act="closeModal" className="btn ghost">ไว้ทีหลัง</Btn></div>
  </div></Wrap>;
}

function Aw2() {
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] ปลดผนึกขั้นที่สอง</div><div className="arise-big gold">AWAKENED II</div>
    <div className="rollstage"><Sprite k="me" id={myId()} scale={3} /></div>
    <div className="cname" style={{ textAlign: 'center', color: awGlow() }}>{jobName()}</div>
    <p className="small" style={{ textAlign: 'center' }}>ค่าสถานะทุกอย่าง +10 · พลังสกิล +30% · ดาเมจใส่บอส +20% · ดาเมจคริติคอล +20%</p>
    <div className="row" style={{ justifyContent: 'center' }}><Primary act="closeModal">รับพลัง</Primary></div>
  </div></Wrap>;
}
function Rebirth() {
  return <Wrap><div className="sysbox">
    <div className="eyebrow">[ระบบ] จุติใหม่ครั้งที่ {S.rebirth}</div><div className="arise-big">REBIRTH</div>
    <p style={{ textAlign: 'center' }}>คุณกลับสู่เลเวล 1 พร้อมพลังที่สะสมไว้ข้ามภพ<br />อาชีพ การตื่นรู้ อุปกรณ์ ฮีโร่ และเมืองยังอยู่ครบ · แต้มเริ่มต้น {S.pts}</p>
    <div className="row" style={{ justifyContent: 'center' }}><Primary act="closeModal">เริ่มใหม่อีกครั้ง</Primary></div>
  </div></Wrap>;
}
