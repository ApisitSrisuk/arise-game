/* ================= MONSTERS =================
   Every monster has a trait that changes how its fight plays, and a weakness, so the skill you pick matters.
   Weakness keys match skill effects already in ACT: burn = skills that burn (fire, poison),
   pierce = armour-piercing skills, multi = 3+ hits (or the shadow army), stun = control skills.
   Bosses enter a second phase at half HP. Names match GATES mobs/boss and the sprite table. */
export const TRAITS = {
  pack: { n: 'ฝูง', d: 'มากัน 3 ตัว โจมตี 3 ครั้งต่อเทิร์น · การโจมตีหนึ่งครั้งล้มได้ทีละตัว สกิลหลายครั้งจึงกวาดได้ทั้งฝูง' },
  armored: { n: 'เกราะหนา', d: 'ดาเมจที่ไม่ทะลุเกราะลดลงครึ่งหนึ่ง' },
  evasive: { n: 'ว่องไว', d: 'หลบการโจมตีปกติ 35% · สกิลโดนเสมอ' },
  regen: { n: 'ฟื้นตัวเร็ว', d: 'ฟื้น HP 5% ทุกเทิร์น · ดาเมจต่อเนื่องหยุดการฟื้นตัว' },
  venom: { n: 'พิษร้าย', d: 'โดนโจมตีแล้วติดพิษ เสีย HP 4% นาน 3 เทิร์น · สกิลฟื้น HP ล้างพิษ' },
  enrage: { n: 'คลั่ง', d: 'ATK +50% เมื่อ HP ต่ำกว่า 40%' },
  ward: { n: 'โล่เวท', d: 'ดาเมจจากสกิล -40%' },
  ambush: { n: 'ซุ่มโจมตี', d: 'ลงมือก่อนเมื่อเริ่มต่อสู้ ถ้า PER ของคุณต่ำกว่าเลเวลมัน ×0.8' },
  drain: { n: 'ดูดชีวิต', d: 'ฟื้น HP ครึ่งหนึ่งของดาเมจที่ทำใส่คุณ' },
};
export const WEAK = {
  burn: { n: 'ไฟและพิษ', test: f => !!f.burn },
  pierce: { n: 'ทะลุเกราะ', test: f => !!f.pierce },
  multi: { n: 'โจมตีหลายครั้ง', test: f => (f.hits || 1) >= 3 || !!f.army },
  stun: { n: 'สะกด', test: f => !!f.stun },
};
export const WEAK_MUL = 1.5;
/* second phase: rage = ATK ×1.25 and heavy attack every 2 turns, regen = 4%/turn, ward = skill damage -40%,
   guard = summons a shield worth 25% max HP that soaks damage first */
export const PHASES = {
  rage: { n: 'คลุ้มคลั่ง', d: 'ATK เพิ่มขึ้นและปล่อยท่าไม้ตายถี่ขึ้น' },
  regen: { n: 'ฟื้นคืนร่าง', d: 'ฟื้น HP ทุกเทิร์น' },
  ward: { n: 'เกราะเวท', d: 'สกิลได้ผลน้อยลง' },
  guard: { n: 'เรียกองครักษ์', d: 'ลูกน้องเข้ามาบังดาเมจ' },
};

