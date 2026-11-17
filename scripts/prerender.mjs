// Writes a fully rendered HTML file per page into dist/, so crawlers get each
// page's content, title and canonical URL without running JavaScript.
// public/web.config maps the URLs to these files; keep the two in sync.
import { readFile, rm, writeFile } from "node:fs/promises";

const pages = {
  "/": "index.html",
  "/founder": "founder.html",
  "/contact": "contact.html",
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
  await writeFile(`dist/${file}`, out);
  console.log(`prerendered ${path} -> dist/${file}`);
}

await rm("dist-ssr", { recursive: true, force: true });
