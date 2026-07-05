// Ekstrakcja topiców z banku zadań matura-online.pl → raport do budowy słownika działów.
// Uruchomienie: node D:\maturarozszerzona.pl\scripts\extract-topics.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'D:/matura-online.pl/src/content/zadania';
const OUT_DIR = 'D:/maturarozszerzona.pl/data';
mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

// prosty parser frontmattera: pola jednoliniowe (topic, subject, nr, punkty, typ, difficulty, arkusz)
function parseFm(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.+)$/); // pomija bloki wieloliniowe (tresc: |)
    if (kv && kv[2] !== '|') fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, ''); // strip cudzysłowów (subject: "wos")
  }
  return fm;
}

const tasks = [];
for (const f of files) {
  const raw = readFileSync(join(SRC, f), 'utf8');
  const fm = parseFm(raw);
  if (!fm) { console.error('brak frontmattera:', f); continue; }
  const level = /-pr-\d+/.test(f) ? 'pr' : /-pp-\d+/.test(f) ? 'pp' : '?';
  tasks.push({
    file: f,
    subject: fm.subject ?? f.split('-')[0],
    level,
    arkusz: fm.arkusz ?? null,
    nr: fm.nr ?? null,
    punkty: fm.punkty ?? null,
    typ: fm.typ ?? null,
    difficulty: fm.difficulty ?? null,
    topic: fm.topic ?? null,
  });
}

// agregacja: subject → topic → count (osobno PR i PP)
const agg = {};
for (const t of tasks) {
  if (!t.topic) continue;
  // topic bywa listą po przecinku — traktujemy każdy człon jako tag
  const tags = t.topic.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const key = `${t.subject}|${t.level}`;
  agg[key] ??= {};
  for (const tag of tags) agg[key][tag] = (agg[key][tag] ?? 0) + 1;
}

// raport
const report = {};
for (const [key, topics] of Object.entries(agg)) {
  report[key] = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));
}

writeFileSync(join(OUT_DIR, 'tasks-index.json'), JSON.stringify(tasks, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, 'topics-report.json'), JSON.stringify(report, null, 2), 'utf8');

// podsumowanie na konsolę
const bySubject = {};
for (const t of tasks) {
  bySubject[t.subject] ??= { pr: 0, pp: 0, noTopic: 0 };
  bySubject[t.subject][t.level === 'pr' ? 'pr' : 'pp']++;
  if (!t.topic) bySubject[t.subject].noTopic++;
}
console.log('subject           PR   PP  bezTopic  unikalneTagiPR');
for (const [s, v] of Object.entries(bySubject).sort((a, b) => b[1].pr - a[1].pr)) {
  const uniq = report[`${s}|pr`]?.length ?? 0;
  console.log(s.padEnd(16), String(v.pr).padStart(4), String(v.pp).padStart(4), String(v.noTopic).padStart(9), String(uniq).padStart(15));
}
console.log(`\nRazem zadań: ${tasks.length}. Raporty: ${OUT_DIR}\\tasks-index.json, topics-report.json`);
