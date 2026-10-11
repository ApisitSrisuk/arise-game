import { useEffect, useState } from 'react';
import { ui } from '../game/store.js';
import { getSettings, setSettings, onSettings, unlock } from '../audio/sound.js';

export function Toasts() {
  return (
    <div id="toasts" aria-live="polite">
      {ui.toasts.map(t => <div key={t.id} className={`toast ${t.k} ${t.out ? 'out' : ''}`}><span>[ระบบ]</span> {t.t}</div>)}
    </div>
  );
}

/* floating sound control: mute toggle + master / effects / music sliders, saved per browser */
export function SoundControl() {
  const [s, setS] = useState(getSettings()), [open, setOpen] = useState(false);
  useEffect(() => onSettings(setS), []);
  const slider = (key, label) => (
    <label className="vol"><span>{label}</span>
      <input type="range" min="0" max="100" value={Math.round(s[key] * 100)} onChange={e => { unlock(); setSettings({ [key]: +e.target.value / 100, muted: false }); }} />
      <b>{Math.round(s[key] * 100)}</b>
    </label>
  );
  return (
    <div className="soundctl">
      <button className="sbtn" aria-label={s.muted ? 'เปิดเสียง' : 'ปิดเสียง'} title={s.muted ? 'เปิดเสียง' : 'ปิดเสียง'} onClick={() => { unlock(); setSettings({ muted: !s.muted }); }}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
          {s.muted ? <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" fill="none" /> : <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" />}</svg>
      </button>
      <button className="sbtn" aria-expanded={open} aria-label="ตั้งค่าเสียง" title="ตั้งค่าเสียง" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 4v16M12 4v16M19 4v16" stroke="currentColor" strokeWidth="2" /><rect x="3" y="13" width="4" height="3" fill="currentColor" /><rect x="10" y="7" width="4" height="3" fill="currentColor" /><rect x="17" y="11" width="4" height="3" fill="currentColor" /></svg>
      </button>
      {open && (
        <div className="soundpanel win">
          <div className="eyebrow">ตั้งค่าเสียง</div>
          <label className="vol tog"><span>เปิดเสียง</span><input type="checkbox" checked={!s.muted} onChange={e => { unlock(); setSettings({ muted: !e.target.checked }); }} /></label>
          {slider('master', 'เสียงรวม')}{slider('sfx', 'เอฟเฟกต์')}{slider('music', 'เพลง')}
        </div>
      )}
    </div>
  );
}
