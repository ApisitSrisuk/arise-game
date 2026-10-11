/* Town: summoned heroes who aren't adventuring can be given jobs. Work happens when the day ends.
   Buildings produce resources; resources and gold upgrade buildings and the town hall.
   Every hero eats 1 food a day; when food runs short, heroes are less willing to work.
   Whether a hero shows up depends on their personality; heroes who keep refusing can be dismantled
   into soul shards (needed for town-hall upgrades) and crystals. */
export const RES = [['food', 'อาหาร'], ['wood', 'ไม้'], ['stone', 'หิน'], ['iron', 'เหล็ก'], ['shards', 'เศษวิญญาณ']];
export const RES_NAME = Object.fromEntries(RES);

/* hall = town level needed before the building opens */
export const BUILDINGS = [
  { id: 'farm', n: 'ฟาร์มชานเมือง', role: 'support', hall: 1, d: 'ปลูกผักเลี้ยงชาวเมืองและฮีโร่', out: 'food', base: 6 },
  { id: 'lumber', n: 'โรงเลื่อย', role: 'dps', hall: 1, d: 'ตัดไม้จากป่าหลังเกตที่ปิดไปแล้ว', out: 'wood', base: 5 },
  { id: 'quarry', n: 'เหมืองหิน', role: 'tank', hall: 1, d: 'ขนหินจากซากดันเจี้ยน', out: 'stone', base: 3 },
  { id: 'market', n: 'ตลาดนัดฮันเตอร์', role: 'support', hall: 1, d: 'ขายของให้ชาวเมือง ได้ทองทุกวัน' },
  { id: 'mine', n: 'เหมืองแร่มานา', role: 'mage', hall: 2, d: 'ขุดแร่เหล็กที่อาบมานา', out: 'iron', base: 2 },
  { id: 'apoth', n: 'โรงปรุงยา', role: 'healer', hall: 2, d: 'ปรุงยาฟื้นพลังและยามานา' },
  { id: 'dojo', n: 'ลานฝึกยุทธ์', role: 'dps', hall: 3, d: 'ฮีโร่ซ้อมมือกับคุณ ได้ EXP' },
  { id: 'forge', n: 'โรงตีเหล็กอาคม', role: 'mage', hall: 3, d: 'ใช้เหล็ก 6 หน่วยต่อครั้ง มีโอกาสตีอุปกรณ์ชิ้นใหม่' },
  { id: 'altar', n: 'แท่นผลึกมานา', role: 'healer', hall: 4, d: 'กลั่นมานาในอากาศเป็นคริสตัลอัญเชิญ' },
];
export const BLD = Object.fromEntries(BUILDINGS.map(b => [b.id, b]));
export const MAX_HALL = 5, MAX_BLV = 5, FORGE_IRON = 6;
export const maxBlv = hall => Math.min(MAX_BLV, hall + 1);
export const slotsOf = lv => 1 + Math.ceil(lv / 2);
export const upCost = lv => ({ wood: 15 * lv, stone: 15 * lv, iron: 6 * (lv - 1), gold: 150 * lv });
export const hallCost = L => ({ wood: 60 * L, stone: 60 * L, iron: 25 * L, food: 40 * L, shards: 15 * L, gold: 800 * L });
/* each town-hall level above 1 adds these to the player */
export const HALL_FX = { stamflat: 5, gold: 3 };
/* chance each personality turns up for work */
export const WILL = { brave: .85, coward: .85, lazy: .5, reckless: .75, loyal: .95, greedy: .85, diligent: 1, cunning: .75, kind: .95, arrogant: .6, playful: .7, calm: .9 };
export const HUNGRY = .6;
export const STRIKES = 3;
export const ROLE_MATCH = 1.5;
export const shardsOf = (star, lim) => star * 8 * (1 + lim);
export const gemsOf = star => star * 10;
/* refusal lines per personality, shown in the day report */
export const EXCUSE = {
  lazy: 'นอนตื่นสาย ไม่ยอมลุกไปทำงาน', arrogant: 'บอกว่างานนี้ต่ำต้อยเกินไปสำหรับตัวเอง', reckless: 'หนีไปท้าต่อยกับฮันเตอร์เมืองอื่น',
  playful: 'แอบหนีไปเที่ยวงานวัด', cunning: 'จ้างเด็กแถวนั้นทำแทนแต่เด็กหนีไป', coward: 'กลัวหนูในโกดังจนไม่กล้าเข้าไป',
  brave: 'ออกไปช่วยชาวบ้านไล่มอนสเตอร์แทน', greedy: 'ขอขึ้นค่าแรงก่อนถึงจะทำ', calm: 'นั่งสมาธินานเกินไปจนเลยเวลางาน',
  loyal: 'เฝ้าหน้าบ้านคุณทั้งวันเพราะเป็นห่วง', kind: 'ไปช่วยคุณยายข้างบ้านขนของทั้งวัน', diligent: 'ป่วยเพราะทำงานหนักเกินไป',
};
export const freshTown = () => ({ hall: 1, res: { food: 50, wood: 20, stone: 20, iron: 0, shards: 0 }, b: Object.fromEntries(BUILDINGS.map(b => [b.id, { lv: 1, w: [] }])) });
