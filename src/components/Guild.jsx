import { S, ui } from '../game/store.js';
import { fxText, GATES } from '../game/data.js';
import { canAwaken2 } from '../game/engine.js';
import { awName } from '../game/rules.js';
import { QUEST_TYPES, ACHIEVEMENTS, AW2_LV, AW2_GATE, AW2_STATS, AW2_FX, REBIRTH_LV, REBIRTH_PTS, REBIRTH_FX } from '../game/meta.js';
import { RES_NAME } from '../game/town.js';
import { Btn } from './ui.jsx';

/* Hunter association: daily quest board, achievements + titles, second awakening and rebirth */
export function GuildView() {
  const got = ACHIEVEMENTS.filter(a => S.ach[a.id]);
  return (
    <section className="win">
      <div className="sechead"><h2>สมาคมฮันเตอร์</h2><span className="small">ภารกิจเปลี่ยนใหม่ทุกวัน</span></div>
      <div className="eyebrow">กระดานภารกิจวันที่ {S.day}</div>
      <div className="quests">{(S.quests || []).map((q, i) => {
        const T = QUEST_TYPES[q.type], have = q.type === 'deliver' ? S.town.res[q.res] : q.p, ok = have >= q.need;
        return (
          <div key={i} className={`qcard ${q.done ? 'done' : ''}`}>
            <b>{T.n(q.need, RES_NAME[q.res])}</b>
            <div className="bar xp"><i style={{ width: `${Math.min(100, have / q.need * 100)}%` }} /></div>
            <div className="small">{Math.min(have, q.need)}/{q.need} · รางวัล ทอง {q.rw.gold} · คริสตัล {q.rw.gems}{q.rw.shards ? ` · เศษวิญญาณ ${q.rw.shards}` : ''}</div>
            <Btn act="claimQuest" args={[i]} className="btn sm solid" disabled={q.done || !ok}>{q.done ? 'รับแล้ว' : q.type === 'deliver' ? 'ส่งมอบ' : 'รับรางวัล'}</Btn>
          </div>
        );
      })}</div>

      <div className="sechead"><h2>ความสำเร็จและฉายา</h2><span className="small">สำเร็จแล้ว {got.length}/{ACHIEVEMENTS.length} · ฉายาที่ใช้: {S.title && ACHIEVEMENTS.find(a => a.id === S.title) ? ACHIEVEMENTS.find(a => a.id === S.title).title.n : 'ไม่มี'}</span></div>
      <div className="achgrid">{ACHIEVEMENTS.map(a => {
        const on = !!S.ach[a.id], worn = S.title === a.id;
        return (
          <div key={a.id} className={`ach ${on ? 'on' : ''}`}>
            <b>{a.n}</b><span className="small">{a.d} · คริสตัล {a.gems}</span>
            {a.title && <span className="small">ฉายา “{a.title.n}” · {fxText(a.title.fx)}</span>}
            {a.title && on && <Btn act="setTitle" args={[a.id]} className={`btn sm ${worn ? 'ult' : 'ghost'}`}>{worn ? 'ใช้อยู่' : 'ใช้ฉายานี้'}</Btn>}
          </div>
        );
      })}</div>

      <div className="sechead"><h2>ขีดจำกัดถัดไป</h2></div>
      <div className="paths">
        <div className={`path ${S.aw2 || canAwaken2() ? 'on' : ''}`} style={{ '--pc': '#ffe27a' }}>
          <b>ตื่นรู้ขั้นที่ 2</b>
          <span className="small">เงื่อนไข: ตื่นรู้แล้ว · เลเวล {AW2_LV} · ล้มบอส{GATES[AW2_GATE].name} · ได้ค่าสถานะทุกอย่าง +{AW2_STATS} และ {fxText(AW2_FX)}</span>
          {S.aw2 ? <span className="chip warn">ตื่นรู้ขั้นที่ 2 แล้ว · {S.awake ? awName() : ''}</span> : <Btn act="awaken2" className="btn sm ult" disabled={!canAwaken2()}>ปลดผนึกขั้นที่ 2</Btn>}
        </div>
        <div className={`path ${S.lv >= REBIRTH_LV ? 'on' : ''}`} style={{ '--pc': '#c08cff' }}>
          <b>จุติใหม่ {S.rebirth ? `(ทำไปแล้ว ${S.rebirth} ครั้ง)` : ''}</b>
          <span className="small">เลเวล {REBIRTH_LV} ขึ้นไป · กลับไปเลเวล 1 แต้มที่ลงไว้ถูกล้าง แต่อาชีพ การตื่นรู้ อุปกรณ์ ฮีโร่ และเมืองยังอยู่ · ได้โบนัสถาวรต่อครั้ง {fxText(REBIRTH_FX)} และแต้มเริ่มต้น {REBIRTH_PTS} × จำนวนครั้ง</span>
          <Btn act="rebirth" className={`btn sm ${ui.confirmRebirth ? 'bad' : ''}`} disabled={S.lv < REBIRTH_LV || !!S.run}>{ui.confirmRebirth ? 'กดอีกครั้งเพื่อจุติใหม่' : 'จุติใหม่'}</Btn>
        </div>
      </div>
    </section>
  );
}
