// Synchronizacja danych zadań z banku matura-online.pl → src/data/ (self-contained build).
// Czyta TYLKO frontmatter (tresc/odpowiedz/pulapka) — body MDX (pełne rozwiązania) zostaje
// wyłącznie na matura-online.pl (anty-duplikacja; my linkujemy do pełnego rozwiązania).
// Uruchomienie: node scripts/sync-zadania.mjs (po map-dzialy.mjs)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'D:/maturarozszerzona.pl';
const SRC_ZADANIA = 'D:/matura-online.pl/src/content/zadania';
const DATA = join(ROOT, 'data');
const OUT = join(ROOT, 'src/data');

const readJson = p => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));

// ── parser frontmattera z obsługą bloków wieloliniowych (key: |) ──
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const lines = m[1].split(/\r?\n/);
  const fm = {};
  let i = 0;
  while (i < lines.length) {
    const kv = lines[i].match(/^(\w+):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const [, key, val] = kv;
    if (val === '|' || val === '|-') {
      const block = [];
      i++;
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        block.push(lines[i].slice(2));
        i++;
      }
      fm[key] = block.join('\n').replace(/\s+$/, '');
    } else {
      fm[key] = val.trim().replace(/^["']|["']$/g, '');
      i++;
    }
  }
  return fm;
}

// ── wczytaj mapowanie działów ──
const mapping = readJson(join(DATA, 'zadania-dzialy.json'));
const byFile = new Map(mapping.map(m => [m.file, m]));

// ── słowniki działów (per subject) ──
const dicts = {};
for (const f of readdirSync(join(DATA, 'dzialy')).filter(f => f.endsWith('.json'))) {
  const d = readJson(join(DATA, 'dzialy', f));
  dicts[d.subject] = d;
}

// ── zbuduj rekordy per subject ──
const bySubject = {};
let errors = 0;
for (const [file, map] of byFile) {
  const raw = readFileSync(join(SRC_ZADANIA, file), 'utf8');
  const fm = parseFrontmatter(raw);
  if (!fm || !fm.tresc) { console.error('brak tresc:', file); errors++; continue; }
  const subject = fm.subject;
  const arkuszSlug = fm.arkusz;                          // np. matematyka-2024-maj-pr
  const arkuszUrl = arkuszSlug.replace(`${subject}-`, ''); // → 2024-maj-pr
  const [rok, sesja, poziom] = arkuszUrl.split('-');
  bySubject[subject] ??= [];
  bySubject[subject].push({
    id: file.replace(/\.(md|mdx)$/, ''),
    nr: Number(fm.nr),
    punkty: Number(fm.punkty),
    typ: fm.typ,
    topic: fm.topic,
    difficulty: Number(fm.difficulty ?? 3),
    rok: Number(rok),
    sesja,
    poziom,
    tresc: fm.tresc,
    odpowiedz: fm.odpowiedz ?? '',
    pulapka: fm.pulapka ?? '',
    wymaganie: fm.wymaganie ?? '',
    dzial: map.dzial,
    dzialyDodatkowe: map.dzialyDodatkowe,
    // pełne rozwiązanie krok po kroku → satelita arkuszowy
    rozwiazanieUrl: `https://www.matura-online.pl/${subject}/${arkuszUrl}/zadanie-${fm.nr}/`,
  });
}

// ── zapisz ──
mkdirSync(join(OUT, 'zadania'), { recursive: true });
mkdirSync(join(OUT, 'dzialy'), { recursive: true });
for (const [subject, zadania] of Object.entries(bySubject)) {
  zadania.sort((a, b) => b.rok - a.rok || a.nr - b.nr);
  writeFileSync(join(OUT, 'zadania', `${subject}.json`), JSON.stringify(zadania, null, 2), 'utf8');
  const dict = dicts[subject];
  if (dict) {
    // do frontendu: słownik bez patterns + liczności
    const dzialy = dict.dzialy.map(({ slug, nazwa }) => ({
      slug, nazwa,
      count: zadania.filter(z => z.dzial === slug || z.dzialyDodatkowe.includes(slug)).length,
    }));
    writeFileSync(join(OUT, 'dzialy', `${subject}.json`), JSON.stringify(dzialy, null, 2), 'utf8');
  }
  console.log(`${subject}: ${zadania.length} zadań → src/data/zadania/${subject}.json`);
}
if (errors) console.error(`Błędy: ${errors}`);
