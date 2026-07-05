// Ekstrahuje harmonogram matur PR z maturalnie.pl (daty-matur.ts) → src/data/terminy.json.
// Bierze najbliższą sesję, której koniec jest w przyszłości względem daty przekazanej w argv[2]
// (ISO). Zaznacza czy daty są oficjalne czy szacunkowe (pole `oficjalna` w źródle).
// Uruchomienie: node scripts/extract-terminy.mjs 2026-07-05
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'D:/maturalnie.pl/src/data/daty-matur.ts';
const OUT = 'D:/maturarozszerzona.pl/src/data';
const TODAY = process.argv[2] || '2026-07-05'; // brak Date.now() w skryptach WF; podajemy jawnie
mkdirSync(OUT, { recursive: true });

const raw = readFileSync(SRC, 'utf8');

// mapowanie slug źródła → nasz slug przedmiotu (null = nie mamy hubu)
const SLUG_MAP = {
  polski: null, matematyka: 'matematyka', angielski: 'jezyk-angielski', niemiecki: null,
  biologia: 'biologia', chemia: 'chemia', historia: 'historia', wos: 'wos',
  geografia: 'geografia', informatyka: 'informatyka', fizyka: 'fizyka',
};

// parsuj bloki sesji
const sesje = [];
for (const sm of raw.matchAll(/rok:\s*(\d+),\s*\n\s*oficjalna:\s*(true|false),\s*\n\s*startIso:\s*"([^"]+)",\s*\n\s*koniecIso:\s*"([^"]+)",\s*\n\s*poprawkowaIso:\s*(null|"[^"]+"),([\s\S]*?)\n\s*\],\s*\n\s*\};/g)) {
  const [, rok, oficjalna, startIso, koniecIso, poprawkowa, body] = sm;
  const egzaminy = [];
  for (const em of body.matchAll(/przedmiot:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*poziom:\s*"([^"]+)",\s*dataIso:\s*"([^"]+)",\s*godzina:\s*"([^"]+)",\s*czasTrwania:\s*(\d+),\s*obowiazkowy:\s*(true|false)/g)) {
    egzaminy.push({
      przedmiot: em[1], srcSlug: em[2], poziom: em[3], dataIso: em[4],
      godzina: em[5], czasTrwania: Number(em[6]), obowiazkowy: em[7] === 'true',
      hubSlug: SLUG_MAP[em[2]] ?? null,
    });
  }
  sesje.push({
    rok: Number(rok), oficjalna: oficjalna === 'true', startIso, koniecIso,
    poprawkowaIso: poprawkowa === 'null' ? null : poprawkowa.replace(/"/g, ''),
    egzaminy,
  });
}

// wybierz najbliższą sesję (koniec >= dziś)
const aktualna = sesje.find((s) => s.koniecIso >= TODAY) ?? sesje[sesje.length - 1];

// tylko PR (nasz serwis), posortowane wg daty
const egzaminyPR = aktualna.egzaminy
  .filter((e) => e.poziom === 'PR')
  .sort((a, b) => a.dataIso.localeCompare(b.dataIso));

const out = {
  rok: aktualna.rok,
  oficjalna: aktualna.oficjalna,
  startIso: aktualna.startIso,
  koniecIso: aktualna.koniecIso,
  poprawkowaIso: aktualna.poprawkowaIso,
  // stałe terminy deklaracji (niezależne od roku, wg procedur CKE)
  deklaracjaWstepna: `${aktualna.rok - 1}-09-30`,
  deklaracjaOstateczna: `${aktualna.rok}-02-07`,
  egzaminyPR,
};

writeFileSync(join(OUT, 'terminy.json'), JSON.stringify(out, null, 2), 'utf8');
console.log(`Sesja ${out.rok} (${out.oficjalna ? 'oficjalna' : 'SZACUNKOWA'}): ${egzaminyPR.length} egzaminów PR`);
console.log(`  start ${out.startIso}, poprawka ${out.poprawkowaIso}`);
for (const e of egzaminyPR) console.log(`  ${e.dataIso} ${e.godzina}  ${e.przedmiot} (${e.czasTrwania} min)${e.hubSlug ? '' : '  [brak hubu]'}`);
