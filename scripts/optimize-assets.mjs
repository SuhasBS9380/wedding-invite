// Converts the original heavy assets in ../assets into web-ready files in public/assets.
import sharp from 'sharp';
const src = '../assets/', out = './public/assets/';
const jobs = [
  ['temple-frame1.webp', 'temple.webp', 'webp', { quality: 78, alphaQuality: 90, effort: 5 }, 1500],
  ['trees.avif', 'trees.webp', 'webp', { quality: 70, alphaQuality: 85, effort: 6 }, 1500],
  // phones: lighter copies of the hero's temple and canopy (half the decoded memory)
  ['temple-frame1.webp', 'temple-md.webp', 'webp', { quality: 80, alphaQuality: 90, effort: 5 }, 1100],
  ['trees.avif', 'trees-md.webp', 'webp', { quality: 72, alphaQuality: 85, effort: 6 }, 1100],
  ['sky.jpg', 'sky.webp', 'webp', { quality: 80 }, 1600],
  ['ph-invitation.jpg', 'ph-invitation.webp', 'webp', { quality: 80 }, 600],
  ['monogram.png', 'monogram.webp', 'webp', { quality: 90 }, 400],
  ['venue-qr.png', 'venue-qr.png', 'png', { compressionLevel: 9 }, null],
  ['frame1.webp', 'frame1.webp', 'webp', { quality: 80, effort: 5 }, 1100],
  ['frame2.webp', 'frame2.webp', 'webp', { quality: 70, effort: 5 }, 1400],
  ['frame4.webp', 'frame4.webp', 'webp', { quality: 80, alphaQuality: 90, effort: 5 }, 1000],
  ['frame4.webp', 'frame4-lg.webp', 'webp', { quality: 78, alphaQuality: 90, effort: 5 }, 1872],
  // phones: half the decoded memory of -lg, still ~2x the canvas's CSS width
  ['frame4.webp', 'frame4-md.webp', 'webp', { quality: 80, alphaQuality: 90, effort: 5 }, 1320],
  ['couple.avif', 'couple.webp', 'webp', { quality: 88, alphaQuality: 95 }, null],
  ['countdown.avif', 'countdown.webp', 'webp', { quality: 78, effort: 5 }, 1000],
  ['ganesh.avif', 'ganesh.webp', 'webp', { quality: 90, alphaQuality: 95 }, 512],
];
const only = process.argv.slice(2);
for (const [i, o, fmt, opts, w] of jobs) {
  if (only.length && !only.includes(o)) continue;
  let p = sharp(src + i);
  if (w) p = p.resize({ width: w, withoutEnlargement: true });
  const info = await p.toFormat(fmt, opts).toFile(out + o);
  console.log(o, `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)}KB`);
}
