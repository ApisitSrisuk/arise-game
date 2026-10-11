/* Gacha heroes (inspired by "summon a party of starred heroes" gacha stories; every hero here is original).
   Heroes fight beside the player each turn. Pulling a duplicate raises its limit break (max +5). */
export const STAR = {
  1: { m: .6, rate: 40, col: '#9fb4cf', frame: 'r1' },
  2: { m: .8, rate: 32, col: '#4fdc9b', frame: 'r2' },
  3: { m: 1, rate: 19, col: '#58a8ff', frame: 'r3' },
  4: { m: 1.35, rate: 7, col: '#c08cff', frame: 'r4' },
  5: { m: 1.8, rate: 2, col: '#ffc85a', frame: 'r5' },
};
export const ROLE = {
  dps: { n: 'จู่โจม', d: 'โจมตีศัตรูทุกเทิร์น' },
  mage: { n: 'เวทมนตร์', d: 'โจมตีทะลุเกราะ มีโอกาสเผาศัตรู' },
  tank: { n: 'แนวหน้า', d: 'ลดดาเมจที่คุณได้รับ และโจมตีเบาๆ' },
  healer: { n: 'ฟื้นฟู', d: 'ฟื้น HP ให้คุณทุกเทิร์นเมื่อบาดเจ็บ' },
  support: { n: 'สนับสนุน', d: 'เพิ่ม ATK ให้คุณ และโจมตีเบาๆ' },
};
export const PULL_COST = 100, PULL10_COST = 900, PITY = 60, MAX_LIMIT = 5;

