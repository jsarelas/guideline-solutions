const siteUrl = "https://www.guidelinesolutions.com";
const defaultImage = `${siteUrl}/images/banner.jpg`;

const pages: Record<
  string,
  {
    title: string;
    description: string;
    path: string;
    type?: "home" | "founder" | "contact";
    index?: boolean;
  }
> = {
  "/": {
    title: "Guideline Solutions | AI Consulting for Business",
    description:
      "Guideline Solutions helps businesses turn AI into practical results with strategy, automation, custom AI applications, and responsible implementation.",
    path: "/",
    type: "home",
  },
  "/founder": {
    title: "Guideline Solutions | Jason Sarelas, Founder & CEO",
    description:
      "Meet Jason Sarelas, Founder and CEO of Guideline Solutions. He helps businesses turn complex technology and AI opportunities into practical solutions.",
    path: "/founder",
    type: "founder",
  },
  "/contact": {
    title: "Guideline Solutions | Contact",
    description:
      "Talk with Guideline Solutions about AI strategy, automation, custom applications, and a practical next step for your business.",
    path: "/contact",
    type: "contact",
  },
  "/ceo": {
    title: "Guideline Solutions | Jason Sarelas, Founder & CEO",
    description: "Meet Jason Sarelas, Founder and CEO of Guideline Solutions.",
    path: "/founder",
    type: "founder",
  },
  "/about": {
    title: "Guideline Solutions | Jason Sarelas, Founder & CEO",
    description: "Meet Jason Sarelas, Founder and CEO of Guideline Solutions.",
    path: "/founder",
    type: "founder",
  },
};

/**
 * Lowercases the path and drops trailing slashes and the prerendered file
 * name: "/Contact/" and "/contact.html" -> "/contact", "/index.html" -> "/".
 */
export function normalizePath(pathname: string): string {
  return (
    pathname
      .toLowerCase()
      .replace(/\/+$/, "")
      .replace(/\.html$/, "")
      .replace(/\/index$/, "") || "/"
  );
}

type PageMeta = {
  title: string;
  description: string;
  robots: string;
  canonicalUrl: string;
  structuredData: object;
};

/** Everything that goes in <head> for a path; used in the browser and at build time. */
export function getPageMeta(pathname: string): PageMeta {
  const page = pages[normalizePath(pathname)] ?? pages["/"];
  const canonicalUrl = `${siteUrl}${page.path}`;
  const structuredData =
    page.type === "founder"
      ? {
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Jason Sarelas",
          jobTitle: "Founder and CEO",
          url: canonicalUrl,
          worksFor: {
            "@type": "Organization",
            name: "Guideline Solutions",
            url: siteUrl,
          },
        }
      : page.type === "contact"
        ? {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: page.title,
            url: canonicalUrl,
            mainEntity: {
              "@type": "Organization",
              name: "Guideline Solutions",
              url: siteUrl,
              email: "info@guidelinesolutions.com",
              telephone: "+1-773-392-2336",
            },
          }
        : {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "Guideline Solutions",
            url: siteUrl,
            description: pages["/"].description,
            email: "info@guidelinesolutions.com",
            telephone: "+1-773-392-2336",
            areaServed: "Austin, Texas",
            founder: { "@type": "Person", name: "Jason Sarelas" },
            knowsAbout: [
              "AI consulting",
              "AI strategy",
              "intelligent automation",
              "custom AI applications",
              "responsible AI",
            ],
          };
  return {
    title: page.title,
    description: page.description,
    robots: page.index === false ? "noindex,follow" : "index,follow",
    canonicalUrl,
    structuredData,
  };
}

const imageAlt = "Guideline Solutions AI consulting";

/** Meta tags as [attribute, key, content], in the order they appear in <head>. */
function metaTags(meta: PageMeta): ["name" | "property", string, string][] {
  return [
    ["name", "description", meta.description],
    ["name", "robots", meta.robots],
    ["property", "og:type", "website"],
    ["property", "og:site_name", "Guideline Solutions"],
    ["property", "og:title", meta.title],
    ["property", "og:description", meta.description],
    ["property", "og:url", meta.canonicalUrl],
    ["property", "og:image", defaultImage],
    ["property", "og:image:alt", imageAlt],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", meta.title],
    ["name", "twitter:description", meta.description],
    ["name", "twitter:image", defaultImage],
  ];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** The <head> SEO tags as HTML, for prerendering pages at build time. */
export function renderHeadTags(pathname: string): string {
  const meta = getPageMeta(pathname);
  const json = JSON.stringify(meta.structuredData).replace(/</g, "\\u003c");
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    ...metaTags(meta).map(
      ([attribute, key, content]) =>
        `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`,
    ),
    `<script id="page-structured-data" type="application/ld+json">${json}</script>`,
  ].join("\n    ");
}

/** Updates <head> in the browser to match the current path. */
export function applyPageMetadata(pathname: string) {
  const meta = getPageMeta(pathname);
  document.title = meta.title;
  for (const [attribute, key, content] of metaTags(meta)) {
    let element = document.head.querySelector<HTMLMetaElement>(
      `meta[${attribute}="${key}"]`,
    );
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.append(element);
    }
    element.content = content;
  }

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = meta.canonicalUrl;

  let jsonLd = document.head.querySelector<HTMLScriptElement>(
    "#page-structured-data",
  );
  if (!jsonLd) {
    jsonLd = document.createElement("script");
    jsonLd.id = "page-structured-data";
    jsonLd.type = "application/ld+json";
    document.head.append(jsonLd);
  }
  jsonLd.textContent = JSON.stringify(meta.structuredData);
}
