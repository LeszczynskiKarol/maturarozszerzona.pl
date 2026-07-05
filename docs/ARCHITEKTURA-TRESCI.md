# maturarozszerzona.pl — wstępna architektura treści

> Status: DRAFT v0.2 (2026-07-05) — po skanie zasobów dysku
> Rola w ekosystemie: **satelita contentowy pozycjonujący matury-online.pl** (money site / apka).
> Intencja docelowa: „jak napisać maturę rozszerzoną jak najlepiej" — egzamin sam w sobie,
> NIE rekrutacja (maturalnie.pl), NIE próg zdawalności (maturapodstawowa.pl),
> NIE pojedyncze arkusze/zadania (matura-online.pl — patrz niżej!).

## 0. Zinwentaryzowane zasoby (skan 2026-07-05)

| Zasób | Ścieżka | Skala | Użycie dla maturarozszerzona.pl |
|---|---|---|---|
| Arkusze PDF CKE (kanoniczne) | `D:\matury-online.pl\arkusze\<przedmiot>\<rok>\<sesja-poziom>\` | 110 PDF, 2023–2026, 10 przedmiotów | źródło danych; PDF-y hostować z S3 (już tam są) |
| PDF-y na S3 | `s3.eu-north-1.amazonaws.com/piszemy.com.pl/arkusze-maturalne/` | j.w. | linkować, nie duplikować |
| Podglądy stron arkuszy | `D:\matura-online.pl\public\arkusze\` | 2192 webp | reużycie w agregacjach |
| **Bank zadań MDX** | `D:\matura-online.pl\src\content\zadania\` | **821 zadań (580 PR / 241 PP)**, frontmatter: arkusz, subject, nr, punkty, typ, **topic**, difficulty, tresc, odpowiedz, pulapka | **GŁÓWNE źródło danych** — zadania już otagowane tematami |
| Metadane arkuszy MDX | `D:\matura-online.pl\src\content\arkusze\` | 44 md (symbol CKE, czas, punkty, linki S3) | reużycie |
| Bank zadań w DB (apka) | `D:\matury-online.pl\backend\prisma\schema.prisma` — modele `Exam`, `Question`, `Answer` | dziesiątki seedów | cel deep-linków CTA |
| Opracowania polski (JSON) | `D:\maturapolski-static\src\content\` | 246 baza-wiedzy + 77 pytania jawne + 35 konteksty + epoki | klaster polski PR |
| Streszczenia lektur | `D:\claude-streszczenia\lektury\` | 44 lektury (md/json) | raczej dla maturapodstawowa.pl (PP) |
| Generatory | `D:\claude-egzaminy\`, `D:\claude-opracowania\` | blueprinty, pipeline | produkcja nowych treści |

**Rozkład zadań PR per przedmiot** (bank MDX): matematyka 164*, język polski/angielski ~148, wos 144,
geografia 89, chemia 88, historia 76, biologia 58, fizyka 34, informatyka 20 (*łącznie PP+PR).

## 1. KLUCZOWA korekta: podział ról vs matura-online.pl

Skan ujawnił, że **matura-online.pl (statyczny satelita) już robi**: strony pojedynczych arkuszy
(44) i pojedynczych zadań (821). Gdyby maturarozszerzona.pl robiła to samo, dwa nasze satelity
biłyby się o te same SERP-y. Dlatego **finalny podział granularności**:

| Serwis | Granularność | Przykładowe SERP-y |
|---|---|---|
| **matura-online.pl** | pojedynczy arkusz, pojedyncze zadanie | „matura matematyka 2024 maj zadanie 1", „arkusz biologia 2023 pr" |
| **maturarozszerzona.pl** | **agregacje tematyczne PR** + wymagania + strategia | „zadania z pochodnych matura rozszerzona", „dowody geometryczne matura", „czy pochodne są na rozszerzeniu", „co wybrać na rozszerzenie" |
| **maturapodstawowa.pl** | agregacje PP + „minimum do zdania" + symulator 30% | „ile trzeba mieć żeby zdać", „zadania które zawsze są na maturze" |
| maturalnie.pl | narzędzia rekrutacyjne | „kalkulator punktów na studia", „progi punktowe" |
| **matury-online.pl** | MONEY — apka do ćwiczeń | cel wszystkich CTA |

Zasada antyduplikacyjna: maturarozszerzona.pl **nie renderuje strony per zadanie ani per arkusz**.
Zadania pokazuje wyłącznie w widokach zbiorczych (dział/temat), z własnym dodatkiem redakcyjnym
(rozwiązanie krok po kroku / wskazówka / strategia), a do pełnej karty zadania i arkusza linkuje
do matura-online.pl. Treść zadania (cytat CKE) powtarza się w sieci wszędzie — różnicuje nas
warstwa dodana i inna granularność strony.

## 2. Struktura URL

```
/                                    # hub PR: nawigacja po przedmiotach + „czym jest rozszerzenie"
/{przedmiot}/                        # hub przedmiotu PR
/{przedmiot}/zadania/{dzial}/        # P0: agregacja — wszystkie zadania PR z działu 2023-2026
                                     #   (+ starsze roczniki w miarę rozbudowy banku)
