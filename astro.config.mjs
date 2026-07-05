import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://www.maturarozszerzona.pl";

export default defineConfig({
  site: SITE,
  output: "static",

  integrations: [
    sitemap({
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.7,
      // Wyklucz strony noindex (polityka prywatności) — inaczej miękkie ostrzeżenie w GSC.
      filter: (page) => !page.includes("/polityka-prywatnosci"),
      serialize(item) {
        if (item.url === `${SITE}/`) {
          item.priority = 1.0;
          item.changefreq = "weekly";
        }
        if (item.url.includes("/zadania/")) {
          item.priority = 0.9;
        }
        return item;
      },
    }),
  ],

  build: {
    assets: "_assets",
    inlineStylesheets: "always",
  },

  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: true },
  },
});
