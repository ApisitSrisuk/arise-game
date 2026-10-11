/* Wearable equipment: what the player wears is what the sprite shows, whatever the class.
   The world is modern-day (hunters, gates, a hunter association), so everyday clothes sit next to
   armour and weapons forged from dungeon materials.
   Four slots. Each item: st (flat atk/def/hp), fx (same keys as passives), lv to buy, p price,
   look {gear, outfit, pal} merged into the player sprite (palette keys are per slot, see art/figure.js). */
export const SLOTS = [['weapon', 'อาวุธ'], ['head', 'ศีรษะ'], ['body', 'ชุด'], ['back', 'แผ่นหลัง']];
export const SLOT_NAME = Object.fromEntries(SLOTS);

const I = (id, slot, n, lv, p, st, fx, look, d = '') => ({ id, slot, n, lv, p, st, fx, look, d });
export const ITEMS = [
  /* weapons: modern */
  I('w_bat', 'weapon', 'ไม้เบสบอลอะลูมิเนียม', 1, 0, { atk: 4 }, {}, { gear: ['bat'], pal: { w: '#c9d2dc', k: '#2a2a33', y: '#b02a3a' } }),
  I('w_katana', 'weapon', 'คาตานะเหล็กกล้า', 6, 360, { atk: 22 }, { crit: 4 }, { gear: ['katana'], pal: { w: '#eef2f7', k: '#1a1a22', y: '#d4af37' } }),
  I('w_gun', 'weapon', 'ปืนพกกระสุนมานา', 9, 480, { atk: 24 }, { firststrike: 1 }, { gear: ['gun'], pal: { w: '#3a3f4a', k: '#1a1a22', g: '#7fe7ff' } }),
  I('w_fist', 'weapon', 'สนับมือเหล็ก', 5, 340, { atk: 18 }, { extrahit: 20 }, { gear: ['gauntlets'], pal: { gl: '#8a94a2' } }),
  I('w_hammer', 'weapon', 'ค้อนปอนด์', 7, 420, { atk: 26 }, { stunchance: 6 }, { gear: ['hammer'], pal: { w: '#8a94a2', k: '#5c3d22', y: '#c9a46a' } }),
  I('w_flask', 'weapon', 'ขวดยาอาถรรพ์', 8, 380, { atk: 14 }, { burnamp: 25, potion: 15 }, { gear: ['flask'], pal: { fl: '#7dff8a' } }),
  I('w_cards', 'weapon', 'ไพ่นักพนัน', 9, 450, { atk: 20 }, { double: 10 }, { gear: ['cards'], pal: { w: '#f4f0e6' } }),
  I('w_rifle', 'weapon', 'ไรเฟิลซุ่มยิงมานา', 16, 1100, { atk: 48 }, { crit: 8, critdmg: 15 }, { gear: ['rifle'], pal: { w: '#3a3f4a', k: '#2a2a33', g: '#7fe7ff' } }),
  I('w_axe', 'weapon', 'ขวานดับเพลิง', 12, 650, { atk: 36 }, { critdmg: 15 }, { gear: ['axe'], pal: { w: '#d6dde6', k: '#b02a3a', y: '#ffd34d' } }),
  /* weapons: dungeon-forged */
  I('w_wood', 'weapon', 'ดาบไม้ฝึกหัด', 1, 40, { atk: 3 }, {}, { gear: ['sword'], pal: { w: '#c4a070', k: '#5c3d22', y: '#8a6a3a' } }),
  I('w_knife', 'weapon', 'มีดสั้นเหล็กคู่', 1, 80, { atk: 8 }, { crit: 2 }, { gear: ['daggers'], pal: { w: '#d6dde6', y: '#8a6a3a' } }),
  I('w_staff0', 'weapon', 'ไม้เท้าฝึกหัด', 1, 80, { atk: 6 }, { skillamp: 5 }, { gear: ['staff'], pal: { k: '#7a5230', y: '#b08a5a', g: '#7fe7ff' } }),
  I('w_bow0', 'weapon', 'ธนูไม้ฝึกหัด', 1, 90, { atk: 7 }, { crit: 3 }, { gear: ['bow'], pal: { k: '#8a5a32', y: '#c9a46a' } }),
  I('w_rod0', 'weapon', 'คทานักบวชฝึกหัด', 1, 90, { atk: 5 }, { healamp: 10 }, { gear: ['crossstaff'], pal: { k: '#c9a46a', y: '#e9e2c8', g: '#ffe27a' } }),
  I('w_sword', 'weapon', 'ดาบเหล็กกล้า', 5, 300, { atk: 20 }, {}, { gear: ['sword'], pal: { w: '#e2e8f0', k: '#4a3020', y: '#c9a46a' } }),
  I('w_knight', 'weapon', 'ดาบและโล่อัศวิน', 8, 420, { atk: 18, def: 8 }, {}, { gear: ['sword', 'shield'], pal: { w: '#e2e8f0', k: '#3a2a1a', y: '#ffd34d', sm: '#c9d2dc', sa: '#3a6fc4', sy: '#ffd34d' } }),
  I('w_spear', 'weapon', 'ทวนทหารม้า', 10, 500, { atk: 28 }, { crit: 4 }, { gear: ['spear'], pal: { w: '#d6dde6', k: '#6b4a2b', y: '#c9a46a' } }),
  I('w_firestaff', 'weapon', 'คทาอัญมณีเพลิง', 10, 520, { atk: 22 }, { skillamp: 15 }, { gear: ['staff'], pal: { g: '#ff6a2a', y: '#ffd34d', k: '#4a2a1a' } }),
  I('w_longbow', 'weapon', 'ธนูยาวเงาจันทร์', 12, 560, { atk: 30 }, { crit: 6 }, { gear: ['bow'], pal: { k: '#2b3f5a', y: '#bfe9ff' } }),
  I('w_fang', 'weapon', 'มีดเขี้ยวพิษคู่', 15, 900, { atk: 45 }, { poisonhit: 12 }, { gear: ['daggers'], pal: { w: '#9aff7a', y: '#2e4a14' } }),
  I('w_great', 'weapon', 'ดาบใหญ่นักล่าอสูร', 18, 1200, { atk: 58 }, { bossdmg: 10 }, { gear: ['greatsword'], pal: { x: '#8a95a6', w: '#e2e8f0', k: '#3a2a1a', g: '#ffb020' } }),
  I('w_holy', 'weapon', 'คทาแสงศักดิ์สิทธิ์', 20, 1400, { atk: 50 }, { healamp: 25, skillamp: 10 }, { gear: ['crossstaff'], pal: { k: '#ffe9a8', y: '#ffd34d', g: '#7fe7ff' } }),
  I('w_scythe', 'weapon', 'เคียวยมทูต', 24, 1800, { atk: 70 }, { ls: 5 }, { gear: ['scythe'], pal: { w: '#b8c0d8', k: '#2a2a2a' } }),
  I('w_dragon', 'weapon', 'ดาบมังกรดำ', 28, 2500, { atk: 90 }, { critdmg: 20 }, { gear: ['greatsword'], pal: { x: '#2a1a22', w: '#ff5a3d', k: '#1a0e10', g: '#ff3040' } }),
  I('w_star', 'weapon', 'คทาดวงดาว', 30, 2800, { atk: 85 }, { skillamp: 25, mpr: 2 }, { gear: ['staff'], pal: { g: '#a37bff', y: '#e2ccff', k: '#2a2050' } }),
  I('w_king', 'weapon', 'กริชราชันย์คู่', 40, 6000, { atk: 160 }, { crit: 8 }, { gear: ['daggers'], pal: { w: '#c9a6ff', y: '#ffd34d' } }),
  /* head: modern */
  I('h_cap', 'head', 'หมวกแก๊ป', 1, 30, {}, { crit: 1 }, { gear: ['cap'], pal: { o: '#2a3a5a', ha: '#e9eef5' } }),
  I('h_glasses', 'head', 'แว่นกันแดดสายตาเหยี่ยว', 4, 180, {}, { crit: 3 }, { gear: ['glasses'], pal: { ha: '#1a1a22', hg: '#3a6fc4' } }),
  I('h_headset', 'head', 'หูฟังสื่อสารสมาคม', 7, 260, {}, { xp: 6 }, { gear: ['headset'], pal: { hm: '#2a2a33', ha: '#58c4ff' } }),
  I('h_visor', 'head', 'หมวกนิรภัยยุทธวิธี', 12, 600, { def: 7, hp: 50 }, {}, { gear: ['visor'], pal: { hm: '#3a4a3a', ha: '#58c4ff' } }),
  I('h_beret', 'head', 'หมวกเบเร่ต์', 4, 160, {}, { skillamp: 4 }, { gear: ['beret'], pal: { o: '#5a2a7a', ha: '#f4f0e6' } }),
  I('h_tophat', 'head', 'หมวกทรงสูงนักมายากล', 10, 500, {}, { gold: 10, crit: 2 }, { gear: ['tophat'], pal: { o: '#1a1a1a', ha: '#8b1e2e' } }),
  /* head: dungeon-forged */
  I('h_band', 'head', 'ผ้าคาดหัวนักสู้', 1, 40, { def: 1 }, { atkp: 3 }, { gear: ['bandana'], pal: { o: '#b02a3a' } }),
  I('h_hood', 'head', 'ฮูดนักเดินทาง', 1, 90, { def: 1 }, { dodge: 2 }, { gear: ['hood'], pal: { o: '#6b5a3a' } }),
  I('h_hat', 'head', 'หมวกจอมเวท', 3, 150, { def: 1 }, { mpmax: 10 }, { gear: ['hat'], pal: { o: '#3b2a7a', ha: '#ffcc55' } }),
  I('h_mask', 'head', 'ผ้าปิดหน้านักฆ่า', 6, 300, {}, { crit: 4 }, { gear: ['mask'], pal: { ha: '#8b1e2e' } }),
  I('h_circlet', 'head', 'มงกุฎเงินประดับพลอย', 8, 400, {}, { skillamp: 6 }, { gear: ['circlet'], pal: { ha: '#e2e8f0', hg: '#7fe7ff' } }),
  I('h_helm', 'head', 'หมวกเหล็กอัศวิน', 8, 350, { def: 6, hp: 40 }, {}, { gear: ['helm'], pal: { hm: '#c9d2dc', ha: '#d22c3c', hy: '#ffd34d' } }),
  I('h_night', 'head', 'ฮูดเงาราตรี', 15, 900, {}, { crit: 5, dodge: 2 }, { gear: ['hood', 'mask'], pal: { o: '#1d1f2b', ha: '#8b1e2e' } }),
  I('h_horns', 'head', 'เขาปีศาจ', 22, 1500, {}, { atkp: 6 }, { gear: ['horns'], pal: { n: '#3a3238' } }),
  I('h_halo', 'head', 'วงแหวนศักดิ์สิทธิ์', 25, 2000, {}, { healamp: 15, regen: 1 }, { gear: ['halo'], pal: { hy: '#ffe27a' } }),
  I('h_crown', 'head', 'มงกุฎราชันย์', 30, 4000, { def: 4 }, { gold: 15, xp: 10 }, { gear: ['crownh'], pal: { hk: '#ffd34d' } }),
  /* body: modern */
  I('b_tee', 'body', 'เสื้อยืดกับยีนส์', 1, 0, {}, {}, { outfit: 'casual', pal: { c: '#e9eef5', d: '#9aa4b0', a: '#3a6fc4', p: '#2b4a7a', b: '#e9eef5' } }),
  I('b_hoodie', 'body', 'ฮู้ดดี้นักล่า', 1, 90, { def: 3, hp: 30 }, { dodge: 2 }, { outfit: 'hoodie', pal: { c: '#2a2f3a', d: '#1a1d24', a: '#58c4ff', p: '#1e232c', b: '#e9eef5' } }),
  I('b_uniform', 'body', 'ชุดนักเรียนสถาบันฮันเตอร์', 3, 160, { def: 4, hp: 40 }, { xp: 8 }, { outfit: 'uniform', pal: { c: '#1e2a4a', d: '#e9eef5', a: '#b02a3a', p: '#1e2a4a', b: '#1a1a22' } }),
  I('b_jacket', 'body', 'แจ็กเก็ตหนังไบเกอร์', 6, 380, { def: 8, hp: 80 }, { crit: 3 }, { outfit: 'jacket', pal: { c: '#2a2226', d: '#7a8496', a: '#c9d2dc', p: '#2b3a5a', b: '#1a1a22' } }),
  I('b_suit', 'body', 'สูทสมาคมฮันเตอร์', 10, 700, { def: 10, hp: 100 }, { gold: 12 }, { outfit: 'suit', pal: { c: '#1a1a22', d: '#e9eef5', a: '#b02a3a', p: '#1a1a22', b: '#0e0e12' } }),
  I('b_tactical', 'body', 'เสื้อเกราะยุทธวิธี', 14, 1000, { def: 18, hp: 180 }, {}, { outfit: 'tactical', pal: { c: '#3a4a3a', d: '#2a3328', a: '#c9a46a', p: '#2a3328', b: '#1a1a14' } }),
  /* body: dungeon-forged armour */
  I('b_cloth', 'body', 'ชุดผ้าลินินนักผจญภัย', 1, 40, {}, {}, { outfit: 'tunic', pal: { c: '#7a8496', d: '#4b525e', a: '#c9d2dc', p: '#3b3b4f', b: '#4a2f1f' } }),
  I('b_leather', 'body', 'เกราะหนัง', 1, 70, { def: 4, hp: 40 }, {}, { outfit: 'leather', pal: { c: '#8a5a32', d: '#5c3d22', a: '#c9a46a', p: '#3a3a44', b: '#3e2a17' } }),
  I('b_robe', 'body', 'เสื้อคลุมนักเวทฝึกหัด', 1, 120, { def: 3, hp: 30 }, { mpmax: 10 }, { outfit: 'robe', pal: { c: '#4b5aa8', d: '#2c3a7a', a: '#e9eef5', b: '#2a2a3a' } }),
  I('b_ranger', 'body', 'ชุดพรานป่า', 4, 200, { def: 6, hp: 60 }, { dodge: 2 }, { outfit: 'leather', pal: { c: '#3f7a3a', d: '#2b5a2a', a: '#d8c89a', p: '#4a3a2a', b: '#3e2a17' } }),
  I('b_chain', 'body', 'เกราะโซ่', 5, 260, { def: 10, hp: 100 }, {}, { outfit: 'armor', pal: { am: '#9aa4b0', a: '#5b6b82', d: '#3e4a5c', p: '#3b3b4f' } }),
  I('b_priest', 'body', 'ชุดนักบวช', 8, 400, { def: 8, hp: 80 }, { healamp: 10 }, { outfit: 'robe', pal: { c: '#eef2f7', d: '#b9c6d6', a: '#ffd166', b: '#8a7a5a' } }),
  I('b_coat', 'body', 'โค้ทนักผจญภัย', 10, 600, { def: 12, hp: 120 }, { crit: 3 }, { outfit: 'coat', pal: { c: '#7a2a2a', d: '#e9e2c8', a: '#ffd166', p: '#2a2a33', b: '#2a1a12' } }),
  I('b_knight', 'body', 'เกราะอัศวิน', 12, 800, { def: 22, hp: 220 }, {}, { outfit: 'armor', pal: { am: '#e2e8f0', a: '#3a6fc4', d: '#24467e', p: '#2c3442' } }),
  I('b_night', 'body', 'ชุดนักฆ่าราตรี', 14, 900, { def: 14, hp: 120 }, { crit: 6 }, { outfit: 'coat', pal: { c: '#20222e', d: '#8b1e2e', a: '#c0303f', p: '#14151e', b: '#111111' } }),
  I('b_archmage', 'body', 'เสื้อคลุมจอมปราชญ์', 20, 1500, { def: 18, hp: 180 }, { skillamp: 12 }, { outfit: 'robe', pal: { c: '#2c1f66', d: '#1e1446', a: '#ffcc55', b: '#1a1028' } }),
  I('b_dragon', 'body', 'เกราะเกล็ดมังกร', 25, 2200, { def: 40, hp: 450 }, {}, { outfit: 'armor', pal: { am: '#b8402a', a: '#ffb020', d: '#5c1408', p: '#3a1a0d' } }),
  I('b_royal', 'body', 'เสื้อคลุมราชันย์', 35, 5500, { def: 70, hp: 800 }, {}, { outfit: 'coat', pal: { c: '#3b1a5a', d: '#ffd34d', a: '#ffd34d', p: '#1a1028', b: '#120a1a' } }),
  /* back */
  I('k_bag', 'back', 'เป้สะพายหลัง', 1, 50, {}, { stamflat: 10 }, { gear: ['backpack'], pal: { qk: '#3a4a5a', qa: '#c9a46a' } }),
  I('k_cape', 'back', 'ผ้าคลุมเดินทาง', 1, 60, {}, { dodge: 1 }, { gear: ['cape'], pal: { r: '#8a5a32', ry: '#c9a46a' } }),
  I('k_quiver', 'back', 'กระบอกลูกธนู', 1, 80, {}, { crit: 2 }, { gear: ['quiver'], pal: { qk: '#6b4a2b', qa: '#e8e2c8' } }),
  I('k_red', 'back', 'ผ้าคลุมแดงนักรบ', 6, 250, {}, { atkp: 3 }, { gear: ['cape'], pal: { r: '#a8202a', ry: '#ffd34d' } }),
  I('k_scarf', 'back', 'ผ้าพันคอสายลม', 8, 300, {}, { dodge: 4 }, { gear: ['scarf'], pal: { sc: '#3fc9a8' } }),
  I('k_knight', 'back', 'ผ้าคลุมอัศวิน', 12, 500, { def: 4, hp: 50 }, {}, { gear: ['cape'], pal: { r: '#24467e', ry: '#ffd34d' } }),
  I('k_shadow', 'back', 'ผ้าคลุมเงา', 18, 1200, {}, { dodge: 5, crit: 3 }, { gear: ['cape'], pal: { r: '#1a1030', ry: '#a37bff' } }),
  I('k_dwings', 'back', 'ปีกอสูรราตรี', 26, 3800, {}, { crit: 5, ls: 3 }, { gear: ['wings'], pal: { wg: '#2a1a3a' } }),
  I('k_wings', 'back', 'ปีกเทวาจำแลง', 30, 4500, {}, { dodge: 6, hpmax: 6 }, { gear: ['wings'], pal: { wg: '#f4f1ff' } }),
  I('k_royal', 'back', 'ผ้าคลุมราชันย์', 30, 3500, {}, { hpmax: 10, atkp: 5 }, { gear: ['cape'], pal: { r: '#7a0f1e', ry: '#ffd34d' } }),
];
export const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const SELL_RATE = .4;
export const sellPrice = it => Math.floor(it.p * SELL_RATE);
export const STARTER = { weapon: 'w_bat', head: null, body: 'b_tee', back: null };
/* old saves stored weapon/armour tiers as numbers */
export const LEGACY_WPN = ['w_bat', 'w_knife', 'w_sword', 'w_fang', 'w_dragon', 'w_king'];
export const LEGACY_ARM = ['b_tee', 'b_leather', 'b_chain', 'b_knight', 'b_dragon', 'b_royal'];
/* the system gifts a first weapon that fits the rolled class */
export const STARTER_BY_GEAR = { sword: 'w_wood', greatsword: 'w_wood', daggers: 'w_knife', bow: 'w_bow0', staff: 'w_staff0', crossstaff: 'w_rod0' };
