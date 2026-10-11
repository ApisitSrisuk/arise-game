/* Meta progression content: guild quests, achievements + titles, daily gate rotation, dungeon breaks,
   second awakening and rebirth. Pure data + small helpers; the engine applies them. */

/* ---------- guild quest board: 3 quests a day ---------- */
export const QUEST_TYPES = {
  kill: { n: n => `กำจัดมอนสเตอร์ ${n} ตัว`, need: lv => 6 + Math.floor(lv / 4) },
  elite: { n: n => `ล้มศัตรูระดับยอดฝีมือ ${n} ตัว`, need: () => 2 },
  boss: { n: n => `ล้มบอสเกตใดก็ได้ ${n} ครั้ง`, need: () => 1 },
  deliver: { n: (n, r) => `ส่งมอบ${r} ${n} หน่วยให้สมาคม`, need: lv => 15 + lv * 2 },
  summon: { n: n => `อัญเชิญฮีโร่ ${n} ครั้ง`, need: () => 1 },
  work: { n: n => `ให้ฮีโร่ทำงานในเมืองสำเร็จ ${n} ครั้ง`, need: () => 3 },
};
export const DELIVER_RES = ['food', 'wood', 'stone', 'iron'];
export const questReward = (type, lv) => ({
  gold: 60 + lv * 12 + (type === 'boss' ? 150 : 0),
  gems: type === 'boss' || type === 'elite' ? 25 : 10,
  shards: type === 'deliver' ? 6 : 0,
});

