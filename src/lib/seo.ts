/**
 * Budowanie tytułów mieszczących się w SERP-ie.
 *
 * Powód: audyt 2026-09-04 pokazał, że 136 ze 136 tytułów serwisu przekraczało
 * 65 znaków (rozkład 68–130). Google ucina ok. 580 px, czyli mniej więcej
 * 55–60 znaków — w efekcie z tytułu „Chemizm życia: budowa związków organicznych
 * i biochemia — zadania z matur rozszerzonych CKE | Biologia" widoczna była sama
 * nazwa działu, a cały człon transakcyjny nie pokazywał się nigdy.
 * GSC potwierdził skutek: 7 stron w TOP 20 z zerowym CTR, w tym
 * /geografia/wymagania/ na pozycji 6,6 przy 39 wyświetleniach.
 *
 * Stąd limit wymuszony w kodzie, a nie pilnowany przy pisaniu każdej strony.
 */
export const TITLE_MAX = 65;

/**
 * Skleja tytuł z części ułożonych wg ważności. Pierwsza jest obowiązkowa,
 * każda kolejna dokleja się tylko wtedy, gdy całość nadal mieści się w limicie.
 * Gdy któraś się nie mieści, dalsze też są pomijane — części są w kolejności
 * czytania, więc dziura w środku byłaby gorsza niż krótszy tytuł.
 */
export function fitTitle(core: string, ...optional: string[]): string {
  let out = core.trim();
  for (const part of optional) {
    const candidate = `${out} ${part.trim()}`;
    if (candidate.length > TITLE_MAX) break;
    out = candidate;
  }
  return out;
}

/**
 * Skraca długą nazwę działu do członu przed dwukropkiem.
 * 87 z 91 nazw ma format „Krótka nazwa: rozwinięcie", więc to daje sensowną
 * formę skróconą. Pełna nazwa zostaje w <h1> — nic nie ginie semantycznie.
 */
export function krotkaNazwaDzialu(nazwa: string): string {
  return nazwa.split(":")[0].trim();
}

/**
 * Przycina meta description do limitu SERP-a, ucinając na granicy słowa.
 * Audyt: 99 ze 138 opisów przekraczało 160 znaków (do 232).
 */
export const DESC_MAX = 158;

export function fitDescription(text: string): string {
  const t = text.trim();
  if (t.length <= DESC_MAX) return t;
  return t.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "") + "…";
}
