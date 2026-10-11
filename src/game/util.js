export const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const rf = (a, b) => Math.random() * (b - a) + a;
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const fmt = n => String(Math.round(n * 10) / 10);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* colour helpers shared by the sprite renderer and the arena */
export function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
export function toHex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
export function shade(h, f) { const [r, g, b] = hexRGB(h); return toHex(r * f, g * f, b * f); }
export function hexA(h, a) { const [r, g, b] = hexRGB(h); return `rgba(${r},${g},${b},${a})`; }
export function mix(h1, h2, t) { const a = hexRGB(h1), b = hexRGB(h2); return toHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); }
export function lum(h) { const [r, g, b] = hexRGB(h); return (r * .3 + g * .59 + b * .11) / 255; }