const L = (hairStyle, hair, skin, eye, outfit, gear, pal) => ({ hairStyle, hair, skin, eye, outfit, gear, pal });
export const HEROES = [
  { id: 'rowan', n: 'Rowan', t: 'ฮันเตอร์ฝึกหัด', star: 1, role: 'dps', q: 'วันนี้ต้องไม่ล้มให้ได้!', look: L('short', '#5a3a22', '#f1c39a', '#4a2e1a', 'tunic', ['sword'], { c: '#7a8496', d: '#4b525e', a: '#c9d2dc' }) },
  { id: 'bram', n: 'Bram', t: 'ยามรักษาความปลอดภัย', star: 1, role: 'tank', q: 'ยืนข้างหลังผมไว้นะ', look: L('spiky', '#2a2a30', '#d9a074', '#151515', 'tunic', ['shield'], { c: '#8a6a3a', d: '#5c4426', a: '#c9a46a', w: '#9aa4b0' }) },
  { id: 'pippa', n: 'Pippa', t: 'นักเรียนสถาบันเวท', star: 1, role: 'mage', q: 'ลูกไฟ…ออกมาสิ!', look: L('pony', '#c9a46a', '#f6d2b1', '#2b6ed6', 'robe', ['staff'], { c: '#6a8ac4', d: '#4a6aa4', a: '#e9eef5', g: '#ff8a3d' }) },
  { id: 'wren', n: 'Wren', t: 'นักกีฬายิงธนู', star: 1, role: 'dps', q: 'ยิงไม่พลาดหรอก… มั้ง', look: L('bangs', '#5a3a22', '#f1c39a', '#2f9e6a', 'leather', ['bow', 'quiver'], { c: '#6a8a3a', d: '#4a6a2a', a: '#d8c89a' }) },
  { id: 'kael', n: 'Kael', t: 'ฮันเตอร์รับจ้างอิสระ', star: 2, role: 'dps', q: 'จ่ายครบ ก็ฟันครบ', look: L('spiky', '#b02a3a', '#f1c39a', '#c0303f', 'tunic', ['sword'], { c: '#7a2a2a', d: '#4a1a1a', a: '#d6b47a' }) },
  { id: 'sera', n: 'Sera', t: 'นักศึกษาพยาบาล', star: 2, role: 'healer', q: 'อย่าฝืนนะคะ เดี๋ยวฉันรักษาให้', look: L('long', '#d6d6e2', '#f6d2b1', '#2b6ed6', 'robe', ['crossstaff'], { c: '#eef2f7', d: '#b9c6d6', a: '#7fb2ff', k: '#d4af37' }) },
  { id: 'gareth', n: 'Gareth', t: 'ตำรวจปราบจลาจล', star: 2, role: 'tank', q: 'ไม่มีใครผ่านไปได้', look: L('short', '#1b1b22', '#a8714a', '#151515', 'armor', ['helm', 'shield'], { w: '#9aa4b0', a: '#3a6fc4', d: '#3e4a5c' }) },
  { id: 'lyra', n: 'Lyra', t: 'นักร้องเปิดหมวก', star: 2, role: 'support', q: 'ขอบทเพลงนี้ให้ความกล้า', look: L('bangs', '#e86fa8', '#f6d2b1', '#8a5ad6', 'coat', ['staff'], { c: '#5a3a8a', d: '#e9eef5', a: '#ffd166', g: '#ff8ad8' }) },
  { id: 'solen', n: 'Solen', t: 'อัศวินแห่งสมาคมตะวัน', star: 3, role: 'tank', q: 'แสงตะวันจะคุ้มครองเรา', look: L('short', '#ffcf5a', '#f1c39a', '#2b6ed6', 'armor', ['helm', 'shield', 'cape'], { w: '#eef2f7', a: '#ffb020', y: '#ffd34d', r: '#c43a2a', d: '#8a95a6' }) },
  { id: 'luna', n: 'Luna', t: 'สไนเปอร์เงาจันทร์', star: 3, role: 'dps', q: 'เป้าหมายอยู่ใต้แสงจันทร์แล้ว', look: L('long', '#3b5bd6', '#f6d2b1', '#7fe7ff', 'leather', ['hood', 'bow', 'quiver'], { o: '#1d3b4f', c: '#2b5f7a', a: '#bfe9ff', k: '#3a4a5a' }) },
  { id: 'zephyr', n: 'Zephyr', t: 'ศาสตราจารย์เวทวายุ', star: 3, role: 'mage', q: 'ลมจะพาเวทของผมไปถึง', look: L('spiky', '#d6d6e2', '#f1c39a', '#2f9e6a', 'robe', ['hat', 'staff'], { o: '#2a6a5a', c: '#3a8a6a', a: '#e9f5ee', g: '#7dffb0' }) },
  { id: 'stella', n: 'Stella', t: 'หมอดูแห่งดวงดาว', star: 3, role: 'healer', q: 'ดวงดาวบอกว่าคุณจะไม่เป็นไร', look: L('pony', '#7b3fbf', '#f6d2b1', '#ffd34d', 'robe', ['crossstaff', 'halo'], { c: '#2c2a5a', d: '#1c1a3a', a: '#ffe27a', k: '#d4af37', g: '#ffe27a' }) },
  { id: 'raiden', n: 'Raiden', t: 'นักซิ่งดาบคู่', star: 4, role: 'dps', q: 'ช้าไปก้าวเดียวก็ตายแล้ว', look: L('spiky', '#1b1b22', '#f1c39a', '#c0303f', 'coat', ['daggers', 'scarf'], { c: '#20222e', d: '#8b1e2e', a: '#c0303f' }) },
  { id: 'opal', n: 'Opal', t: 'ไอดอลแม่มดผลึก', star: 4, role: 'mage', q: 'ผลึกทุกก้อนคือระเบิด', look: L('long', '#e86fa8', '#f6d2b1', '#8a5ad6', 'robe', ['hat', 'staff', 'runes'], { o: '#4a2a6a', c: '#6a3a8a', a: '#ff9ad8', g: '#ff8ad8' }) },
  { id: 'aria', n: 'Aria', t: 'ผู้บัญชาการหน่วยวายุ', star: 4, role: 'support', q: 'ทุกคน ตามลมฉันมา!', look: L('pony', '#3b5bd6', '#d9a074', '#7fe7ff', 'tunic', ['sword', 'cape', 'scarf'], { c: '#2b6e99', d: '#1e4f70', a: '#e9eef5', r: '#bfe9ff' }) },
  { id: 'leon', n: 'Leon', t: 'ฮันเตอร์แรงก์ S ราชสีห์', star: 5, role: 'tank', q: 'ตราบที่ข้ายืนอยู่ เจ้าจะไม่ล้ม', look: L('spiky', '#ffb020', '#d9a074', '#ffcc33', 'armor', ['greatsword', 'cape', 'crownh'], { w: '#ffe9a8', a: '#ff8a3d', x: '#d4af37', y: '#ffd34d', r: '#8a1a1a', d: '#a07a3a' }) },
  { id: 'aeon', n: 'Aeon', t: 'นักวิทยาศาสตร์ข้ามเวลา', star: 5, role: 'mage', q: 'ข้าเห็นตอนจบของการต่อสู้นี้แล้ว', look: L('long', '#f4f1ff', '#f6d2b1', '#7fe7ff', 'robe', ['staff', 'halo', 'cape', 'runes'], { c: '#f4f1ff', d: '#c9c3e8', a: '#ffd34d', g: '#7fe7ff', r: '#3b4a8c', y: '#ffd34d' }) },
  { id: 'vesper', n: 'Vesper', t: 'นักดาบไร้เงา', star: 5, role: 'dps', q: 'ดาบของฉันไม่มีเงา เพราะเร็วกว่าแสง', look: L('bangs', '#1b1b22', '#f6d2b1', '#a37bff', 'coat', ['sword', 'cape', 'hood'], { o: '#14141e', c: '#1c1c28', d: '#a37bff', a: '#a37bff', r: '#2a1a40', w: '#e2ccff' }) },
];
export const HERO = Object.fromEntries(HEROES.map(h => [h.id, h]));
/* ★4–★5 heroes carry a signature bonus on top of their role */
export const SIGNATURE = {
  raiden: { n: 'ดาบคู่', d: 'โจมตี 2 ครั้งต่อเทิร์น' },
  opal: { n: 'ผลึกระเบิด', d: 'โอกาสเผาศัตรู 50%' },
  aria: { n: 'ลมนำทัพ', d: 'บัฟ ATK ให้คุณสองเท่า' },
  leon: { n: 'ราชสีห์คำราม', d: 'ลดดาเมจที่คุณได้รับสองเท่า และโจมตีเต็มแรง' },
  aeon: { n: 'หยุดเวลา', d: 'โอกาส 15% ทำให้ศัตรูขยับไม่ได้' },
  vesper: { n: 'ไร้เงา', d: 'คริติคอล 35% ดาเมจ ×2.2' },
};

