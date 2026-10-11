/* All game audio is synthesised with the Web Audio API: no sound files to download.
   Graph: sfx bus + music bus → master → speakers. Settings persist per browser. */
const SKEY = 'arise-audio-v1';
const DEF = { muted: false, master: .8, sfx: .8, music: .45 };
let settings = { ...DEF };
try { settings = { ...DEF, ...JSON.parse(localStorage.getItem(SKEY) || '{}') }; } catch (e) { /* storage unavailable */ }

let ctx = null, master, sfxBus, musicBus, noiseBuf;
const listeners = new Set();
export const getSettings = () => settings;
export const onSettings = f => { listeners.add(f); return () => listeners.delete(f); };

function applyGains() {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(settings.muted ? 0 : settings.master, t, .03);
  sfxBus.gain.setTargetAtTime(settings.sfx, t, .03);
  musicBus.gain.setTargetAtTime(settings.music * .55, t, .03);
}
export function setSettings(patch) {
  settings = { ...settings, ...patch };
  try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch (e) { /* storage unavailable */ }
  applyGains(); listeners.forEach(f => f(settings));
  if (!settings.muted && settings.music > 0) startMusic();
}

/* browsers only allow audio after a user gesture, so the context is created on the first click/key */
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); sfxBus = ctx.createGain(); musicBus = ctx.createGain();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    sfxBus.connect(master); musicBus.connect(master); master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyGains();
    document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : ctx.resume(); });
  }
  if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
  startMusic();
}

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- instruments ---------- */
function env(g, t, a, peak, d, sus, r, end) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(.0001, peak * sus), t + a + d);
  g.gain.setValueAtTime(Math.max(.0001, peak * sus), end);
  g.gain.exponentialRampToValueAtTime(.0001, end + r);
}
function tone(bus, { type = 'square', f, f2, t, dur, vol = .2, a = .005, d = .05, sus = .5, r = .08, q, cut, vib }) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = vib; lg.gain.value = f * .012; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + r + .05); }
  let node = o;
  if (cut) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; if (q) fl.Q.value = q; o.connect(fl); node = fl; }
  node.connect(g); g.connect(bus);
  env(g, t, a, vol, d, sus, r, t + dur);
  o.start(t); o.stop(t + dur + r + .05);
}
function noise(bus, { t, dur, vol = .2, type = 'bandpass', f = 1200, f2, q = 1, a = .003, r = .05 }) {
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  s.connect(fl); fl.connect(g); g.connect(bus);
  env(g, t, a, vol, dur * .3, .4, r, t + dur);
  s.start(t, Math.random() * .5); s.stop(t + dur + r + .05);
}
const arp = (bus, notes, t, step, o) => notes.forEach((m, i) => tone(bus, { f: mtof(m), t: t + i * step, dur: step * .9, ...o }));

