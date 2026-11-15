import { chromium } from 'playwright-core';
const out = process.argv[2], W = +process.argv[3], Hh = +process.argv[4];
const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const p = await b.newPage({ viewport: { width: W, height: Hh } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
const heroEnd = await p.evaluate(() => { const s = document.querySelector('.scroller'); return document.getElementById('invitation').offsetHeight - s.clientHeight; });
// offsets relative to the end of the hero: before, exactly at, and after the seam enters
const offs = [-Hh * 3.8, -Hh * 2.6, -Hh * 1.2, 0, Hh * 0.6];
for (const [i, o] of offs.entries()) {
  await p.evaluate(y => document.querySelector('.scroller').scrollTo(0, y), heroEnd + o);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/seam${i}.png` });
}
await b.close();
