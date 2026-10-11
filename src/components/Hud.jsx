import { S, ui } from '../game/store.js';
import { cls, rc, fatigue, FAT, jobName, maxHp, maxMp, maxSta, xpNeed, rank, myId, pv } from '../game/rules.js';
import { Sprite, Bar } from './ui.jsx';
import { H } from '../game/engine.js';
import { STRIKES } from '../game/town.js';
import { ACH } from '../game/meta.js';

const questReady = () => (S.quests || []).filter(q => !q.done && (q.type === 'deliver' ? S.town.res[q.res] >= q.need : q.p >= q.need)).length || '';
const stubborn = () => Object.values(S.heroes).filter(h => (h.refuse || 0) >= STRIKES).length || '';

export function Hud() {
  const c = cls(), f = fatigue();
  return (
    <header className="hud win">
      <div className="who">
        <div className="avatar"><Sprite k="me" id={myId()} scale={1} /></div>
        <div>
          <div className="eyebrow">ผู้เล่น · วันที่ {S.day}</div>
          <div className="nm">{S.name}</div>
          {S.title && ACH[S.title] && ACH[S.title].title && <div className="htitle">“{ACH[S.title].title.n}”</div>}
          <div className="job">
            <span className={`chip r-${rc(c.rar)}`}>{c.rar}</span>{' '}
            <span style={S.awake ? { color: c.aw.glow } : undefined}>{jobName()}</span>{' '}
            <span className={`chip ${FAT[f].c}`} title={FAT[f].d}>{FAT[f].n}</span>
          </div>
        </div>
      </div>
      <div><div className="lbl">เลเวล</div><div className="lv">{S.lv}</div></div>
      <div><div className="lbl">แรงก์</div><div className="rkv">{rank()}</div></div>
      <div className="money">
        <div><div className="lbl">ทอง</div><div className="gv">{S.gold.toLocaleString()}</div></div>
        <div><div className="lbl">คริสตัล</div><div className="gv gem">{S.gems.toLocaleString()}</div></div>
      </div>
      <div className="bars">
        <Bar l="HP" v={S.hp} m={maxHp()} k="hp" />
        <Bar l="MP" v={S.mp} m={maxMp()} k="mp" />
        <Bar l="STA" v={S.sta} m={maxSta()} k={'st f' + f} />
        <Bar l="EXP" v={S.xp} m={xpNeed()} k="xp" />
      </div>
    </header>
  );
}

export function Tabs() {
  const t = [['gates', 'เกต'], ['status', 'สถานะ', (S.pts || 0) + (S.picks || 0) + (S.subOffer ? 1 : 0)], ['daily', 'ตารางวัน', S.daily.claimed ? '' : '!'],
    ['wardrobe', 'แต่งตัว'], ['heroes', 'ฮีโร่'], ['town', 'เมือง', stubborn()], ['guild', 'สมาคม', questReady()], ['shop', 'ร้านค้า'], ['codex', 'สมุดอาชีพ']];
  if (pv('extract')) t.push(['shadow', 'กองทัพเงา']);
  if (!t.some(x => x[0] === ui.tab)) ui.tab = 'gates';
  return (
    <nav className="tabs" role="tablist">
      {t.map(([id, n, b]) => (
        <button key={id} className="tab" role="tab" aria-selected={ui.tab === id} onClick={() => H.tab(id)}>
          {n}{b ? <span className="dot">{b}</span> : null}
        </button>
      ))}
    </nav>
  );
}
