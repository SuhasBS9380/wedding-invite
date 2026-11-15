// Removes a painted-in grey/white "transparency" checkerboard from an image that has no alpha channel.
// Flood-fills from the borders (and from enclosed checkerboard pockets) through checkerboard-like pixels,
// feathers the edge, trims to the subject and writes a transparent WebP.
// usage: node scripts/cutout.mjs <in.png> <out.webp> [maxWidth]
import sharp from 'sharp'

const [, , input, output, maxW = '1000'] = process.argv
const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, N = W * H

// checkerboard pixels are light and almost neutral (white ≈253, grey ≈208 with a faint blue tint)
const like = new Uint8Array(N)
const grey = new Uint8Array(N)
for (let p = 0; p < N; p++) {
  const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2]
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  const neutral = mx - mn <= 14 && b >= r - 3 // never warmer than neutral (cloth whites are cream)
  if (neutral && mn >= 192) like[p] = 1
  if (neutral && mn >= 192 && mx <= 228) grey[p] = 1
}

// connected components of checkerboard-like pixels
const label = new Int32Array(N).fill(-1)
const comps = []
const stack = new Int32Array(N)
for (let s = 0; s < N; s++) {
  if (!like[s] || label[s] !== -1) continue
  const id = comps.length
  let sp = 0, size = 0, greys = 0, border = false
  stack[sp++] = s; label[s] = id
  while (sp) {
    const p = stack[--sp]; size++; greys += grey[p]
    const x = p % W, y = (p - x) / W
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true
    if (x > 0 && like[p - 1] && label[p - 1] === -1) { label[p - 1] = id; stack[sp++] = p - 1 }
    if (x < W - 1 && like[p + 1] && label[p + 1] === -1) { label[p + 1] = id; stack[sp++] = p + 1 }
    if (y > 0 && like[p - W] && label[p - W] === -1) { label[p - W] = id; stack[sp++] = p - W }
    if (y < H - 1 && like[p + W] && label[p + W] === -1) { label[p + W] = id; stack[sp++] = p + W }
  }
  // background = touches the border, or an enclosed pocket that really is checkerboard (has both tones)
  const pocket = size > 250 && greys / size > 0.25 && greys / size < 0.75
  comps.push(border || pocket)
}

const alpha = Buffer.alloc(N)
for (let p = 0; p < N; p++) alpha[p] = label[p] !== -1 && comps[label[p]] ? 0 : 255

// shrink the mask by 1px (drops the checkerboard fringe), then soften the edge
const er = Buffer.from(alpha)
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  const p = y * W + x
  if (alpha[p] && !(alpha[p - 1] && alpha[p + 1] && alpha[p - W] && alpha[p + W])) er[p] = 0
}
const mask = await sharp(er, { raw: { width: W, height: H, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer()

const rgba = Buffer.alloc(N * 4)
for (let p = 0; p < N; p++) {
  rgba[p * 4] = data[p * 3]; rgba[p * 4 + 1] = data[p * 3 + 1]; rgba[p * 4 + 2] = data[p * 3 + 2]; rgba[p * 4 + 3] = mask[p]
}
const out = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .trim({ threshold: 1 })
  .resize({ width: +maxW, withoutEnlargement: true })
  .webp({ quality: 86, alphaQuality: 92, effort: 5 })
  .toFile(output)
console.log(output, `${out.width}x${out.height}`, `${(out.size / 1024).toFixed(0)}KB`)
