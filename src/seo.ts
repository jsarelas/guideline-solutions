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

function setMeta(
  selector: string,
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

/** Lowercases the path and drops trailing slashes: "/Contact/" -> "/contact". */
export function normalizePath(pathname: string): string {
  return pathname.toLowerCase().replace(/\/+$/, "") || "/";
}

export function applyPageMetadata(pathname: string) {
  const page = pages[normalizePath(pathname)] ?? pages["/"];
  const canonicalUrl = `${siteUrl}${page.path}`;
  document.title = page.title;
  setMeta('meta[name="description"]', "name", "description", page.description);
  setMeta(
    'meta[name="robots"]',
    "name",
    "robots",
    page.index === false ? "noindex,follow" : "index,follow",
  );
  setMeta('meta[property="og:title"]', "property", "og:title", page.title);
  setMeta(
    'meta[property="og:description"]',
    "property",
    "og:description",
    page.description,
  );
  setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
  setMeta('meta[property="og:image"]', "property", "og:image", defaultImage);
  setMeta(
    'meta[property="og:image:alt"]',
    "property",
    "og:image:alt",
    "Guideline Solutions AI consulting",
  );
  setMeta('meta[property="og:type"]', "property", "og:type", "website");
  setMeta(
    'meta[property="og:site_name"]',
    "property",
    "og:site_name",
    "Guideline Solutions",
  );
  setMeta(
    'meta[name="twitter:card"]',
    "name",
    "twitter:card",
    "summary_large_image",
  );
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", page.title);
  setMeta(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    page.description,
  );
  setMeta('meta[name="twitter:image"]', "name", "twitter:image", defaultImage);

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;

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
  let jsonLd = document.head.querySelector<HTMLScriptElement>(
    "#page-structured-data",
  );
  if (!jsonLd) {
    jsonLd = document.createElement("script");
    jsonLd.id = "page-structured-data";
    jsonLd.type = "application/ld+json";
    document.head.append(jsonLd);
  }
  jsonLd.textContent = JSON.stringify(structuredData);
}
