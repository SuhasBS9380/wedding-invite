import { chromium } from 'playwright-core';
const out = process.argv[2], W = +(process.argv[3] || 390), Hh = +(process.argv[4] || 844);
const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const p = await b.newPage({ viewport: { width: W, height: Hh } });
const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
// scroll through the arch page slowly so reveals fire, then capture the full arch element
const info = await p.evaluate(async () => {
  const s = document.querySelector('.scroller'), e = document.getElementById('invite');
  const start = e.offsetTop, end = start + e.offsetHeight;
  for (let y = start; y < end; y += s.clientHeight / 2) { s.scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); }
  s.scrollTo(0, start); await new Promise(r => setTimeout(r, 800));
  return { h: e.offsetHeight, top: start };
});
console.log(info);
await p.locator('#invite').screenshot({ path: `${out}/arch-full.png` });
await p.evaluate(() => { const s = document.querySelector('.scroller'); s.scrollTo(0, document.getElementById('invite').offsetTop); });
await p.waitForTimeout(600); await p.screenshot({ path: `${out}/arch-view0.png` });
console.log('errors:', errs);
await b.close();
