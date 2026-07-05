# Schemat pliku treści przedmiotu: src/data/subjects/<slug>.json

Plik faktograficzny renderowany na `/{przedmiot}/` (hub) i `/{przedmiot}/wymagania/`.
ZASADA NADRZĘDNA: nie zmyślać dokładnych liczb (progi, średnie CKE, procent zdawalności).
Jeśli podajesz liczbę, musi być powszechnie znanym faktem o egzaminie (np. czas trwania arkusza
PR = 180 min dla większości przedmiotów, próg zdawalności rozszerzenia NIE obowiązuje — rozszerzenia
nie trzeba „zdać", liczy się wynik procentowy). Gdy nie masz pewności co do liczby — pisz jakościowo
("jeden z najwyżej punktowanych", "wysoki poziom") zamiast wymyślać wartość.

```json
{
  "slug": "matematyka",
  "intro": "2-3 zdania: czym jest matura rozszerzona z tego przedmiotu, dla kogo (na jakie kierunki), czym różni się od podstawy.",
  "formatArkusza": "1-2 zdania o strukturze arkusza PR: czas (min), typy zadań (zamknięte/otwarte), ile punktów, czy jest karta wzorów/dane. Tylko fakty pewne.",
  "trudnosc": "Akapit jakościowy: jak trudny jest ten przedmiot na rozszerzeniu, co sprawia największą trudność maturzystom, dla kogo jest realny. BEZ zmyślonych procentów zdawalności.",
  "wymagania": [
    {
      "pytanie": "Czy pochodne są na maturze rozszerzonej z matematyki?",
      "odpowiedz": "2-4 zdania. Konkretna odpowiedź TAK/NIE + co dokładnie obowiązuje, a co nie. Pod featured snippet.",
      "dzial": "rachunek-rozniczkowy"
    }
  ],
  "strategia": [
    "Wskazówka przygotowawcza 1 (konkretna, actionable).",
    "Wskazówka 2.",
    "... 4-6 wskazówek"
  ],
  "coWarto": "1-2 zdania: dlaczego warto zdawać ten przedmiot rozszerzony (jakie kierunki otwiera) — z linkiem myślowym do wyboru rozszerzeń."
}
```

Wymagania: **8-12 pytań** typu „czy [temat] jest na maturze rozszerzonej z [przedmiot]" —
dobrane pod realne wątpliwości maturzystów (najlepiej zaczynające się od „Czy...", „Ile...",
„Jak..."). Pole `dzial` (opcjonalne) = slug działu z `data/dzialy/<subject>.json`, jeśli pytanie
dotyczy konkretnego działu (posłuży do linkowania do strony zadań tego działu).