/* ---------- achievements: each grants crystals and some unlock a title (titles carry a tiny bonus) ---------- */
const A = (id, n, d, test, gems, title) => ({ id, n, d, test, gems, title });
export const ACHIEVEMENTS = [
  A('kill10', 'ล่าครั้งแรก', 'กำจัดมอนสเตอร์ 10 ตัว', S => S.kills >= 10, 20),
  A('kill200', 'นักล่าตัวจริง', 'กำจัดมอนสเตอร์ 200 ตัว', S => S.kills >= 200, 80, { n: 'นักล่าผู้ไม่หยุดพัก', fx: { xp: 5 } }),
  A('kill1000', 'ตำนานแห่งเกต', 'กำจัดมอนสเตอร์ 1,000 ตัว', S => S.kills >= 1000, 200, { n: 'ตำนานแห่งเกต', fx: { atkp: 4 } }),
  A('gateE', 'เคลียร์เกตแรก', 'ล้มบอสเกตแรงก์ E', S => (S.cleared[0] || 0) > 0, 30),
  A('gateB', 'ฮันเตอร์แรงก์ B', 'ล้มบอสเกตแรงก์ B', S => (S.cleared[3] || 0) > 0, 100, { n: 'ผู้พิชิตปราสาทน้ำแข็ง', fx: { defp: 3 } }),
  A('gateS', 'ฮันเตอร์แรงก์ S', 'ล้มบอสเกตแรงก์ S', S => (S.cleared[5] || 0) > 0, 300, { n: 'ผู้ล้มราชามด', fx: { bossdmg: 6 } }),
  A('lv20', 'เลเวล 20', 'ถึงเลเวล 20', S => S.lv >= 20, 50),
  A('lv40', 'เลเวล 40', 'ถึงเลเวล 40', S => S.lv >= 40, 150),
  A('awake', 'ตื่นรู้', 'ผ่านภารกิจเปลี่ยนอาชีพ', S => S.awake, 60, { n: 'ผู้ตื่นรู้', fx: { skillamp: 3 } }),
  A('hybrid', 'สายผสม', 'ตื่นรู้ด้วยสายผสม', S => S.awake && S.awPath && S.awPath !== 'pure', 80, { n: 'ผู้แหวกขนบ', fx: { crit: 2 } }),
  A('hero10', 'เจ้าของทีม', 'มีฮีโร่ 10 ตัว', S => Object.keys(S.heroes).length >= 10, 60),
  A('star5', 'ดวงเฮง', 'อัญเชิญฮีโร่ ★5 ได้', S => (S.stats || {}).got5 > 0, 100, { n: 'ผู้ถูกเลือกโดยกาชา', fx: { gold: 5 } }),
  A('dismantle', 'หัวหน้าใจเหี้ยม', 'ย่อยฮีโร่ 5 ตัว', S => ((S.stats || {}).dismantled || 0) >= 5, 40, { n: 'หัวหน้าใจเหี้ยม', fx: { stam: 3 } }),
  A('hall3', 'นายกเทศมนตรี', 'อัปศาลากลางถึงระดับ 3', S => S.town && S.town.hall >= 3, 120, { n: 'นายกเทศมนตรี', fx: { gold: 6 } }),
  A('wardrobe', 'แฟชั่นนิสต้า', 'มีอุปกรณ์ 25 ชิ้น', S => S.inv.length >= 25, 60, { n: 'แฟชั่นนิสต้า', fx: { dodge: 2 } }),
  A('shadow5', 'ราชันย์แห่งเงา', 'มีทหารเงา 5 ตัว', S => S.shadows.length >= 5, 100, { n: 'ผู้บัญชาการเงา', fx: { shadowp: 10 } }),
  A('break', 'ผู้ปกป้องเมือง', 'ปิดเกตก่อนเกตแตก 3 ครั้ง', S => ((S.stats || {}).breaksStopped || 0) >= 3, 120, { n: 'ผู้ปกป้องเมือง', fx: { hpmax: 4 } }),
  A('quests', 'ขาประจำสมาคม', 'ทำภารกิจสมาคม 20 ครั้ง', S => ((S.stats || {}).quests || 0) >= 20, 100, { n: 'ขาประจำสมาคม', fx: { xp: 4 } }),
  A('rankC', 'ฮันเตอร์ทางการ', 'สอบเลื่อนเป็นแรงก์ C', S => ['C', 'B', 'A', 'S'].includes(S.hrank), 60),
  A('rankS', 'แรงก์ S แห่งชาติ', 'สอบเลื่อนเป็นแรงก์ S', S => S.hrank === 'S', 300, { n: 'ฮันเตอร์แรงก์ S แห่งชาติ', fx: { gold: 8 } }),
  A('tower10', 'นักปีนหอคอย', 'ผ่านหอคอยไร้สิ้นสุดถึงชั้น 10', S => ((S.tower || {}).best || 0) >= 10, 120, { n: 'ผู้พิชิตหอคอย', fx: { hpmax: 3 } }),
  A('rebirth', 'จุติใหม่', 'จุติใหม่ครั้งแรก', S => (S.rebirth || 0) > 0, 300, { n: 'ผู้ข้ามภพ', fx: { atkp: 5, hpmax: 5 } }),
];
export const ACH = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));

/* ---------- daily gate: one regular gate a day pays more ---------- */
export const DAILY_GATE_MUL = 1.5;
export const dailyGate = (day, n) => (day * 5 + 3) % n;

/* ---------- dungeon break: a gate threatens to break; clear its boss before the deadline ---------- */
export const BREAK_CHANCE = .3, BREAK_DAYS = 3, BREAK_LOSS = .3;
export const breakReward = g => ({ gems: 40 + g * 15, gold: 200 + g * 150 });

/* ---------- second awakening + rebirth ---------- */
export const AW2_LV = 40, AW2_GATE = 5, AW2_STATS = 10;
export const AW2_FX = { skillamp: 30, bossdmg: 20, critdmg: 20 };
export const REBIRTH_LV = 50, REBIRTH_PTS = 10;
/* each rebirth: permanent bonus stacked per rebirth */
export const REBIRTH_FX = { xp: 15, atkp: 6, hpmax: 6, defp: 4 };

/* ---------- respec ---------- */
export const respecCost = lv => 300 + lv * 25;

/* ---------- sweep: re-clear a beaten gate instantly at a reduced payout ---------- */
export const SWEEP_LV = 3, SWEEP_MUL = .7;
