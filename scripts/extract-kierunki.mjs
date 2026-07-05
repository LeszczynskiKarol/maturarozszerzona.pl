// Ekstrahuje wymagania rekrutacyjne z maturalnie.pl (autorytatywne źródło) i agreguje
// do GENERYCZNEGO widoku per kierunek: które rozszerzenia są kluczowe, które pomocnicze,
// na jakich uczelniach kierunek występuje (+ link do rekrutacji).
// NIE kopiujemy progów ani wzorów punktowych — to zostaje na maturalnie.pl (kalkulator).
// Uruchomienie: node scripts/extract-kierunki.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'D:/maturalnie.pl/src/data/kierunki.ts';
const OUT = 'D:/maturarozszerzona.pl/src/data';
mkdirSync(OUT, { recursive: true });

const raw = readFileSync(SRC, 'utf8');

const PRZEDMIOT_NAZWA = {
  polski: 'j. polski', matematyka: 'matematyka', angielski: 'j. angielski',
  biologia: 'biologia', chemia: 'chemia', fizyka: 'fizyka', geografia: 'geografia',
  historia: 'historia', wos: 'WOS', informatyka: 'informatyka', niemiecki: 'j. niemiecki',
};

// ── parsuj bloki kierunków: od `id: "..."` do zamknięcia grupy maxPkt/linkRekrutacji ──
const entries = [];
const blockRe = /id:\s*"([^"]+)"[\s\S]*?linkRekrutacji:\s*"([^"]+)"/g;
let m;
while ((m = blockRe.exec(raw))) {
  const block = m[0];
  const get = (k) => (block.match(new RegExp(`${k}:\\s*"([^"]+)"`)) || [])[1];
  const kategoria = get('kategoria');
  const name = get('name');
  const uczelniaSlug = get('uczelniaSlug');
  const slug = get('slug');
  const maxPkt = Number((block.match(/maxPkt:\s*(\d+)/) || [])[1] || 0);
  // grupy: { label: "...", oneOf: [p("slug", waga), ...] } — oneOf = wybierz JEDEN
  const grupy = [];
  for (const gm of block.matchAll(/oneOf:\s*\[([\s\S]*?)\]/g)) {
    const opcje = [];
    for (const pm of gm[1].matchAll(/p\("([a-ząćęłńóśźż]+)",\s*([\d.]+)\)/g)) {
      opcje.push({ slug: pm[1], waga: Number(pm[2]) });
    }
    if (opcje.length) grupy.push(opcje);
  }
  entries.push({ id: m[1], name, slug, kategoria, uczelniaSlug, maxPkt,
    linkRekrutacji: m[2], grupy });
}

// ── agreguj per kierunek (slug) ──
const byKierunek = {};
for (const e of entries) {
  byKierunek[e.slug] ??= { slug: e.slug, name: e.name, kategoria: e.kategoria,
    uczelnie: [], stat: {}, wystapienia: 0 };
  const k = byKierunek[e.slug];
  k.wystapienia++;
  k.uczelnie.push({ uczelniaSlug: e.uczelniaSlug, maxPkt: e.maxPkt, link: e.linkRekrutacji });
  for (const grupa of e.grupy) {
    const sole = grupa.length === 1; // jedyna opcja w grupie = obowiązkowy
    for (const p of grupa) {
      k.stat[p.slug] ??= { soleCount: 0, altCount: 0, maxWaga: 0 };
      if (sole) k.stat[p.slug].soleCount++;
      else k.stat[p.slug].altCount++;
      k.stat[p.slug].maxWaga = Math.max(k.stat[p.slug].maxWaga, p.waga);
    }
  }
}

// ── sklasyfikuj przedmioty ──
// rdzen  — obowiązkowy (jedyna opcja w grupie) na ≥50% uczelni → zawsze go potrzebujesz
// kluczowy — nie-obowiązkowy, ale wysoko punktowany (waga ≥1.5) i częsta alternatywa
// pomocniczy — alternatywa / dodatkowe punkty
const kierunki = Object.values(byKierunek).map((k) => {
  const przedmioty = Object.entries(k.stat).map(([slug, s]) => {
    const soleShare = s.soleCount / k.wystapienia;
    let rola = 'pomocniczy';
    if (soleShare >= 0.5) rola = 'rdzen';
    else if (s.maxWaga >= 1.5) rola = 'kluczowy';
    return { slug, nazwa: PRZEDMIOT_NAZWA[slug] ?? slug, maxWaga: s.maxWaga,
      soleShare: Math.round(soleShare * 100), rola };
  }).sort((a, b) => b.soleShare - a.soleShare || b.maxWaga - a.maxWaga);
  return {
    slug: k.slug,
    name: k.name,
    kategoria: k.kategoria,
    liczbaUczelni: k.wystapienia,
    rdzen: przedmioty.filter((p) => p.rola === 'rdzen').map(({ slug, nazwa, maxWaga }) => ({ slug, nazwa, maxWaga })),
    kluczowe: przedmioty.filter((p) => p.rola === 'kluczowy').map(({ slug, nazwa, maxWaga }) => ({ slug, nazwa, maxWaga })),
    pomocnicze: przedmioty.filter((p) => p.rola === 'pomocniczy').map(({ slug, nazwa }) => ({ slug, nazwa })),
    uczelnie: k.uczelnie,
  };
}).sort((a, b) => a.kategoria.localeCompare(b.kategoria) || a.name.localeCompare(b.name));

writeFileSync(join(OUT, 'kierunki.json'), JSON.stringify(kierunki, null, 2), 'utf8');

console.log(`Kierunków (generycznych): ${kierunki.length} z ${entries.length} wpisów uczelnianych\n`);
console.log('kierunek                        rdzeń                    kluczowe');
for (const k of kierunki) {
  console.log(
    k.name.padEnd(31),
    (k.rdzen.map((p) => p.nazwa).join(', ') || '—').padEnd(24),
    ' ' + k.kluczowe.map((p) => p.nazwa).join(', ')
  );
}
