import { hexRGB, clamp } from '../game/util.js';

/* A tiny pixel-art rasteriser.
   Shapes are filled pixel by pixel (no anti-aliasing); each pixel gets one of five tones of its
   colour from a light direction (top-left-front), shadows shift cool and highlights warm.
   finish() then draws inner contact lines between overlapping parts and a dark outer outline,
   which gives the soft-shaded, dark-outlined chibi sprite look. */

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
const toInt = ([r, g, b]) => (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255);
const hueToward = (h, target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), Math.abs(amt)); };

/* five tones: [highlight, light, base, shadow, deep] */
export function ramp(hex) {
  let [h, s, l] = rgb2hsl(...hexRGB(hex));
  if (s < .06) h = 225;
  const mk = (dl, dh, ds) => toInt(hsl2rgb(dh > 0 ? hueToward(h, 55, dh) : hueToward(h, 255, dh), clamp(s + ds, 0, 1), clamp(l + dl, .03, .97)));
  return [mk(.2, 10, -.04), mk(.09, 5, 0), toInt(hexRGB(hex)), mk(-.13, -12, .05), mk(-.25, -20, .04)];
}
export const intOf = hex => toInt(hexRGB(hex));
const mixInt = (a, b, t) => toInt([((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t, ((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t, (a & 255) * (1 - t) + (b & 255) * t]);
const scaleInt = (a, f) => toInt([((a >> 16) & 255) * f, ((a >> 8) & 255) * f, (a & 255) * f]);

export function painter(W, H) {
  const col = new Int32Array(W * H).fill(-1), pid = new Int16Array(W * H).fill(-1), tag = new Uint8Array(W * H);
  const parts = [], rc = new Map();
  const R = hex => { let r = rc.get(hex); if (!r) { r = ramp(hex); rc.set(hex, r); } return r; };
  const newPart = o => { parts.push({ line: o.line !== false, recv: o.recv !== false }); return parts.length - 1; };
  const put = (x, y, c, p, t) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; col[i] = c; pid[i] = p; tag[i] = t; };

  function toneOf(nx, ny, o) {
    if (o.tone != null) return o.tone;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const d = -.5 * nx - .62 * ny + .6 * nz + (o.bias || 0);
    let t = d > .92 ? 0 : d > .5 ? 1 : d > .06 ? 2 : d > -.38 ? 3 : 4;
    if (t === 0 && !o.hi) t = 1;
    return clamp(t, o.minT ?? 0, o.maxT ?? 4);
  }
  function fill(x0, y0, x1, y1, inside, normal, hex, o = {}) {
    const p = o.part ?? newPart(o), r = typeof hex === 'number' ? null : R(hex), t = o.tag ? o.tag.charCodeAt(0) : 0;
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++)
      for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W - 1, Math.ceil(x1)); x++) {
        const px = x + .5, py = y + .5;
        if (!inside(px, py) || (o.clip && !o.clip(px, py))) continue;
        const [nx, ny] = normal(px, py);
        put(x, y, r ? r[toneOf(nx, ny, o)] : hex, p, t);
      }
    return p;
  }
  const P = {
    W, H, col, pid, tag, parts, R,
    part: (o = {}) => newPart(o),
    ell(cx, cy, rx, ry, hex, o = {}) {
      return fill(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
        o.shade === 'flat' ? () => [0, 0] : (x, y) => [(x - cx) / rx * (o.curve ?? 1), (y - cy) / ry * (o.curve ?? 1)], hex, o);
    },
    /* capsule: a thick line with rounded ends; r may taper from r to r2 */
    cap(x1, y1, x2, y2, r, hex, o = {}) {
      const r2 = o.r2 ?? r, dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
      const near = (x, y) => { const t = clamp(((x - x1) * dx + (y - y1) * dy) / L2, 0, 1); return [x1 + dx * t, y1 + dy * t, r + (r2 - r) * t]; };
      const m = Math.max(r, r2);
      return fill(Math.min(x1, x2) - m, Math.min(y1, y2) - m, Math.max(x1, x2) + m, Math.max(y1, y2) + m,
        (x, y) => { const [cx, cy, rr] = near(x, y); return (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr; },
        o.shade === 'flat' ? () => [0, 0] : (x, y) => { const [cx, cy, rr] = near(x, y); return [(x - cx) / rr, (y - cy) / rr]; }, hex, o);
    },
    /* polygon, shaded like a horizontal cylinder (rounded body parts and cloth) */
    poly(pts, hex, o = {}) {
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs)), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
      const ins = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
      const rows = new Map(), cols = new Map();
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (ins(x + .5, y + .5)) {
        const r = rows.get(y) || [x, x]; rows.set(y, [Math.min(r[0], x), Math.max(r[1], x)]);
        const c = cols.get(x) || [y, y]; cols.set(x, [Math.min(c[0], y), Math.max(c[1], y)]);
      }
      const nrm = o.shade === 'flat' ? () => [0, 0] : (x, y) => {
        const r = rows.get(Math.floor(y)), c = cols.get(Math.floor(x)); if (!r || !c) return [0, 0];
        const u = (x - r[0]) / (r[1] - r[0] + 1) * 2 - 1, v = (y - c[0]) / (c[1] - c[0] + 1) * 2 - 1;
        return o.shade === 'v' ? [0, v * .9] : [u * (o.curve ?? .95), v * (o.vcurve ?? .45)];
      };
      return fill(x0, y0, x1, y1, ins, nrm, hex, o);
    },
    rect(x, y, w, h, hex, o = {}) { return P.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], hex, o); },
    px(x, y, hex, tone = 2, o = {}) { const p = o.part ?? newPart({ line: false, ...o }); put(Math.floor(x), Math.floor(y), typeof hex === 'number' ? hex : R(hex)[tone], p, o.tag ? o.tag.charCodeAt(0) : 0); return p; },
    /* 1px line (Bresenham) */
    line(x1, y1, x2, y2, hex, tone = 2, o = {}) {
      const p = o.part ?? newPart({ line: false, ...o }), c = typeof hex === 'number' ? hex : R(hex)[tone], t = o.tag ? o.tag.charCodeAt(0) : 0;
      x1 = Math.round(x1); y1 = Math.round(y1); x2 = Math.round(x2); y2 = Math.round(y2);
      const dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1), sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1; let e = dx + dy;
      for (;;) { put(x1, y1, c, p, t); if (x1 === x2 && y1 === y2) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x1 += sx; } if (e2 <= dx) { e += dx; y1 += sy; } }
      return p;
    },
    /* polyline through points with a width — for bows, tails, horns */
    path(pts, r, hex, o = {}) { const p = o.part ?? newPart(o); for (let i = 0; i < pts.length - 1; i++) { const t0 = i / (pts.length - 1), t1 = (i + 1) / (pts.length - 1), ra = r + ((o.r2 ?? r) - r) * t0, rb = r + ((o.r2 ?? r) - r) * t1; P.cap(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ra, hex, { ...o, r2: rb, part: p }); } return p; },
  };
  return P;
}

