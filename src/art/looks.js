/* Gacha hero looks for the modern setting. The briefs are the hero titles in heroes.js; sprites.js prefers these over h.look.
   Hair, skin and eyes stay as each hero was first drawn, so they remain recognisable. ★3 and up may wear dungeon armour.
   Shape matches figure specs: hairStyle, hair, skin, eye, outfit, gear, pal (+ aff, the colour of runes and other aura pieces). */
const L = (hairStyle, hair, skin, eye, outfit, gear, pal, aff) => ({ hairStyle, hair, skin, eye, outfit, gear, pal, ...(aff ? { aff } : {}) });

export const HERO_LOOK = {
  /* ★1 */
  rowan: L('short', '#5a3a22', '#f1c39a', '#4a2e1a', 'casual', ['sword', 'backpack'], { c: '#e9eef5', a: '#3a6fc4', p: '#3a4a6a', b: '#e9eef5', w: '#c4a070', k: '#5c3d22', y: '#8a6a3a', qk: '#3a4a5a', qa: '#1e2630' }),
  bram: L('spiky', '#2a2a30', '#d9a074', '#151515', 'uniform', ['cap', 'shield'], { c: '#2a3550', d: '#c9d2dc', a: '#1a1a1a', p: '#2a3550', b: '#1a1a1a', o: '#2a3550', ha: '#ffd34d', sm: '#9aa4b0', sa: '#2a3550', sy: '#5a6a7a' }),
  pippa: L('pony', '#c9a46a', '#f6d2b1', '#2b6ed6', 'uniform', ['staff'], { c: '#6a8ac4', d: '#e9eef5', a: '#c0303f', p: '#3a4a6a', b: '#2a2a33', k: '#7a5230', y: '#c9a46a', g: '#ff8a3d' }),
  wren: L('bangs', '#5a3a22', '#f1c39a', '#2f9e6a', 'casual', ['cap', 'bow', 'quiver'], { c: '#2f9e6a', a: '#e9eef5', p: '#2a2a33', b: '#e9eef5', o: '#2a2a33', ha: '#2f9e6a', k: '#7a8a9a', y: '#e9eef5', qk: '#2a2a33', qa: '#e9eef5' }),
  /* ★2 */
  kael: L('spiky', '#b02a3a', '#f1c39a', '#c0303f', 'jacket', ['katana'], { c: '#2a2a33', d: '#7a2a2a', a: '#d6b47a', p: '#2a2a33', b: '#1a1a1a', w: '#e2e8f0', k: '#2a2a2a', y: '#d6b47a' }),
  sera: L('long', '#d6d6e2', '#f6d2b1', '#2b6ed6', 'coat', ['flask'], { c: '#eef2f7', d: '#7fb2ff', a: '#7fb2ff', p: '#e9eef5', b: '#e9eef5', fl: '#7fe7ff', y: '#7fb2ff' }),
  gareth: L('short', '#1b1b22', '#a8714a', '#151515', 'tactical', ['visor', 'shield'], { c: '#1e2630', d: '#2a3442', a: '#ffd34d', p: '#1e2630', b: '#111111', hm: '#2a3442', ha: '#7fe7ff', sm: '#bfe9ff', sa: '#2a3442', sy: '#5a6a7a' }),
  lyra: L('bangs', '#e86fa8', '#f6d2b1', '#8a5ad6', 'jacket', ['beret', 'scarf'], { c: '#5a3a8a', d: '#e9eef5', a: '#ffd166', p: '#2a2a3a', b: '#c0303f', o: '#c0303f', ha: '#ffd166', sc: '#ffd166' }),
  /* ★3 */
  solen: L('short', '#ffcf5a', '#f1c39a', '#2b6ed6', 'armor', ['helm', 'shield', 'cape'], { am: '#eef2f7', a: '#ffb020', d: '#8a95a6', p: '#5a6472', hm: '#eef2f7', ha: '#ffb020', hy: '#ffd34d', sm: '#eef2f7', sa: '#ffb020', sy: '#ffd34d', r: '#c43a2a', ry: '#ffd34d' }),
  luna: L('long', '#3b5bd6', '#f6d2b1', '#7fe7ff', 'coat', ['hood', 'rifle'], { c: '#1d3b4f', d: '#2b5f7a', a: '#bfe9ff', p: '#16263a', b: '#111a24', o: '#1d3b4f', w: '#3a4a5a', k: '#1e2630', g: '#bfe9ff' }),
  zephyr: L('spiky', '#d6d6e2', '#f1c39a', '#2f9e6a', 'suit', ['glasses', 'staff', 'scarf'], { c: '#3a6a5a', d: '#e9f5ee', a: '#2a4a3a', p: '#2a4a3a', b: '#2a1a12', ha: '#2a2a33', hg: '#bfe9ff', sc: '#e9f5ee', k: '#5a3a22', y: '#e9f5ee', g: '#7dffb0' }),
  stella: L('pony', '#7b3fbf', '#f6d2b1', '#ffd34d', 'robe', ['hood', 'crossstaff'], { c: '#2c2a5a', d: '#1c1a3a', a: '#ffe27a', o: '#3b2a6a', k: '#d4af37', y: '#ffe27a', g: '#ffe27a' }),
  /* ★4 */
  raiden: L('spiky', '#1b1b22', '#f1c39a', '#c0303f', 'jacket', ['daggers', 'glasses', 'scarf'], { c: '#20222e', d: '#e9eef5', a: '#c0303f', p: '#14151e', b: '#e9eef5', ha: '#c0303f', hg: '#ffe14d', sc: '#c0303f', w: '#e2e8f0', y: '#c0303f' }),
  opal: L('long', '#e86fa8', '#f6d2b1', '#8a5ad6', 'jacket', ['hat', 'staff', 'runes'], { c: '#6a3a8a', d: '#ff9ad8', a: '#ffe9a8', p: '#4a2a6a', b: '#ff9ad8', o: '#4a2a6a', ha: '#ff9ad8', k: '#e9eef5', y: '#ffe9a8', g: '#ff8ad8' }, '#ff8ad8'),
  aria: L('pony', '#3b5bd6', '#d9a074', '#7fe7ff', 'uniform', ['headset', 'cape', 'sword'], { c: '#2b6e99', d: '#e9eef5', a: '#bfe9ff', p: '#1e4f70', b: '#1a1a1a', hm: '#2a2a33', ha: '#7fe7ff', r: '#1e4f70', ry: '#ffd34d', w: '#e2e8f0', y: '#ffd34d' }),
  /* ★5 */
  leon: L('spiky', '#ffb020', '#d9a074', '#ffcc33', 'armor', ['greatsword', 'cape', 'crownh', 'pauldron'], { am: '#ffe9a8', a: '#ff8a3d', d: '#a07a3a', p: '#5a3a1a', x: '#d4af37', w: '#fff6c8', y: '#ffd34d', g: '#ff8a3d', r: '#8a1a1a', ry: '#ffd34d', hk: '#ffd34d' }, '#ffb020'),
  aeon: L('long', '#f4f1ff', '#f6d2b1', '#7fe7ff', 'coat', ['glasses', 'staff', 'runes'], { c: '#f4f1ff', d: '#3b4a8c', a: '#7fe7ff', p: '#3b4a8c', b: '#2a2f48', ha: '#d4af37', hg: '#7fe7ff', k: '#3b4a8c', y: '#d4af37', g: '#7fe7ff' }, '#7fe7ff'),
  vesper: L('bangs', '#1b1b22', '#f6d2b1', '#a37bff', 'coat', ['hood', 'katana', 'cape'], { c: '#1c1c28', d: '#a37bff', a: '#a37bff', p: '#14141e', b: '#0e0e14', o: '#14141e', w: '#e2ccff', k: '#1a1a1a', y: '#a37bff', r: '#2a1a40', ry: '#a37bff' }),
};
