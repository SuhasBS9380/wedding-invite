import { chromium } from 'playwright-core';
const out = process.argv[2];
const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await p.goto('https://theartfulinvitesdemo02.framer.website/', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
console.log('height', H);
let i = 0;
for (let y = 0; y < H && i < 14; y += 700, i++) {
  await p.evaluate(v => window.scrollTo(0, v), y);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/r${String(i).padStart(2, '0')}.png` });
}
const info = await p.evaluate(() => {
  const fonts = new Set(), colors = new Set();
  document.querySelectorAll('h1,h2,h3,p,a,div,span').forEach(e => {
    if (!e.childElementCount && e.textContent.trim()) {
      const s = getComputedStyle(e); fonts.add(s.fontFamily + ' | ' + s.fontSize + ' | ' + s.fontWeight + ' | ' + s.textTransform); colors.add(s.color);
    }
  });
  return { bg: getComputedStyle(document.body).backgroundColor, fonts: [...fonts].slice(0, 25), colors: [...colors] };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
