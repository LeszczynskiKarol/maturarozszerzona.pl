# maturarozszerzona.pl

Statyczny serwis (Astro 5) o maturze na poziomie rozszerzonym: zadania z arkuszy CKE pogrupowane
tematycznie, wymagania egzaminacyjne, poradnik wyboru rozszerzeń i harmonogram. Satelita
pozycjonujący aplikację **matury-online.pl**.

## Rozwój

```bash
npm install
npm run sync     # regeneruje dane (zadania → działy, kierunki, terminy)
npm run dev      # podgląd na http://localhost:4321
npm run build    # build do dist/
```

## Dane

- `src/data/zadania/*.json` — zadania CKE (generowane przez `npm run sync` z banku matura-online.pl)
- `src/data/dzialy/*.json` — słowniki działów per przedmiot
- `src/data/zadania-treningowe/*.json` — dodatkowe zadania treningowe (utrzymywane ręcznie)
- `src/data/subjects/*.json` — treść hubów + wymagania (FAQ)
- `src/data/kierunki*.json` — dane do klastra „wybór rozszerzeń"
- `src/data/terminy.json` — harmonogram matury

## Deploy

Statyczny build na S3 + CloudFront. `./deploy.sh` (wymaga `.env.deploy` z `S3_BUCKET` i
`CLOUDFRONT_DIST_ID`) albo automatycznie przez GitHub Actions (push na `main`).

## Architektura treści

Zobacz `docs/ARCHITEKTURA-TRESCI.md`.
