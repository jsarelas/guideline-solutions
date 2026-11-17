// Build-time entry: renders a page to HTML for scripts/prerender.mjs.
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { renderHeadTags } from "./seo";

export function render(path: string): { head: string; html: string } {
  return {
    head: renderHeadTags(path),
    html: renderToString(
      <StrictMode>
        <App path={path} />
      </StrictMode>,
    ),
  };
}
