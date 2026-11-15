// Slices the 2:3 arch artwork (frame1) into top cap / seamless repeat tile / bottom base,
// so the arch can be stretched edge-to-edge for any page height.
// Cut rows were found by searching for the pillar period with the lowest seam error.
import sharp from 'sharp';

const SRC = '../assets/frame1.webp';
const OUT = './public/assets/';
const W = 2048, H = 3072;
const Y0 = 1174;   // top cap ends / repeat tile starts (a cornice between statue tiers)
const P = 544;     // pillar period (tile height)
const BOT = 2262;  // bottom slice starts (≈ Y0 + 2P, leaves/lamps included in bottom)
const F = 80;      // cross-fade rows at the tile seam
const OUT_W = 1600;
const Q = { quality: 78, effort: 5 };

const { data } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const ch = 3, stride = W * ch;

// Cross-fades are applied only in the cream centre (plain paper). The pillar statues differ from tier to tier,
// so blending them gives a ghosted double exposure; there the rows are cut hard at a cornice instead.
const creamWeight = (px) => {
  const u = px / W, a = 0.25, b = 0.75, ramp = 0.03
  if (u <= a - ramp || u >= b + ramp) return 0
  if (u < a) return (u - (a - ramp)) / ramp
  if (u > b) return ((b + ramp) - u) / ramp
  return 1
}

// tile: rows Y0 .. Y0+P-1; last F rows blend into the rows just above Y0 so tile end → tile start is seamless
const tile = Buffer.alloc(P * stride);
for (let r = 0; r < P; r++) {
  const srcRow = Y0 + r;
  const k = r - (P - F);
  for (let x = 0; x < stride; x++) {
    let v = data[srcRow * stride + x];
    if (k >= 0) {
      const w = ((k + 1) / F) * creamWeight((x / ch) | 0); // 0 → 1 across the seam zone, cream only
      const other = data[(srcRow - P) * stride + x]; // same phase, one period above
      v = Math.round(v * (1 - w) + other * w);
    }
    tile[r * stride + x] = v;
  }
}

const emit = async (name, input, raw) => {
  let p = raw ? sharp(input, { raw: { width: W, height: raw, channels: 3 } }) : sharp(input);
  const info = await p.resize({ width: OUT_W }).webp(Q).toFile(OUT + name);
  console.log(name, `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)}KB`);
};

await emit('arch-top.webp', await sharp(SRC).extract({ left: 0, top: 0, width: W, height: Y0 }).toBuffer());
await emit('arch-mid.webp', tile, P);
// bottom: its first rows cross-fade from the tile's first rows, so the tile → base join has no tonal seam
const BH = H - BOT, FB = 160;
const base = Buffer.alloc(BH * stride);
for (let r = 0; r < BH; r++) {
  const w = r < FB ? r / FB : 1;
  for (let x = 0; x < stride; x++) {
    const own = data[(BOT + r) * stride + x];
    const t = (1 - w) * creamWeight((x / ch) | 0); // how much of the tile row to keep
    base[r * stride + x] = t > 0 ? Math.round(data[(Y0 + r) * stride + x] * t + own * (1 - t)) : own;
  }
}
await emit('arch-bottom.webp', base, BH);
await sharp(SRC).resize({ width: 400 }).toBuffer(); // sanity: source readable
console.log('done');
