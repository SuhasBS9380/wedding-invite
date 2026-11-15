import { chromium } from 'playwright-core';
const out = process.argv[2], W = +process.argv[3], Hh = +process.argv[4], id = process.argv[5] || 'invite';
const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const p = await b.newPage({ viewport: { width: W, height: Hh } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
const h = await p.evaluate(id => document.getElementById(id).offsetHeight, id);
const n = Math.ceil(h / Hh);
for (let i = 0; i < n; i++) {
  await p.evaluate(([id, i, Hh]) => { const s = document.querySelector('.scroller'); s.scrollTo(0, document.getElementById(id).offsetTop + i * Hh); }, [id, i, Hh]);
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${out}/step${i}.png` });
}
console.log('steps', n, 'height', h);
await b.close();
