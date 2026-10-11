/* ================= DUNGEON PATHS AND EVENTS =================
   Before the 2nd and 3rd rooms of a gate the hunter picks one of two doors (risk vs reward).
   Event rooms offer choices; the last option of every event is always the safe one (walk past).
   Prices in event text use {price}, filled in by the engine from the player's level. */
export const DOORS = {
  mob: { n: 'ทางเดินมืด', d: 'ได้ยินเสียงมอนสเตอร์ตัวเดียว', room: 'mob', w: 28 },
  elite: { n: 'ประตูเหล็กบานใหญ่', d: 'ศัตรูระดับยอดฝีมือ อันตรายแต่ได้ของมากกว่า', room: 'elite', w: 20 },
  rest: { n: 'ทางที่มีแสงสีฟ้า', d: 'น่าจะได้พักฟื้น', room: 'spring', w: 12 },
  event: { n: 'ทางแยกที่มีเสียงคน', d: 'มีบางอย่างรออยู่ ให้คุณเลือกว่าจะทำอะไร', room: 'event', w: 20 },
  mystery: { n: 'ประตูลึกลับ', d: 'สมบัติ กับดัก หรือมอนสเตอร์ ไม่มีใครรู้', room: 'mystery', w: 20 },
};
/* two different doors, weighted */
export function rollDoors() {
  const keys = Object.keys(DOORS), out = [];
  while (out.length < 2) {
    const pool = keys.filter(k => !out.includes(k)); let r = Math.random() * pool.reduce((a, k) => a + DOORS[k].w, 0);
    out.push(pool.find(k => (r -= DOORS[k].w) < 0) || pool[0]);
  }
  return out;
}
/* what a mystery door hides: [room, weight] */
export const MYSTERY = [['chest', 40], ['trap', 25], ['mob', 20], ['spring', 15]];

/* need: 'pot' = at least one HP potion, 'gold' = at least {price} gold */
export const EVENTS = {
  hunter: { title: 'ฮันเตอร์บาดเจ็บ', text: 'ฮันเตอร์คนหนึ่งติดอยู่ใต้ซากหิน ร้องขอยารักษา',
    opts: [{ n: 'แบ่งยา HP ให้ 1 ขวด', d: 'อาจได้รางวัลตอบแทน… หรืออาจเป็นกับดัก', need: 'pot' }, { n: 'เดินผ่านไป', d: 'ไม่เสี่ยงอะไร' }] },
  merchant: { title: 'พ่อค้าเร่ในดันเจี้ยน', text: 'ชายชราแบกเป้ใบใหญ่ยิ้มให้ "ของดีมีน้อยนะ ราคาก็ตามนั้น"',
    opts: [{ n: 'ซื้อยา HP 2 ขวด', d: 'ราคา {price} ทอง', need: 'gold' }, { n: 'ซื้อยามานา 2 ขวด', d: 'ราคา {price} ทอง', need: 'gold' }, { n: 'เดินผ่านไป', d: 'ไม่ซื้ออะไร' }] },
  altar: { title: 'แท่นบูชาโลหิต', text: 'แท่นหินสีแดงคล้ำส่งเสียงกระซิบ ขอเลือดเพื่อแลกพลัง',
    opts: [{ n: 'สละ HP 25%', d: 'ATK +20% จนกว่าจะออกจากเกต' }, { n: 'สวดภาวนา', d: 'ครึ่งหนึ่งได้ฟื้นพลัง อีกครึ่งโดนคำสาป (ศัตรู ATK +15% ทั้งเกต)' }, { n: 'เดินผ่านไป', d: 'ไม่แตะต้อง' }] },
  cursed: { title: 'หีบต้องสาป', text: 'หีบทองคำพันด้วยโซ่ดำ มีบางอย่างเฝ้าอยู่ในเงามืด',
    opts: [{ n: 'เปิดหีบ', d: 'สมบัติก้อนใหญ่ แต่ผู้พิทักษ์ระดับยอดฝีมือจะตื่นขึ้น' }, { n: 'ไม่แตะ', d: 'ปลอดภัยไว้ก่อน' }] },
  shrine: { title: 'รูปปั้นเทพธิดา', text: 'รูปปั้นหินเปล่งแสงอ่อนๆ ใต้ฐานมีช่องสำหรับถวายของ',
    opts: [{ n: 'ถวายทอง', d: 'ราคา {price} ทอง ฟื้น HP และ MP เต็ม', need: 'gold' }, { n: 'เดินผ่านไป', d: 'ไม่ถวายอะไร' }] },
};
export const eventPrice = (id, lv) => ({ merchant: 2 * (24 + lv * 3), shrine: 30 + lv * 12 }[id] || 0);

/* hard mode for a cleared gate: foes this many levels higher, rewards multiplied */
export const HARD_LV = 8, HARD_REWARD = 1.5;

/* endgame tower (GATES entry with tower: 1): one fight per floor with foes from every gate, a boss every
   `every` floors, unlocked by clearing gate index `unlockGate` (S rank). A climb restarts at the last checkpoint
   (floor 1, 6, 11, …). Crystals are paid only for floors above your best, so re-climbing can't farm them. */
export const TOWER = { unlockGate: 5, every: 5, gemsPerFloor: 4, bossGems: 25, lv0: 36, perFloor: 2.5 };
/* foe level on floor f: a fresh S-rank hunter (lv 46) climbs ~7 floors, lv 55 ~9, lv 65 ~14 (scripts/sim, --only special) */
export const towerFloorLv = f => Math.round(TOWER.lv0 + f * TOWER.perFloor);
export const towerStart = best => Math.floor(best / TOWER.every) * TOWER.every + 1;

/* hunter rank exam (GATES entry with exam: 1): a duel with the guild examiner. Passing raises your official
   rank; a gate can be entered only up to one rank above it. EXAM_LV = level needed to sit the exam for a rank. */
export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
export const EXAM_LV = { D: 5, C: 12, B: 20, A: 30, S: 45 };
export const EXAM_REWARD = { pts: 5, gems: 100 };
/* the examiner: this many levels above EXAM_LV, with HP/ATK multipliers; `rank` scales both per exam so each one
   passes ~75–80% when taken at the level it opens (the gates' monster curve differs per rank). Tune with
   `node scripts/sim/sim.mjs --only special`. */
export const EXAM_FOE = { lv: 3, hp: 2.6, atk: 1, rank: { D: 1.27, C: 1.65, B: 1, A: 1.28, S: 1.16 } };
