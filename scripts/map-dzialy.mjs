// Mapuje zadania (tasks-index.json) na działy wg słowników data/dzialy/<subject>.json.
// Kolejność działów w słowniku = priorytet (pierwsze dopasowanie wygrywa jako dział główny,
// kolejne dopasowania trafiają do dzialyDodatkowe).
// Uruchomienie: node D:\maturarozszerzona.pl\scripts\map-dzialy.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'D:/maturarozszerzona.pl/data';
const readJson = p => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')); // PS zapisuje BOM
const tasks = readJson(join(DATA, 'tasks-index.json'));

const dicts = {};
for (const f of readdirSync(join(DATA, 'dzialy')).filter(f => f.endsWith('.json'))) {
  const d = readJson(join(DATA, 'dzialy', f));
  dicts[`${d.subject}|${d.level}`] = d.dzialy.map(dz => ({
    ...dz,
    regexes: dz.patterns.map(p => new RegExp(p, 'i')),
  }));
}

const mapped = [];
const unmapped = [];
for (const t of tasks) {
  const dict = dicts[`${t.subject}|${t.level}`];
  if (!dict || !t.topic) continue;
  // Słowniki budowano na pojedynczych tagach (topic rozbity po przecinku), więc dopasowujemy
  // per-tag — spójnie z weryfikacją agentów. Cały topic też testujemy jako fallback.
  const tags = [...t.topic.split(',').map(s => s.trim()).filter(Boolean), t.topic];
  const hits = [];
  for (const dz of dict) {
    if (tags.some(tag => dz.regexes.some(rx => rx.test(tag)))) hits.push(dz.slug);
  }
  if (hits.length) {
    mapped.push({ file: t.file, arkusz: t.arkusz, nr: t.nr, punkty: t.punkty, typ: t.typ,
      difficulty: t.difficulty, topic: t.topic, dzial: hits[0], dzialyDodatkowe: hits.slice(1) });
  } else {
    unmapped.push({ file: t.file, topic: t.topic });
  }
}

writeFileSync(join(DATA, 'zadania-dzialy.json'), JSON.stringify(mapped, null, 2), 'utf8');
writeFileSync(join(DATA, 'zadania-unmapped.json'), JSON.stringify(unmapped, null, 2), 'utf8');

// podsumowanie: główne + łącznie (strona działu pokazuje wszystkie przypisania)
const main = {}, total = {};
for (const m of mapped) {
  main[m.dzial] = (main[m.dzial] ?? 0) + 1;
  total[m.dzial] = (total[m.dzial] ?? 0) + 1;
  for (const d of m.dzialyDodatkowe) total[d] = (total[d] ?? 0) + 1;
}
console.log('dział                                   główne  łącznie');
for (const [dz, c] of Object.entries(total).sort((a, b) => b[1] - a[1])) {
  console.log(dz.padEnd(40), String(main[dz] ?? 0).padStart(5), String(c).padStart(8));
}
console.log(`\nZmapowane: ${mapped.length}, niezmapowane: ${unmapped.length}`);
if (unmapped.length) {
  console.log('\nNiezmapowane topici:');
  for (const u of unmapped) console.log(' -', u.file, '::', u.topic);
}