/* Personalities: every summoned hero rolls one at random. It changes how that hero behaves in battle. */
export const PERSONA = {
  brave: { n: 'กล้าหาญ', d: 'ดาเมจ +20%', q: 'ข้างหน้ามีอะไรก็ฟันให้หมด!' },
  coward: { n: 'ขี้ขลาด', d: 'โอกาส 25% แอบหลบไม่ทำอะไร แต่ถ้าคุณ HP ต่ำกว่า 30% จะฮึดสู้ ดาเมจ ×2', q: 'อะ… อย่าให้ฉันยืนหน้าสุดนะ' },
  lazy: { n: 'ขี้เกียจ', d: 'โอกาส 25% นอนอู้ แต่ตอนลงมือแรงขึ้น 40%', q: 'ขอนอนอีกห้านาที…' },
  reckless: { n: 'บ้าระห่ำ', d: 'ดาเมจ +40% แต่โอกาส 15% ตีพลาด', q: 'ไม่ต้องคิด ลุยเลย!' },
  loyal: { n: 'ภักดี', d: 'เมื่อคุณ HP ต่ำกว่า 40% ดาเมจและการฮีล +50%', q: 'ข้าจะไม่ทิ้งท่านไปไหน' },
  greedy: { n: 'โลภ', d: 'ทองจากการต่อสู้ +10% แต่ดาเมจ -10%', q: 'ส่วนแบ่งของฉันล่ะ?' },
  diligent: { n: 'ขยัน', d: 'โอกาส 15% ลงมือ 2 ครั้ง', q: 'งานยังไม่เสร็จ ยังพักไม่ได้' },
  cunning: { n: 'เจ้าเล่ห์', d: 'โอกาส 20% ลด ATK ศัตรู 10% (ครั้งเดียวต่อศัตรู)', q: 'ชนะได้ไม่ต้องเหนื่อยหรอก' },
  kind: { n: 'ใจดี', d: 'โอกาส 20% ฟื้น HP ให้คุณ 5% แทนการโจมตี', q: 'เจ็บตรงไหน บอกได้นะ' },
  arrogant: { n: 'เย่อหยิ่ง', d: 'ดาเมจใส่บอสและยอดฝีมือ +35% แต่ใส่ศัตรูทั่วไป -15%', q: 'พวกปลาซิวไม่คู่ควรกับดาบข้า' },
  playful: { n: 'ขี้เล่น', d: 'ดาเมจสุ่มตั้งแต่ ×0.5 ถึง ×1.9', q: 'มาเล่นกันเถอะ!' },
  calm: { n: 'สุขุม', d: 'โอกาสคริติคอล 20% (×1.8)', q: 'ใจเย็นๆ จุดอ่อนอยู่ตรงนั้น' },
};
export const PERSONA_IDS = Object.keys(PERSONA);

/* Hero growth: heroes level up from battles (in the party) and town work, up to a cap set by star and limit break.
   At HERO_SKILL_LV every hero unlocks a role skill that fires every HERO_SKILL_EVERY turns. */
export const HERO_SKILL_LV = 10, HERO_SKILL_EVERY = 4;
export const heroCap = (star, lim) => 15 + star * 5 + lim * 2;
export const heroNeed = lv => 30 + lv * 20;
export const HERO_SKILL = {
  dps: { n: 'ท่าไม้ตาย', d: 'ทุก 4 เทิร์น ตีแรง ×2.5' },
  mage: { n: 'เวทระเบิด', d: 'ทุก 4 เทิร์น ตีทะลุเกราะ ×2 และเผาศัตรู' },
  tank: { n: 'ยืนบังให้', d: 'ทุก 4 เทิร์น คุณได้ป้องกัน 1 เทิร์น' },
  healer: { n: 'ฟื้นฟูหมู่', d: 'ทุก 4 เทิร์น ฟื้น HP ให้คุณ 15%' },
  support: { n: 'เพลงปลุกใจ', d: 'ทุก 4 เทิร์น ATK ของคุณ +20% นาน 2 เทิร์น' },
};
/* rate-up banner: one ★4/★5 hero is featured each in-game week; a pull of that star gets them half the time */
export const RATEUP = .5;
const FEATURED = HEROES.filter(h => h.star >= 4);
export const bannerHero = day => FEATURED[Math.floor((day - 1) / 7) % FEATURED.length];