const M = (t, weak, p2, line) => ({ t, weak, p2, line });
export const MON = {
  /* E ถ้ำก๊อบลิน */
  'ก๊อบลิน': M(['pack'], 'burn'),
  'ก๊อบลินนักธนู': M(['evasive'], 'multi'),
  'หมาป่าเขี้ยวเหล็ก': M(['ambush'], 'stun'),
  'หัวหน้าก๊อบลิน': M(['enrage'], 'stun', 'guard', 'หัวหน้าก๊อบลินเป่านกหวีด ลูกน้องวิ่งเข้ามาบัง!'),
  /* D เหมืองร้าง */
  'มดยักษ์': M(['armored'], 'pierce'),
  'ตะขาบหิน': M(['venom'], 'burn'),
  'โครงกระดูกทหาร': M(['regen'], 'multi'),
  'ราชินีมดหิน': M(['armored'], 'pierce', 'guard', 'ราชินีมดหินเรียกมดงานมาสร้างกำแพงหิน!'),
  /* C ป่าเงาจันทร์ */
  'หมาป่าเงา': M(['pack'], 'multi'),
  'ออร์คล่าสัตว์': M(['enrage'], 'stun'),
  'ภูตไม้': M(['regen'], 'burn'),
  'จ่าฝูงหมาป่าสีเลือด': M(['ambush', 'drain'], 'stun', 'rage', 'จ่าฝูงหอนใส่พระจันทร์ ดวงตาแดงก่ำ!'),
  /* B ปราสาทน้ำแข็ง */
  'เอลฟ์น้ำแข็ง': M(['evasive'], 'burn'),
  'โกเลมหิมะ': M(['armored'], 'burn'),
  'หมีขาวคลั่ง': M(['enrage'], 'stun'),
  'นักรบเอลฟ์น้ำแข็ง': M(['evasive'], 'burn', 'ward', 'นักรบเอลฟ์ห่อหุ้มตัวด้วยเกราะน้ำแข็ง!'),
  /* A วิหารปีศาจ */
  'อสูรเขาคู่': M(['armored'], 'pierce'),
  'ปีศาจคลั่ง': M(['drain'], 'stun'),
  'อัศวินมืด': M(['ward'], 'pierce'),
  'ขุนนางปีศาจ': M(['drain', 'ward'], 'stun', 'rage', 'ขุนนางปีศาจปลดผนึกพลังนรก!'),
  /* S เกาะรังมด */
  'มดทหาร': M(['pack'], 'multi'),
  'มดพิษ': M(['venom'], 'burn'),
  'มดราชองครักษ์': M(['armored'], 'pierce'),
  'ราชามด': M(['evasive', 'drain'], 'stun', 'regen', 'ราชามดกัดกินลูกน้องเพื่อฟื้นพลัง!'),
  /* A+ หุบเขามังกรหลับ */
  'ลูกมังกรไฟ': M(['pack'], 'multi'),
  'อัศวินกระดูกมังกร': M(['armored'], 'pierce'),
  'ไวเวิร์นพิษ': M(['venom'], 'stun'),
  'มังกรเพลิงโบราณ': M(['ward', 'enrage'], 'pierce', 'rage', 'มังกรโบราณคำรามจนหุบเขาสั่นสะเทือน!'),
  /* guild rank exam */
  'ผู้คุมสอบสมาคม': M(['evasive'], 'stun', 'rage', 'ผู้คุมสอบถอดแว่นออก "ต่อจากนี้คือของจริง"'),
  /* anywhere */
  'มิมิค': M(['ambush'], 'pierce'),
  'ผู้คุมบททดสอบ': M(['ward'], null, 'rage', 'ผู้คุมบททดสอบยอมรับในตัวคุณ และเริ่มสู้จริงจัง!'),
};
export const monOf = name => MON[name.replace(/^ยอดฝีมือ·/, '')] || M([], null);
/* a shadow raised with ARISE keeps its source monster's traits as abilities */
export const SHADOW_FX = {
  pack: { n: 'ฝูงเงา', d: 'โจมตี 2 ครั้ง ครั้งละ 60%' },
  armored: { n: 'เกราะเงา', d: 'รับดาเมจแทนคุณ 6% (รวมทุกตัวไม่เกิน 30%)' },
  evasive: { n: 'เงาว่องไว', d: 'โอกาส 30% โจมตีแรง ×2' },
  regen: { n: 'เงาฟื้นคืน', d: 'ฟื้น HP ให้คุณ 2% ทุกเทิร์น' },
  venom: { n: 'เงาพิษ', d: 'โอกาส 25% ทำให้ศัตรูติดดาเมจต่อเนื่อง' },
  enrage: { n: 'เงาคลั่ง', d: 'ดาเมจ ×1.6 เมื่อศัตรู HP ต่ำกว่า 40%' },
  ward: { n: 'เงาเวท', d: 'โจมตีทะลุเกราะ' },
  ambush: { n: 'เงาซุ่ม', d: 'การโจมตีแรกในแต่ละการต่อสู้แรง ×2.5' },
  drain: { n: 'เงาดูดเลือด', d: 'ฟื้น HP ให้คุณ 20% ของดาเมจที่ทำ' },
};
export const shadowTraits = sh => monOf(sh.src || sh.name.replace(/^เงา·/, '')).t;
export const shadowFx = sh => shadowTraits(sh).map(t => SHADOW_FX[t]).filter(Boolean);
export const hasTr = (e, t) => !!(e.tr && e.tr.includes(t));
export const weakHit = (e, f) => !!(e.wk && f && WEAK[e.wk].test(f));
/* a pack shares one HP bar split into equal bodies; this is how many are still standing */
export const packLeft = e => e.pack ? Math.max(0, Math.ceil(e.hp * e.pack / e.max - 1e-9)) : 1;
/* the ultimate skill recharges for this many enemy turns after use */
export const ULT_CD = 2;

/* base stats for a foe of level lv, before its type (mob/elite/boss) and the gate affix.
   The curve's shape follows player damage/HP growth (measured with `node scripts/sim/sim.mjs --probe`);
   FOE_K scales it at each gate's mob level and is tuned by `node scripts/sim/tune.mjs` to: ~3 turns per mob
   and ~90% first-run clears at the gate's own level. Re-run the tuner when player power changes. */
export const FOE_K = { lv: [2.5, 7.5, 14.5, 22.5, 32.5, 47.5], hp: [0.163, 0.187, 0.547, 0.938, 0.691, 1.13], atk: [0.283, 1.618, 0.859, 4.711, 3.454, 4.497] };
const knob = (k, lv) => {
  const L = FOE_K.lv, v = FOE_K[k]; if (lv <= L[0]) return v[0];
  for (let i = 1; i < L.length; i++) if (lv <= L[i]) return v[i - 1] + (v[i] - v[i - 1]) * (lv - L[i - 1]) / (L[i] - L[i - 1]);
  return v[v.length - 1];
};
export const foeBase = lv => ({ hp: (30 + lv * 36 + lv * lv * 8) * knob('hp', lv), atk: (6 + lv * 5.9 + lv * lv * .044) * knob('atk', lv) });