/* ---------- sound effects ---------- */
const SFX = {
  click: t => tone(sfxBus, { type: 'square', f: 1320, t, dur: .025, vol: .05, r: .03, cut: 4000 }),
  roll: t => tone(sfxBus, { type: 'square', f: 900 + Math.random() * 500, t, dur: .02, vol: .05, r: .02, cut: 3500 }),
  swing: t => noise(sfxBus, { t, dur: .12, vol: .16, f: 900, f2: 3800, q: 1.4 }),
  hit: t => { noise(sfxBus, { t, dur: .07, vol: .32, type: 'lowpass', f: 2600 }); tone(sfxBus, { type: 'triangle', f: 220, f2: 70, t, dur: .1, vol: .35 }); },
  crit: t => { noise(sfxBus, { t, dur: .1, vol: .4, type: 'lowpass', f: 4200 }); tone(sfxBus, { type: 'square', f: 300, f2: 60, t, dur: .14, vol: .22, cut: 1800 }); tone(sfxBus, { type: 'sine', f: 1760, t: t + .02, dur: .18, vol: .12, r: .2 }); },
  skill: t => { arp(sfxBus, [72, 76, 79, 84], t, .045, { type: 'triangle', vol: .14, r: .1 }); noise(sfxBus, { t, dur: .3, vol: .08, f: 3000, f2: 9000, q: 2 }); },
  shadow: t => { tone(sfxBus, { type: 'sawtooth', f: 110, f2: 55, t, dur: .25, vol: .14, cut: 700 }); noise(sfxBus, { t, dur: .2, vol: .1, f: 600, f2: 200 }); },
  heal: t => arp(sfxBus, [79, 84, 88, 91], t, .06, { type: 'sine', vol: .14, r: .25, sus: .7 }),
  miss: t => noise(sfxBus, { t, dur: .18, vol: .12, f: 2400, f2: 700, q: 3 }),
  eswing: t => noise(sfxBus, { t, dur: .14, vol: .14, f: 500, f2: 1600, q: 1.2 }),
  hurt: t => { tone(sfxBus, { type: 'square', f: 260, f2: 90, t, dur: .16, vol: .18, cut: 1400 }); noise(sfxBus, { t, dur: .08, vol: .22, type: 'lowpass', f: 1800 }); },
  heavy: t => { tone(sfxBus, { type: 'sine', f: 120, f2: 35, t, dur: .35, vol: .5 }); noise(sfxBus, { t, dur: .25, vol: .3, type: 'lowpass', f: 900 }); },
  burn: t => noise(sfxBus, { t, dur: .22, vol: .12, f: 1800, f2: 600, q: .8 }),
  freeze: t => arp(sfxBus, [96, 91, 98], t, .04, { type: 'sine', vol: .07, r: .15 }),
  kill: t => { tone(sfxBus, { type: 'square', f: 600, f2: 90, t, dur: .22, vol: .14, cut: 2400 }); arp(sfxBus, [84, 88, 91], t + .12, .05, { type: 'triangle', vol: .1, r: .15 }); },
  levelup: t => { arp(sfxBus, [72, 76, 79, 84, 88], t, .07, { type: 'square', vol: .09, cut: 3200, r: .1 }); tone(sfxBus, { type: 'triangle', f: mtof(91), t: t + .35, dur: .35, vol: .12, r: .3, vib: 6 }); },
  perk: t => { arp(sfxBus, [81, 88, 93], t, .05, { type: 'sine', vol: .12, r: .3 }); noise(sfxBus, { t, dur: .4, vol: .05, f: 7000, q: 3 }); },
  coin: t => { tone(sfxBus, { type: 'square', f: mtof(83), t, dur: .06, vol: .07, cut: 5000 }); tone(sfxBus, { type: 'square', f: mtof(88), t: t + .06, dur: .18, vol: .07, cut: 5000, r: .12 }); },
  chest: t => { SFX.coin(t); arp(sfxBus, [86, 90, 93, 98], t + .15, .05, { type: 'sine', vol: .07, r: .2 }); },
  trap: t => { noise(sfxBus, { t, dur: .1, vol: .25, f: 3000, q: 2 }); tone(sfxBus, { type: 'sawtooth', f: 180, f2: 80, t, dur: .15, vol: .12, cut: 1200 }); },
  gate: t => { noise(sfxBus, { t, dur: .7, vol: .16, f: 300, f2: 2400, q: 2 }); tone(sfxBus, { type: 'sawtooth', f: 55, f2: 110, t, dur: .7, vol: .12, cut: 500 }); },
  arise: t => { tone(sfxBus, { type: 'sine', f: 80, f2: 30, t, dur: .8, vol: .55 }); noise(sfxBus, { t, dur: 1, vol: .14, f: 200, f2: 1800, q: 4 }); arp(sfxBus, [57, 64, 69, 72], t + .3, .12, { type: 'sawtooth', vol: .06, cut: 1400, r: .5 }); },
  awaken: t => { [60, 64, 67, 72].forEach(m => tone(sfxBus, { type: 'triangle', f: mtof(m), t, dur: 1.1, vol: .1, a: .2, r: .6, vib: 5 })); arp(sfxBus, [84, 88, 91, 96], t + .4, .08, { type: 'sine', vol: .1, r: .4 }); },
  reveal: t => { [67, 71, 74].forEach(m => tone(sfxBus, { type: 'triangle', f: mtof(m), t, dur: .5, vol: .1, a: .02, r: .4 })); arp(sfxBus, [79, 83, 86, 91], t + .1, .06, { type: 'square', vol: .05, cut: 3000, r: .2 }); },
  glitch: t => { for (let i = 0; i < 6; i++) tone(sfxBus, { type: 'square', f: 200 + Math.random() * 1600, t: t + i * .05, dur: .04, vol: .06, cut: 3000 }); },
  death: t => arp(sfxBus, [67, 63, 60, 55], t, .18, { type: 'triangle', vol: .14, r: .3 }),
  rest: t => arp(sfxBus, [72, 67, 64, 60], t, .12, { type: 'sine', vol: .1, r: .3 }),
  error: t => tone(sfxBus, { type: 'square', f: 140, t, dur: .14, vol: .08, cut: 900 }),
  extra: t => arp(sfxBus, [88, 93, 100], t, .035, { type: 'sine', vol: .1, r: .15 }),
};
export function sfx(name) {
  if (!ctx || settings.muted || ctx.state !== 'running' || !SFX[name]) return;
  SFX[name](ctx.currentTime + .005);
}

