// Writes a fully rendered HTML file per page into dist/, so crawlers get each
// page's content, title and canonical URL without running JavaScript.
// Each page goes in its own folder (founder/index.html) so Azure Static Web
// Apps serves it at /founder with no .html in the address. Old /founder.html
// style links are redirected in public/staticwebapp.config.json; keep the
// page list there and in src/seo.ts in sync with this one.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const pages = {
  "/": "index.html",
  "/founder": "founder/index.html",
  "/contact": "contact/index.html",
  // Any path not listed in src/seo.ts renders the not-found page; Azure
  // serves this file for every 404 (responseOverrides in staticwebapp.config.json).
  "/404": "404.html",
};

const { render } = await import("../dist-ssr/entry-server.js");
const template = await readFile("dist/index.html", "utf8");
if (!template.includes("<!--app-head-->") || !template.includes("<!--app-html-->")) {
  throw new Error("dist/index.html is missing the <!--app-head--> or <!--app-html--> placeholder");
}

for (const [path, file] of Object.entries(pages)) {
  const { head, html } = render(path);
  const out = template
    .replace("<!--app-head-->", () => head)
    .replace("<!--app-html-->", () => html);
  await mkdir(dirname(`dist/${file}`), { recursive: true });
  await writeFile(`dist/${file}`, out);
  console.log(`prerendered ${path} -> dist/${file}`);
}

await rm("dist-ssr", { recursive: true, force: true });
