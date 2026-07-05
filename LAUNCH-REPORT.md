# LAUNCH REPORT — maturarozszerzona.pl

Data: 5 lipca 2026. Deploy: statyczny Astro 5 → S3 + CloudFront (wzorzec claude-astro-generator).

## ✅ Live i zweryfikowane

- **https://www.maturarozszerzona.pl** → 200 (strona główna + wszystkie podstrony)
- **https://maturarozszerzona.pl** → 301 → www
- **http://** → 301 → https (na obu)
- Nagłówki bezpieczeństwa: HSTS (max-age=31536000), X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- `sitemap-index.xml` → 200 (136 URL-i, bez polityki prywatności)
- Strony głębokie (np. `/matematyka/zadania/dowody/`) → 200
- Consent Mode v2 literalny w HTML (nie template-literal — krytyczny bug uniknięty)
- `_commit.txt` obecny (deploy przez GitHub Actions)
- 138 stron, 0 zepsutych linków wewnętrznych (2478 sprawdzonych)

## Infrastruktura

| Zasób | Wartość |
|---|---|
| Route53 hosted zone | `Z07641001UBDIL3XMBACP` |
| ACM cert (us-east-1) | `...certificate/c5be1d9d-22d1-4932-b252-2c5cd77206bc` (ISSUED) |
| S3 www bucket | `www.maturarozszerzona.pl` (website hosting) |
| S3 naked bucket | `maturarozszerzona.pl` (301 redirect) |
| CloudFront www | `E1IX5HNVQSH1R0` → d5q7tfk8zb14a.cloudfront.net |
| CloudFront naked | `E3UQ7V2SYXCX8D` → d1t166u904ioux.cloudfront.net |
| GitHub repo | github.com/LeszczynskiKarol/maturarozszerzona.pl (public) |
| IAM deploy role | `gh-deploy-maturarozszerzona.pl` (OIDC, tylko branch main) |
| GitHub Actions | zielone (OIDC deploy on push) ✓ |
| GA4 property | `properties/544282663`, measurement ID `G-BZG0CGX5BJ` |

## Uzupełnione braki (wskazane przez Karola)

- ✅ OG image (`/og-image.jpg`, 1200×630, 27 KB) + og/twitter meta na każdej stronie
- ✅ Favicon (svg + 32px png + apple-touch-icon)
- ✅ Cookie banner (RODO) + Google Consent Mode v2 (denied domyślnie, PL/EU override)
- ✅ GA4 analytics (gtag async, anonymize_ip)
- ✅ Polityka prywatności (`/polityka-prywatnosci/`, noindex, wykluczona z sitemap)

## 🔔 PAMIĘTAJ — do ogarnięcia ręcznie

- [ ] **PageSpeed Insights** — nie zweryfikowany automatycznie (brak `PAGESPEED_API_KEY` w
  `D:\seo-panel\backend\.env` → anonimowe API zwróciło 429). Sprawdź ręcznie:
  https://pagespeed.web.dev/analysis?url=https://www.maturarozszerzona.pl/ (oczekiwane ≥90/≥95 —
  lekki statyk, CSS inline, brak JS frameworka).
- [ ] **Google Search Console** — dodaj property `sc-domain:maturarozszerzona.pl` i zsubmituj
  `https://www.maturarozszerzona.pl/sitemap-index.xml`. UWAGA: rób to **≥24h po zmianie NS**
  (zmienione dziś ~23:30) — inaczej GSC może zcache'ować 403 ze starego parkingu. Aby submit
  przez SA zadziałał, dodaj `google-index-api@ageless-period-491209-s8.iam.gserviceaccount.com`
  jako Owner w GSC property (raz).
- [ ] **seo_panel** — opcjonalnie dopisać domenę do prod `seo_panel.Domain` + DomainIntegration
  GOOGLE_ANALYTICS (`properties/544282663`), żeby weszła do monitoringu.
- [ ] **GA4 ↔ GSC link** — po dodaniu GSC połącz ręcznie w GA4 Admin → Product links →
  Search Console links (API nie istnieje).
- [ ] **Linki startowe** — 3–5 kontekstowych linków z matury-online.pl / maturapolski.pl do
  nowej domeny (dowiązanie autorytetu dla świeżej domeny).