/* ---------- music: a tiny step sequencer with three original loops ---------- */
const TRACKS = {
  // town: bright C major, 104 bpm — C  Am  F  G
  town: { bpm: 104, chords: [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 59, 62, 67]],
    lead: [76, 0, 79, 0, 81, 79, 76, 0, 74, 0, 72, 0, 74, 76, 0, 0, 72, 0, 76, 0, 77, 76, 72, 0, 69, 0, 72, 0, 74, 0, 0, 0,
      77, 0, 76, 0, 74, 0, 72, 0, 69, 0, 72, 74, 76, 0, 0, 0, 79, 0, 77, 0, 76, 0, 74, 0, 71, 0, 74, 0, 72, 0, 0, 0], drums: 'soft', pad: false },
  // dungeon: D minor, 92 bpm — Dm  Bb  C  A
  dungeon: { bpm: 92, chords: [[38, 62, 65, 69], [34, 62, 65, 70], [36, 60, 64, 67], [33, 61, 64, 69]],
    lead: [74, 0, 0, 77, 0, 76, 74, 0, 72, 0, 0, 0, 69, 0, 0, 0, 70, 0, 0, 74, 0, 72, 70, 0, 69, 0, 0, 0, 65, 0, 0, 0,
      67, 0, 0, 72, 0, 70, 69, 0, 67, 0, 64, 0, 0, 0, 0, 0, 69, 0, 73, 0, 76, 0, 73, 0, 69, 0, 0, 0, 0, 0, 0, 0], drums: 'march', pad: true },
  // boss: E minor, 138 bpm — Em  C  D  B
  boss: { bpm: 138, chords: [[40, 64, 67, 71], [36, 64, 67, 72], [38, 62, 66, 69], [35, 63, 66, 71]],
    lead: [76, 0, 76, 79, 0, 76, 0, 74, 76, 0, 0, 0, 71, 0, 0, 0, 72, 0, 72, 76, 0, 72, 0, 71, 72, 0, 0, 0, 67, 0, 0, 0,
      74, 0, 74, 78, 0, 74, 0, 72, 74, 0, 0, 0, 69, 0, 0, 0, 75, 0, 78, 0, 81, 0, 78, 0, 75, 0, 71, 0, 0, 0, 0, 0], drums: 'drive', pad: true },
};
let want = 'town', playing = null, step = 0, nextT = 0, timer = null;
export function setTrack(name) { want = TRACKS[name] ? name : 'town'; }
function startMusic() {
  if (!ctx || timer || settings.muted || settings.music <= 0) return;
  nextT = ctx.currentTime + .1; step = 0; playing = want;
  timer = setInterval(schedule, 30);
}
function schedule() {
  if (!ctx || ctx.state !== 'running') return;
  if (settings.muted || settings.music <= 0) { clearInterval(timer); timer = null; return; }
  while (nextT < ctx.currentTime + .15) {
    if (step % 16 === 0 && playing !== want) { playing = want; step = 0; }
    playStep(TRACKS[playing], step, nextT);
    nextT += 60 / TRACKS[playing].bpm / 4; step = (step + 1) % 64;
  }
}
function playStep(tr, s, t) {
  const sp = 60 / tr.bpm / 4, ch = tr.chords[Math.floor(s / 16) % 4], b = s % 16;
  if (b % 4 === 0 || (tr.drums === 'drive' && b % 2 === 0)) tone(musicBus, { type: 'square', f: mtof(ch[0]), t, dur: sp * (tr.drums === 'drive' ? 1.5 : 3), vol: .16, cut: 520, sus: .6 });
  const ap = ch.slice(1); tone(musicBus, { type: 'square', f: mtof(ap[s % ap.length] + (b >= 8 && tr.drums !== 'march' ? 12 : 0)), t, dur: sp * .5, vol: .035, cut: 2600, sus: .3, r: .05 });
  if (tr.pad && b === 0) ap.forEach(m => tone(musicBus, { type: 'sawtooth', f: mtof(m - 12), t, dur: sp * 15, vol: .028, a: .4, cut: 900, sus: .8, r: .4 }));
  const n = tr.lead[s]; if (n) tone(musicBus, { type: 'triangle', f: mtof(n), t, dur: sp * 1.7, vol: .13, sus: .55, r: .12, vib: 5.5 });
  if (tr.drums === 'soft') { if (b % 8 === 0) kick(t, .35); if (b % 4 === 2) hat(t, .04); }
  if (tr.drums === 'march') { if (b === 0 || b === 10) kick(t, .45); if (b === 4 || b === 12) snare(t, .12); if (b % 2 === 0) hat(t, .025); }
  if (tr.drums === 'drive') { if (b % 4 === 0) kick(t, .55); if (b % 8 === 4) snare(t, .18); hat(t, b % 2 ? .02 : .045); }
}
const kick = (t, v) => tone(musicBus, { type: 'sine', f: 150, f2: 42, t, dur: .14, vol: v, r: .05 });
const hat = (t, v) => noise(musicBus, { t, dur: .03, vol: v, type: 'highpass', f: 7000, r: .02 });
const snare = (t, v) => { noise(musicBus, { t, dur: .1, vol: v, f: 1800, q: .7 }); tone(musicBus, { type: 'triangle', f: 190, f2: 120, t, dur: .06, vol: v * .7 }); };