/{przedmiot}/wymagania/              # P1: „co jest a czego nie ma" — FAQ pod snippety
/{przedmiot}/statystyki/             # P2: średnie CKE, zdawalność, centyle, „czy trudny"
/{przedmiot}/jak-sie-przygotowac/    # P2: strategia, rozkład powtórek, karta wzorów
/wybor-rozszerzen/                   # P1: klaster deklaracji (IX-X, luty)
/wybor-rozszerzen/{kierunek}/        #   „jakie rozszerzenia na medycynę" → kalkulator maturalnie.pl
/terminy/                            # harmonogram CKE
/blog/                               # sezonowe: opinie w dniu egzaminu, „kiedy wyniki"
```

## 3. Klastry treści (priorytety)

### P0 — agregacje tematyczne zadań PR
- Źródło: frontmatter `topic` z 580 zadań PR w `matura-online.pl\src\content\zadania\`.
  Krok wstępny: normalizacja topiców do słownika działów (topic → dzial, np.
  „funkcja wykładnicza, model praktyczny" → `funkcje-wykladnicze-i-logarytmy`).
- Szablon strony działu: intro (czego CKE wymaga w tym dziale) → lista zadań (treść + rok/sesja
  + punkty + rozwiązanie/wskazówka — pole `pulapka` to gotowe „na czym wpadają uczniowie"!)
  → CTA „przećwicz ten dział w apce" → matury-online.pl.
- Start: matematyka (164 zadania, najlepsze pokrycie + potwierdzone GSC: dowody, pochodne),
  potem chemia (88), geografia (89), biologia (58).
- Dane GSC potwierdzają popyt: „dowody geometryczne matura rozszerzona" (pos 10 bez dedykowanej
  strony!), „dowody algebraiczne", „czy pochodne są na maturze rozszerzonej".

### P1a — wymagania per przedmiot
- Źródło: informatory CKE (są w `matury-online.pl\arkusze\` dla 2025) + `claude-opracowania\sources\informatory.json`.
- Format: strona przedmiotu z sekcjami FAQ („Czy X jest na maturze rozszerzonej z Y?"),
  schema FAQPage.

### P1b — wybór rozszerzeń
- „Co wybrać na rozszerzenie pod [kierunek]" — wymagane przedmioty + link do kalkulatora
  maturalnie.pl (bez duplikowania progów).
- Sezon: publikacja do końca sierpnia (deklaracje wstępne 30.09).

### P2 — statystyki i strategia
- Dane CKE (sprawozdania roczne): średnia, mediana, rozkład wyników per przedmiot PR.
- „Czy [przedmiot] rozszerzony jest trudny" — odpowiedź liczbami.
- „Jak się przygotować do [przedmiot] PR w rok / pół roku" — plan powtórek → CTA apka.

### P3 — blog sezonowy (dzień egzaminu)
- Opinie/komentarze po każdym egzaminie PR + odpowiedzi nieoficjalne — publikacja tego samego
  popołudnia. UWAGA: strony *arkusza* są na matura-online.pl — tu tylko wpis blogowy
  „opinie/jak poszło" linkujący do arkusza tam i do działów u nas.
- GSC: „matura rozszerzona matematyka opinie 2026", „chemia rozszerzona matura 2026 opinie".

## 4. Kalendarz sezonowy

| Miesiąc | Akcja |
|---|---|
| VII–VIII (TERAZ) | budowa P0 matematyka + P1b wybór rozszerzeń (deklaracje 30.09!) |
| IX–X | pełny klaster wyboru rozszerzeń live; P0 kolejne przedmioty |
| XII–II | P2 strategia/plany powtórek; 07.02 deklaracje ostateczne |
| III–IV | terminy, karty wzorów, niezbędniki |
| V | blog: opinie w dniu każdego egzaminu PR |
| VI–VII | „kiedy wyniki", statystyki po wynikach → kalkulator maturalnie.pl |
| VIII–IX | nowy rocznik arkuszy do banku zadań (pipeline `tmp-arkusze`/`claude-egzaminy`) |

## 5. Architektura techniczna

- **Astro 5 static** (spójnie z matura-online.pl i maturalnie.pl — można skopiować konfigurację
  i komponenty KaTeX/mhchem z matura-online.pl).
- Dane zadań: content collection **współdzielona z matura-online.pl** — wariant A: git submodule /
  pakiet npm z MDX-ami; wariant B: skrypt build-time kopiujący `src\content\zadania` + własna
  warstwa `dzialy.json` (mapowanie topic→dział) i `rozwiazania\` (nasz dodatek redakcyjny).
  Rekomendacja: **wariant B** — luźne sprzężenie, każdy serwis deployuje się niezależnie.
- Hosting: statycznie jak maturalnie.pl (S3/CloudFront) albo na serwerze `matury` za nginx —
  do decyzji przy wdrożeniu.
- Schema.org: FAQPage (wymagania), BreadcrumbList, ItemList (strony działów).
- Google Indexing API po każdym deploy'u sezonowym (SA ma włączone `indexing`).
- Sitemapy per klaster (zadania / wymagania / wybór-rozszerzeń / blog).

## 6. Linkowanie w ekosystemie

- Każda strona działu → **matury-online.pl** (deep link do modułu ćwiczeń przedmiotu) — główny cel.
- Karta zadania / pełny arkusz → matura-online.pl (różnicowanie granularności, nie konkurencja).
- Wyniki/rekrutacja → maturalnie.pl (kalkulator, progi).
- Polski PR (lektury, pytania jawne) → maturapolski-static / maturapolski.pl.
- Start domeny: 3–5 linków kontekstowych z blogów matury-online.pl i maturapolski.pl
  (nowa domena bez historii potrzebuje dowiązania autorytetu).

## 6b. Stan wdrożenia (2026-07-05)

MVP P0 zbudowany i działa (`npm run build` → 101 stron statycznych, Astro 5 static).

- Pipeline `npm run sync` = extract-topics → map-dzialy (per-tag matching, **577/577 zadań PR
  zmapowanych, 0 sierot**) → sync-zadania (frontmatter, bez body — anty-duplikacja).
- 9 przedmiotów, 81 działów, słowniki w `data/dzialy/*.json` (budowane fan-outem agentów,
  każdy zweryfikowany do 100% pokrycia tagów):

  | przedmiot | działów | zadań PR |
  |---|---|---|
  | wos | 12 | 144 |
  | geografia | 12 | 89 |
  | chemia | 12 | 88 |
  | historia | 11 | 76 |
  | biologia | 12 | 58 |
  | matematyka | 10 | 38 |
  | fizyka | 12 | 34 |
  | jezyk-angielski | 4 | 30 |
  | informatyka | 6 | 20 |

- Strony: `/`, `/{przedmiot}/zadania/`, `/{przedmiot}/zadania/{dzial}/` (KaTeX + mhchem z
  render-math.ts skopiowanego z matura-online.pl, `<details>` z odpowiedzią, blok pułapki,
  link do pełnego rozwiązania na matura-online.pl, CTA do apki matury-online.pl, schema
  BreadcrumbList + ItemList, sitemap, robots.txt).
- **Cienkie strony do dosypania** (≤2 zadania): fizyka/relatywistyka (1), fizyka/atomowa (1),
  matematyka/dowody (1 — a najlepszy popyt w GSC!), informatyka/1 dział. Do bulk-upu z pipeline
  `claude-egzaminy` + arkusze 2015–2022 (bank ma na razie głównie 2023–2026).

### Klaster P1b „wybór rozszerzeń" — ZBUDOWANY (2026-07-05)

- Źródło danych: **reużyte z maturalnie.pl** (`src/data/kierunki.ts`) przez `scripts/extract-kierunki.mjs`
  — parsuje grupy `oneOf`, agreguje 29 wpisów uczelnianych → **15 generycznych kierunków**.
  Klasyfikacja per przedmiot: **rdzeń** (obowiązkowy — jedyna opcja w grupie na ≥50% uczelni),
  **kluczowy** (alternatywa waga ≥1.5), **pomocniczy**. NIE kopiujemy progów/wzorów punktowych —
  to zostaje na maturalnie.pl (link do kalkulatora).
- Warstwa doradcza: `src/data/kierunki-notes.json` (kuratorska — rekomendacja / trudność /
  typowy błąd per kierunek; pod GSC „czy X rozszerzona trudna", „co wybrać na rozszerzenie").
- Strony: `/wybor-rozszerzen/` (hub wg kategorii) + `/wybor-rozszerzen/{kierunek}/` (15 stron:
  rdzeń/kluczowe/pomocnicze z deep-linkami do naszych działów zadań, FAQPage schema,
  CTA → kalkulator maturalnie.pl, linki rekrutacji uczelni z rel=nofollow).
- Build: **117 stron** łącznie.

### Huby przedmiotów + wymagania — ZBUDOWANE (2026-07-05)

- Treść faktograficzna: 9 plików `src/data/subjects/*.json` (generowane fan-outem 9 agentów wg
  `docs/SCHEMAT-PRZEDMIOTU.md`, zasada „bez zmyślonych liczb"). Każdy: intro, format arkusza,
  trudność, 8–12 pytań FAQ „co jest na rozszerzeniu", 4–6 wskazówek strategii, coWarto.
- Strony: `/{przedmiot}/` (hub — keystone landing pod „[przedmiot] rozszerzona") + `/{przedmiot}/wymagania/`
  (FAQPage schema, linki z pytań do działów zadań). 9 + 9 = 18 stron.

### Zadania treningowe (dosyp cienkich działów) — ZBUDOWANE (2026-07-05)

- **40 zadań treningowych** w `src/data/zadania-treningowe/*.json` (w stylu maturalnym, NIE z CKE):
  matematyka/dowody (5), fizyka (20: relatywistyka/jądrowa/atomowa/magnetyzm/termodynamika),
  chemia/polimery (5), informatyka/sieci (5), angielski/wypowiedź (5).
  Generowane wg `docs/SCHEMAT-ZADANIA-TRENINGOWE.md`, każde z pełnym rozwiązaniem.
- Renderowane w OSOBNEJ, oznaczonej sekcji na stronie działu (fioletowy badge „Zadanie treningowe",
  przerywana ramka) — nie mieszają się z prawdziwymi CKE. Uczciwy rozdział.
- **Weryfikacja**: matematyka (dowody) i fizyka (liczbowe) przechodzą niezależną kontrolę
  osobnym agentem-recenzentem (rozwiązanie od zera, werdykt per zadanie).
- Build: **135 stron** łącznie.

### Cały serwis — mapa URL (stan 2026-07-05)

```
/                                    hub główny (9 przedmiotów)
/{przedmiot}/                        hub przedmiotu (9)
/{przedmiot}/wymagania/              FAQ „co jest na rozszerzeniu" (9)
/{przedmiot}/zadania/                indeks działów (9)
/{przedmiot}/zadania/{dzial}/        zadania CKE + treningowe (81)
/wybor-rozszerzen/                   hub kierunków
/wybor-rozszerzen/{kierunek}/        poradnik wyboru (15)
/terminy/                            harmonogram CKE (daty PR, deklaracje)
/404                                 strona błędu
```

### Terminy + polish strony głównej + QA — ZBUDOWANE (2026-07-05)

- `/terminy/` — harmonogram matury PR (dane reużyte z maturalnie.pl `daty-matur.ts` przez
  `scripts/extract-terminy.mjs`; sesja 2027 oznaczona jako SZACUNKOWA z disclaimerem, deklaracje
  30.09 / 07.02). Hub przedmiotu pokazuje datę egzaminu PR z linkiem do harmonogramu.
- Strona główna przeprojektowana: hero ze statystykami + CTA (wybór rozszerzeń, terminy) +
  karty przedmiotów (hub / zadania / wymagania) + pełna lista działów.
- 404, WebSite schema, `robots.txt`, sitemap.
- **QA**: `scripts/check-links.mjs` — 2478 linków wewnętrznych, **0 zepsutych**.
- Build: **137 stron**.

### Pełny pipeline danych (`npm run sync`)

```
extract-topics  → map-dzialy → sync-zadania   (zadania CKE → działy)
extract-kierunki                                (wybór rozszerzeń z maturalnie.pl)
extract-terminy 2026-07-05                       (harmonogram z maturalnie.pl)
```
Zadania treningowe (`src/data/zadania-treningowe/`) i treść przedmiotów (`src/data/subjects/`)
są utrzymywane osobno (generowane/kuratorskie), nie nadpisywane przez sync.

### DEPLOY — ZROBIONY (2026-07-05)

Live: **https://www.maturarozszerzona.pl** (S3 + CloudFront, wzorzec claude-astro-generator).
Szczegóły infrastruktury i pozostałe ręczne TODO: `LAUNCH-REPORT.md`.

- Route53 + NS handover z Aftermarket, ACM cert (us-east-1), 2× S3, 2× CloudFront (www + naked 301),
  security headers, GitHub Actions OIDC deploy on push.
- Dodane: OG image, favicon, cookie banner + Consent Mode v2, GA4 (`G-BZG0CGX5BJ`),
  polityka prywatności.
- Pozostałe ręczne (patrz LAUNCH-REPORT): PSI manual, GSC sitemap submit (≥24h po NS),
  wpis do seo_panel, linki startowe.

## 7. Decyzje podjęte / otwarte

- [x] Arkusze PDF: są lokalnie (110) + na S3 — linkujemy S3, nie duplikujemy stron arkuszy.
- [x] Model zadań: reużywamy MDX-y matura-online.pl (821 zadań z topic/difficulty/pulapka).
- [x] Anty-kanibalizacja: maturarozszerzona.pl = tylko agregacje + wymagania + strategia.
- [ ] Normalizacja `topic` → słownik działów (do zrobienia skryptem, ~1 dzień).
- [ ] Rozwiązania krok po kroku: generować pipeline'em (claude-opracowania jako wzór)?
- [ ] Kolejność przedmiotów fali 2: chemia vs geografia vs biologia — sprawdzić wolumeny GSC/GA.
- [ ] Hosting: S3/CloudFront (jak maturalnie.pl) czy VPS `matury`?
