// Generuje brand-assety w public/ z inline SVG → sharp.
//   node scripts/generate-assets.mjs
// Outputy: favicon-32.png, apple-touch-icon.png, og-image.jpg (favicon.svg musi już istnieć).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const BRAND = {
  accent: "#4f46e5",
  accentDark: "#4338ca",
  accentDeep: "#312e81",
  textOnDark: "#ffffff",
  textOnDarkMuted: "#c7d2fe",
  siteName: "maturarozszerzona.pl",
  shortName: "R",
  ogHeadline: "Matura rozszerzona",
  ogSubline: "Zadania CKE, wymagania i strategia",
  ogChips: ["zadania", "wymagania", "wybór rozszerzeń"],
  tagline: "ZADANIA · WYMAGANIA · STRATEGIA",
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = resolve(ROOT, "public");

let faviconSvg;
try { faviconSvg = readFileSync(resolve(PUBLIC, "favicon.svg")); }
catch { console.error("✗ Brak public/favicon.svg"); process.exit(1); }

await sharp(faviconSvg, { density: 720 }).resize(180, 180).png({ compressionLevel: 9 }).toFile(resolve(PUBLIC, "apple-touch-icon.png"));
console.log("✓ public/apple-touch-icon.png");
await sharp(faviconSvg, { density: 720 }).resize(32, 32).png({ compressionLevel: 9 }).toFile(resolve(PUBLIC, "favicon-32.png"));
console.log("✓ public/favicon-32.png");

const ogChipsSvg = (() => {
  let x = 96; const parts = [];
  BRAND.ogChips.forEach((chip, i) => {
    if (i > 0) { parts.push(`<text x="${x}" y="540">·</text>`); x += 22; }
    parts.push(`<text x="${x}" y="540">${chip}</text>`);
    x += chip.length * 11 + 22;
  });
  return parts.join("");
})();

const ogSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.accentDeep}"/>
      <stop offset="60%" stop-color="${BRAND.accent}"/>
      <stop offset="100%" stop-color="${BRAND.accentDark}"/>
    </linearGradient>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#e0e7ff" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g fill="${BRAND.textOnDark}" fill-opacity="0.05">
    <circle cx="200" cy="120" r="3"/><circle cx="980" cy="80" r="2"/><circle cx="1100" cy="500" r="4"/><circle cx="120" cy="540" r="3"/><circle cx="900" cy="280" r="2"/>
  </g>
  <g transform="translate(96, 96)">
    <rect width="96" height="96" rx="22" ry="22" fill="url(#badge)"/>
    <text x="48" y="69" text-anchor="middle" font-family="Georgia, serif" font-size="60" font-weight="600" fill="${BRAND.accentDeep}">${BRAND.shortName}</text>
  </g>
  <text x="220" y="142" font-family="Inter, 'Segoe UI', sans-serif" font-size="34" font-weight="600" fill="${BRAND.textOnDark}">${BRAND.siteName}</text>
  <text x="220" y="174" font-family="Inter, 'Segoe UI', sans-serif" font-size="15" font-weight="500" fill="${BRAND.textOnDarkMuted}" letter-spacing="2">${BRAND.tagline}</text>
  <text x="96" y="340" font-family="Georgia, serif" font-size="68" font-weight="500" fill="${BRAND.textOnDark}">${BRAND.ogHeadline}</text>
  <text x="96" y="420" font-family="Georgia, serif" font-size="40" font-weight="500" fill="${BRAND.textOnDarkMuted}">${BRAND.ogSubline}</text>
  <g font-family="Inter, sans-serif" font-size="20" font-weight="500" fill="#dbeafe">${ogChipsSvg}</g>
</svg>`);

await sharp(ogSvg).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(resolve(PUBLIC, "og-image.jpg"));
console.log("✓ public/og-image.jpg");
