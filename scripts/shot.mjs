import { chromium } from 'playwright-core';
const out = process.argv[2], W = +(process.argv[3] || 390), Hh = +(process.argv[4] || 844);
const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const p = await b.newPage({ viewport: { width: W, height: Hh } });
const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
// stops: [label, sectionId, fraction-of-section-scrolled]
const stops = [['hero0', 'invitation', 0], ['hero2', 'invitation', 0.5], ['invite', 'invite', 0], ['events', 'events', 0], ['scene0', 'scene', 0.0], ['scene1', 'scene', 0.4], ['scene2', 'scene', 0.9], ['story', 'story', 0], ['count', 'countdown', 0], ['rsvp', 'rsvp', 0]];
for (const [label, id, f] of stops) {
  await p.evaluate(([id, f]) => { const s = document.querySelector('.scroller'), e = document.getElementById(id); s.scrollTo(0, e.offsetTop + f * (e.offsetHeight - s.clientHeight)); }, [id, f]);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/${label}.png` });
}
console.log('errors:', errs);
await b.close();
