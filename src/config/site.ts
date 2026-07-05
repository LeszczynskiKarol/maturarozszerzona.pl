export const SITE = {
  url: "https://www.maturarozszerzona.pl",
  name: "MaturaRozszerzona.pl",
  tagline: "Zadania, wymagania i strategia — matura na poziomie rozszerzonym",
  description:
    "Zadania z matur rozszerzonych CKE pogrupowane tematycznie, wymagania egzaminacyjne i strategie przygotowania. Wszystko o maturze na poziomie rozszerzonym.",
};

// Konfiguracja funkcji i danych prawnych (analytics, cookie banner, polityka prywatności).
export const siteConfig = {
  features: {
    // GA4 measurement ID — steruje Analytics.astro + CookieConsent.astro (Consent Mode v2).
    // null = brak analityki i brak bannera. Property: properties/544282663.
    ga4: "G-BZG0CGX5BJ" as string | null,
  },
  legal: {
    operator: "Karol Leszczyński",
    email: "karolleszczynskikorektor@gmail.com",
    updated: "5 lipca 2026",
  },
};

// Ekosystem — cele linkowania (money site = matury-online.pl)
export const ECOSYSTEM = {
  app: "https://www.matury-online.pl",           // MONEY: apka do ćwiczeń
  arkusze: "https://www.matura-online.pl",       // satelita: pełne arkusze + karty zadań
  kalkulator: "https://www.maturalnie.pl/kalkulator-punktow/", // narzędzia rekrutacyjne
};

// Mapowanie sluga przedmiotu z danych rekrutacyjnych (maturalnie.pl) → nasz slug działów zadań.
// null = nie mamy jeszcze bazy zadań dla tego przedmiotu (polski, niemiecki).
export const PRZEDMIOT_ZADANIA: Record<string, string | null> = {
  matematyka: "matematyka",
  biologia: "biologia",
  chemia: "chemia",
  fizyka: "fizyka",
  geografia: "geografia",
  historia: "historia",
  wos: "wos",
  informatyka: "informatyka",
  angielski: "jezyk-angielski",
  polski: null,
  niemiecki: null,
};

export interface SubjectMeta {
  slug: string;
  name: string;        // "Matematyka"
  dopelniacz: string;  // "matematyki" — "zadania z matury z matematyki"
  appUrl: string;      // deep link CTA do apki
}

export const SUBJECTS: Record<string, SubjectMeta> = {
  matematyka: {
    slug: "matematyka",
    name: "Matematyka",
    dopelniacz: "matematyki",
    appUrl: "https://www.matury-online.pl/matematyka",
  },
  chemia: {
    slug: "chemia",
    name: "Chemia",
    dopelniacz: "chemii",
    appUrl: "https://www.matury-online.pl/chemia",
  },
  biologia: {
    slug: "biologia",
    name: "Biologia",
    dopelniacz: "biologii",
    appUrl: "https://www.matury-online.pl/biologia",
  },
  fizyka: {
    slug: "fizyka",
    name: "Fizyka",
    dopelniacz: "fizyki",
    appUrl: "https://www.matury-online.pl/fizyka",
  },
  geografia: {
    slug: "geografia",
    name: "Geografia",
    dopelniacz: "geografii",
    appUrl: "https://www.matury-online.pl/geografia",
  },
  historia: {
    slug: "historia",
    name: "Historia",
    dopelniacz: "historii",
    appUrl: "https://www.matury-online.pl/historia",
  },
  wos: {
    slug: "wos",
    name: "WOS",
    dopelniacz: "wiedzy o społeczeństwie",
    appUrl: "https://www.matury-online.pl/wos",
  },
  informatyka: {
    slug: "informatyka",
    name: "Informatyka",
    dopelniacz: "informatyki",
    appUrl: "https://www.matury-online.pl/informatyka",
  },
  "jezyk-angielski": {
    slug: "jezyk-angielski",
    name: "Język angielski",
    dopelniacz: "języka angielskiego",
    appUrl: "https://www.matury-online.pl/jezyk-angielski",
  },
};
