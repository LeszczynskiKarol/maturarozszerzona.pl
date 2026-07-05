# Schemat: src/data/zadania-treningowe/<subject>.json

Tablica zadań TRENINGOWYCH (w stylu matury rozszerzonej, NIE z arkuszy CKE). Renderowane na
stronie działu w osobnej, wyraźnie oznaczonej sekcji „Zadania treningowe". Każde MUSI mieć pełne,
poprawne rozwiązanie.

ZASADA NADRZĘDNA — POPRAWNOŚĆ: każde zadanie rozwiąż DWUKROTNIE, niezależnie. Jeśli wyniki się
różnią albo masz jakąkolwiek wątpliwość co do jednoznaczności treści lub poprawności odpowiedzi —
ODRZUĆ to zadanie i ułóż inne. Lepiej 3 pewne zadania niż 5 z błędem. Używaj standardowych,
jednoznacznych sformułowań w stylu CKE.

```json
[
  {
    "id": "trening-<subject>-<dzial>-1",
    "dzial": "<slug działu z data/dzialy/<subject>.json>",
    "topic": "krótki temat, np. 'dowód nierówności'",
    "punkty": 3,
    "typ": "dowod | otwarte-krotkie | otwarte-rozszerzone | zamkniete-abcd",
    "tresc": "Treść zadania. Markdown + KaTeX: inline $...$, blok $$...$$. Chemia: mhchem $\\ce{...}$.",
    "odpowiedz": "Zwięzła odpowiedź / teza (co wychodzi). Dla dowodu: 'Teza udowodniona (c.n.d.)'.",
    "rozwiazanie": "PEŁNE rozwiązanie krok po kroku (markdown + KaTeX). To jest kluczowe pole.",
    "pulapka": "(opcjonalne) typowy błąd, 1-2 zdania"
  }
]
```

WYMOGI:
- 3–5 zadań na KAŻDY dział wskazany w zadaniu (jeśli przedmiot ma kilka cienkich działów, plik
  zawiera zadania dla wszystkich — pole `dzial` rozróżnia).
- `id` unikalne, kebab-case.
- KaTeX: symbol mnożenia `\cdot`, ułamki `\frac{}{}`, potęgi `^{}`, indeksy `_{}`. NIE używaj
  znaku `$` w treści inaczej niż jako delimiter matematyki (żeby nie zepsuć renderowania).
- Cudzysłowy WEWNĄTRZ stringów JSON: pojedyncze `'...'` (nigdy podwójne `"`), inaczej JSON pęknie.
- Trudność i styl: poziom rozszerzony, realistyczny egzaminacyjnie.
- Waliduj plik: `node -e "JSON.parse(require('fs').readFileSync('<path>','utf8'))"` — musi przejść.
