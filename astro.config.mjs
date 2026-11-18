import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";

// Blog posts carry their own date in the sitemap; every other page gets the build date.
const postDates = Object.fromEntries(
  fs.readdirSync("./src/content/blog").filter((f) => f.endsWith(".md")).map((f) => {
    const src = fs.readFileSync(`./src/content/blog/${f}`, "utf8");
    const m = src.match(/^updated:\s*(\S+)/m) || src.match(/^pubDate:\s*(\S+)/m);
    return [`https://mufasil.site/blog/${f.replace(/\.md$/, "")}/`, m ? new Date(m[1]).toISOString() : undefined];
  }),
);
const built = new Date().toISOString();

export default defineConfig({
  site: "https://mufasil.site",
  trailingSlash: "always",
  build: { format: "directory" },
  compressHTML: true,
  markdown: { syntaxHighlight: false },
  integrations: [sitemap({ filter: (page) => !page.includes("/404"), serialize: (item) => ({ ...item, lastmod: postDates[item.url] ?? built }) })],
});
