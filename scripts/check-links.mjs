// QA: skanuje dist/ i sprawdza, czy każdy wewnętrzny href prowadzi do istniejącego pliku.
// Uruchomienie: node scripts/check-links.mjs
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'D:/maturarozszerzona.pl/dist';

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

function resolveInternal(href) {
  let h = href.split('#')[0].split('?')[0];
  if (!h.startsWith('/')) return null;          // tylko absolutne wewnętrzne
  if (h.startsWith('//')) return null;          // protocol-relative = zewnętrzne
  let target = join(DIST, h);
  if (h.endsWith('/')) target = join(target, 'index.html');
  else if (!h.match(/\.\w+$/)) target = target + '/index.html'; // katalog bez slasha
  return target;
}

const files = walk(DIST);
const broken = [];
let checked = 0;
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const rel = f.replace(DIST, '').replace(/\\/g, '/');
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue; // zewnętrzne
    const target = resolveInternal(href);
    if (!target) continue;
    checked++;
    if (!existsSync(target)) broken.push({ page: rel, href });
  }
}

console.log(`Sprawdzono ${checked} wewnętrznych linków w ${files.length} stronach.`);
if (broken.length === 0) {
  console.log('✓ Zero zepsutych linków wewnętrznych.');
} else {
  console.log(`✗ ${broken.length} zepsutych linków:`);
  for (const b of broken.slice(0, 50)) console.log(`  [${b.page}] → ${b.href}`);
}