export const OUT = intOf('#160d1d');
/* inner contact lines + outer outline (+ optional glow ring). Returns RGBA pixels and a kind map:
   0 empty · 1 body · 2 outline · 3 glow */
export function finish(P, { glow = null, margin = 3 } = {}) {
  const { W, H, col, pid, tag, parts } = P, body = Int32Array.from(col);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (col[i] < 0 || !parts[pid[i]].recv) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const j = Y * W + X; if (col[j] < 0) continue;
      if (pid[j] > pid[i] && parts[pid[j]].line) { body[i] = mixInt(scaleInt(col[i], .62), OUT, .38); break; }
    }
  }
  const W2 = W + margin * 2, H2 = H + margin * 2, c2 = new Int32Array(W2 * H2).fill(-1), kind = new Uint8Array(W2 * H2), tg = new Uint8Array(W2 * H2);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (body[i] < 0) continue; const j = (y + margin) * W2 + x + margin; c2[j] = body[i]; kind[j] = 1; tg[j] = tag[i]; }
  const ring = (from, k, colorOf) => {
    const add = [];
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      const i = y * W2 + x; if (kind[i]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W2 || Y >= H2) continue; const j = Y * W2 + X; if (kind[j] === from) { add.push([i, colorOf(c2[j])]); break; } }
    }
    add.forEach(([i, c]) => { c2[i] = c; kind[i] = k; });
  };
  ring(1, 2, c => mixInt(scaleInt(c, .3), OUT, .6));
  if (glow) { const g = intOf(glow); ring(2, 3, () => g); }
  return { W: W2, H: H2, c: c2, kind, tag: tg };
}
