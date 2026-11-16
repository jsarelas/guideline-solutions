import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { applyPageMetadata, normalizePath } from "./seo";

type IconName =
  | "spark"
  | "flow"
  | "brain"
  | "cloud"
  | "compass"
  | "shield"
  | "arrow";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    spark: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
        <path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" />
      </>
    ),
    flow: (
      <>
        <rect x="3" y="4" width="7" height="6" rx="1.5" />
        <rect x="14" y="14" width="7" height="6" rx="1.5" />
        <path d="M10 7h3a3 3 0 0 1 3 3v4M14 17h-3a3 3 0 0 1-3-3v-4" />
      </>
    ),
    brain: (
      <>
        <path d="M12 5a3.5 3.5 0 0 0-6.8 1.2A3.5 3.5 0 0 0 4 12a3.5 3.5 0 0 0 2.4 5.8A3.5 3.5 0 0 0 12 19V5Z" />
        <path d="M12 5a3.5 3.5 0 0 1 6.8 1.2A3.5 3.5 0 0 1 20 12a3.5 3.5 0 0 1-2.4 5.8A3.5 3.5 0 0 1 12 19M8 9h4m-5 5 5-1m4-4h-4m5 5-5-1" />
      </>
    ),
    cloud: (
      <>
        <path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.3A3.5 3.5 0 0 0 7 18Z" />
        <path d="m10 14 2-2 2 2m-2-2v5" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const services: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "compass",
    title: "AI strategy & readiness",
    body: "Find the right opportunities, set a clear direction, and build an AI roadmap grounded in your goals.",
  },
  {
    icon: "flow",
    title: "Intelligent automation",
    body: "Free teams from repetitive work by connecting AI to the processes and tools they already rely on.",
  },
  {
    icon: "brain",
    title: "Custom AI applications",
    body: "Bring useful copilots, assistants, and AI-powered products to life around your unique business needs.",
  },
  {
    icon: "cloud",
    title: "Data & cloud foundations",
    body: "Create secure, connected data foundations that help your AI solutions perform and grow.",
  },
  {
    icon: "shield",
    title: "Responsible AI",
    body: "Put the right guardrails in place with a thoughtful approach to privacy, security, and oversight.",
  },
  {
    icon: "spark",
    title: "Advisory & enablement",
    body: "Equip your people to work confidently with AI through hands-on guidance, training, and support.",
  },
];

type BrandFont =
  | "manrope"
  | "open-sans"
  | "arial"
  | "helvetica"
  | "sora"
  | "space-grotesk";
function Brand({ font = "open-sans" }: { font?: BrandFont }) {
  const maskId = useId();
  return (
    <a
      href="/#home"
      className={`brand ${font === "manrope" ? "" : `brand-font-${font}`}`}
      aria-label="Guideline Solutions home"
    >
      <span className="brand-name">
        <span className="brand-primary">Guideline</span>
        <span>solutions</span>
      </span>
      <svg className="brand-mark" viewBox="2 0 60 32" aria-hidden="true">
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="2"
            y="0"
            width="60"
            height="32"
          >
            <rect x="2" y="0" width="60" height="32" fill="white" />
            <path d="M2 16H62" stroke="black" strokeWidth="1" />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <path d="M2 3h19l20 13-20 13H2l20-13L2 3Z" />
          <path d="M23 3h19l20 13-20 13H23l20-13L23 3Z" />
        </g>
      </svg>
    </a>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="topbar">
      <div className="nav-shell">
        <Brand />
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          className={menuOpen ? "nav-links open" : "nav-links"}
          aria-label="Main navigation"
        >
          <a href="/#approach" onClick={closeMenu}>
            Approach
          </a>
          <a href="/#services" onClick={closeMenu}>
            Services
          </a>
          <a href="/founder" onClick={closeMenu}>
            Founder
          </a>
          <a className="nav-cta" href="/contact" onClick={closeMenu}>
            Contact <Icon name="arrow" />
          </a>
        </nav>
      </div>
    </header>
  );
}

function FooterNav() {
  return (
    <nav className="footer-nav" aria-label="Footer navigation">
      <span className="footer-nav-heading">Quick Links</span>
      <a href="/#approach">Approach</a>
      <a href="/#services">Services</a>
      <a href="/founder">Founder</a>
      <a href="/contact">Contact</a>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-stack">
          <Brand />
          <p>
            Practical AI.
            <br />
            Thoughtful partnership.
            <br />
            Built around your business.
          </p>
        </div>
        <FooterNav />
        <div className="footer-contact">
          <span>Start a conversation</span>
          <a href="mailto:info@guidelinesolutions.com" target="_blank" rel="noopener noreferrer">
            info@guidelinesolutions.com
          </a>
          <a href="tel:+17733922336">(773) 392-2336</a>
          <div className="footer-location">
            <span>Austin, Texas</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Guideline Solutions. All rights reserved.</span>
        <span>AI consulting with a human point of view.</span>
      </div>
    </footer>
  );
}

function CeoPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage-hero ceo-hero">
          <div className="subpage-hero-shade" />
          <div className="subpage-hero-copy">
            <div className="eyebrow light">
              <span className="eyebrow-line" />
              Leadership
            </div>
            <h1>
              Experience that
              <br />
              <em>moves ideas forward.</em>
            </h1>
            <p>Business-minded technology leadership for the age of AI.</p>
          </div>
        </section>
        <section className="ceo-section section-wrap">
          <div className="ceo-label">
            <span className="section-index">01</span>
            <span>Meet our CEO</span>
          </div>
          <div className="ceo-profile">
            <div className="ceo-photo-wrap">
              <img
                className="ceo-photo"
                src="/images/jason-sarelas.jpg"
                alt="Jason Sarelas, President and CEO of Guideline Solutions"
              />
              <span className="ceo-photo-caption">
                Guideline Solutions · Since 2006
              </span>
            </div>
            <div className="ceo-bio">
              <div className="eyebrow">
                <span className="eyebrow-line" />
                Founder &amp; CEO
              </div>
              <h2>
                Jason <em>Sarelas.</em>
              </h2>
              <p className="ceo-role">
                President &amp; CEO, Guideline Solutions
              </p>
              <p>
                Jason founded Guideline Solutions in 2006 with a belief that
                technology should make a real difference for the people and
                businesses it serves. He brings deep experience in software
                engineering, enterprise architecture, and turning complex
                business needs into clear, dependable solutions.
              </p>
              <p>
                Today, Jason brings that same practical mindset to AI: helping
                teams find where intelligent tools can create meaningful value,
                then guiding the work from early strategy through secure,
                thoughtful implementation.
              </p>
              <div className="ceo-specialties">
                <span>Enterprise architecture</span>
                <span>AI strategy &amp; delivery</span>
                <span>Cloud &amp; data platforms</span>
                <span>Security by design</span>
              </div>
              <a className="under-link" href="/contact">
                Connect with Jason <Icon name="arrow" />
              </a>
            </div>
          </div>
        </section>
        <section className="client-band">
          <div className="section-wrap">
            <div className="eyebrow">
              <span className="eyebrow-line" />A history of partnership
            </div>
            <h2>
              Trusted by teams
              <br />
              building what’s next.
            </h2>
            <div className="client-marks" aria-label="Selected past clients">
              <span className="client-walmart">
                <b>✳</b> Walmart
              </span>
              <JllClientLogo />
              <span className="client-crate">Crate&amp;Barrel</span>
              <span className="client-spencer">SpencerStuart</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ContactPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(
      `AI consulting inquiry from ${data.get("name") || "website"}`,
    );
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nCompany: ${data.get("company") || "Not provided"}\n\nWhat can we help with?\n${data.get("message")}`,
    );
    window.open(`mailto:info@guidelinesolutions.com?subject=${subject}&body=${body}`, "_blank", "noopener,noreferrer");
  }
  return (
    <>
      <SiteHeader />
      <main className="subpage contact-page">
        <section className="subpage-hero contact-hero">
          <div className="subpage-hero-shade" />
          <div className="subpage-hero-copy">
            <div className="eyebrow light">
              <span className="eyebrow-line" />
              Start a conversation
            </div>
            <h1>
              Let’s talk about
              <br />
              <em>what’s possible.</em>
            </h1>
            <p>
              Bring us a challenge, a question, or just a hunch. We’ll help you
              find a useful next step.
            </p>
          </div>
        </section>
        <section className="contact-section section-wrap">
          <div className="contact-intro">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Get in touch
            </div>
            <h2>
              Good work starts
              <br />
              with a <em>conversation.</em>
            </h2>
            <p>
              Tell us a little about what you’re working on. We’ll get back to
              you to learn more and explore where AI can help.
            </p>
            <div className="contact-details">
              <div>
                <span className="contact-detail-icon">✉</span>
                <span>
                  <b>Email</b>
                  <a href="mailto:info@guidelinesolutions.com" target="_blank" rel="noopener noreferrer">
                    info@guidelinesolutions.com
                  </a>
                </span>
              </div>
              <div>
                <span className="contact-detail-icon">↗</span>
                <span>
                  <b>Call</b>
                  <a href="tel:+17733922336">(773) 392-2336</a>
                </span>
              </div>
              <div>
                <span className="contact-detail-icon">⌖</span>
                <span>
                  <b>Based in</b>
                  <span>Austin, Texas</span>
                </span>
              </div>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <span>Tell us about your project</span>
              <span className="form-required">* Required</span>
            </div>
            <div className="form-row">
              <label>
                Your name *
                <input
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Jane Smith"
                />
              </label>
              <label>
                Work email *
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="jane@company.com"
                />
              </label>
            </div>
            <label>
              Company
              <input
                name="company"
                autoComplete="organization"
                placeholder="Your organization"
              />
            </label>
            <label>
              What would you like to make possible? *
              <textarea
                name="message"
                required
                rows={5}
                placeholder="A little about your goals, your challenge, or where you’d like to begin…"
              />
            </label>
            <button className="button button-dark" type="submit">
              Send your note <Icon name="arrow" />
            </button>
            <p className="form-note">
              Your message opens in your email app so you can review it before
              sending.
            </p>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ConceptLogo({
  variant,
  inverse = false,
}: {
  variant: "forward" | "signal" | "monogram";
  inverse?: boolean;
}) {
  if (variant === "forward")
    return (
      <div
        className={`concept-logo concept-forward ${inverse ? "inverse" : ""}`}
      >
        <span className="concept-word">
          Guideline<span>solutions</span>
        </span>
        <svg className="forward-mark" viewBox="2 0 60 32" aria-hidden="true">
          <path d="M2 3h19l20 13-20 13H2l20-13L2 3Z" />
          <path d="M23 3h19l20 13-20 13H23l20-13L23 3Z" />
        </svg>
      </div>
    );
  if (variant === "signal")
    return (
      <div
        className={`concept-logo concept-signal ${inverse ? "inverse" : ""}`}
      >
        <svg className="signal-mark" viewBox="0 0 46 46" aria-hidden="true">
          <path d="M23 4a19 19 0 1 0 18 25" />
          <path d="M23 12a11 11 0 1 0 10 16" />
          <path d="M23 20a3 3 0 1 0 3 3" />
          <circle cx="40" cy="11" r="3" />
          <circle cx="39" cy="31" r="2" />
        </svg>
        <span className="concept-word">
          Guideline<span>AI consulting</span>
        </span>
      </div>
    );
  return (
    <div
      className={`concept-logo concept-monogram ${inverse ? "inverse" : ""}`}
    >
      <svg className="mono-mark" viewBox="0 0 42 42" aria-hidden="true">
        <rect x="1" y="1" width="40" height="40" rx="2" />
        <path d="M29 12a12 12 0 1 0 1 15M29 21h-9m9 0v9" />
      </svg>
      <span className="concept-word">
        Guideline<span>solutions</span>
      </span>
    </div>
  );
}

function ForwardRefinement({
  version,
  inverse = false,
}: {
  version: "classic" | "outline" | "compact";
  inverse?: boolean;
}) {
  const className = `concept-logo forward-refinement ${inverse ? "inverse" : ""} refinement-${version}`;
  return (
    <div className={className}>
      <span className="concept-word">
        Guideline<span>solutions</span>
      </span>
      <svg viewBox="0 0 82 32" aria-hidden="true">
        {version === "classic" && (
          <>
            <path d="M2 3h19l20 13-20 13H2l20-13L2 3Z" />
            <path d="M23 3h19l20 13-20 13H23l20-13L23 3Z" />
          </>
        )}
        {version === "outline" && (
          <>
            <path d="M4 4h13l19 12-19 12H4l19-12L4 4Z" />
            <path d="M25 4h13l19 12-19 12H25l19-12L25 4Z" />
          </>
        )}
        {version === "compact" && (
          <>
            <path d="M3 3h25l23 13-23 13H3l23-13L3 3Z" />
            <path d="M32 3h16l25 13-25 13H32l23-13L32 3Z" />
          </>
        )}
      </svg>
    </div>
  );
}

function BrandConceptsPage() {
  const options = [
    {
      key: "forward" as const,
      name: "01 · Forward, refined",
      tag: "Familiar evolution",
      text: "Keeps the signature green arrow and recognizable wordmark, with cleaner geometry and better small-size clarity.",
    },
    {
      key: "signal" as const,
      name: "02 · Intelligent signal",
      tag: "AI-forward",
      text: "A compact signal mark suggests connected systems and intelligent insight while the wordmark keeps the brand grounded.",
    },
    {
      key: "monogram" as const,
      name: "03 · Guideline monogram",
      tag: "Simple & versatile",
      text: "A crisp G mark gives the brand a strong app icon and a flexible lockup for consulting, product, and social use.",
    },
  ];
  return (
    <>
      <SiteHeader />
      <main className="subpage concepts-page">
        <section className="subpage-hero concepts-hero">
          <div className="subpage-hero-shade" />
          <div className="subpage-hero-copy">
            <div className="eyebrow light">
              <span className="eyebrow-line" />A first look at the identity
            </div>
            <h1>
              Three ways to move
              <br />
              <em>Guideline forward.</em>
            </h1>
            <p>
              Early logo directions for the AI consulting chapter. The current
              mark remains in place while you compare.
            </p>
          </div>
        </section>
        <section className="concepts-intro section-wrap">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            Logo explorations
          </div>
          <h2>
            Keep the recognition.
            <br />
            <em>Clarify the signal.</em>
          </h2>
          <p>
            Each direction holds onto Guideline’s green and its sense of
            progress, while exploring a more versatile mark for the next stage.
          </p>
        </section>
        <section className="concept-grid section-wrap">
          {options.map((option) => (
            <article className="concept-card" key={option.key}>
              <div className="concept-card-head">
                <span>{option.name}</span>
                <span className="concept-tag">{option.tag}</span>
              </div>
              <div className="concept-stage light-stage">
                <ConceptLogo variant={option.key} />
              </div>
              <div className="concept-stage dark-stage">
                <ConceptLogo variant={option.key} inverse />
              </div>
              <div className="concept-details">
                <p>{option.text}</p>
                <div className="concept-uses">
                  <span>Website header</span>
                  <span>Social avatar</span>
                  <span>Light / dark</span>
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="refinements-section">
          <div className="section-wrap">
            <div className="refinements-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" />
                  Expanding your favorite
                </div>
                <h2>
                  More from <em>direction one.</em>
                </h2>
              </div>
              <p>
                Same recognizable wordmark and green. Three treatments of the
                forward mark, from closest to boldest.
              </p>
            </div>
            <div className="refinement-grid">
              {[
                {
                  version: "classic" as const,
                  name: "1A · Signature",
                  note: "The familiar two-chevron mark, carefully tightened.",
                },
                {
                  version: "outline" as const,
                  name: "1B · Open motion",
                  note: "Two lighter arrows for a more technical feel.",
                },
                {
                  version: "compact" as const,
                  name: "1C · Bold advance",
                  note: "Two larger chevrons for stronger small-size impact.",
                },
              ].map((refinement) => (
                <article className="refinement-card" key={refinement.version}>
                  <div className="refinement-title">
                    <b>{refinement.name}</b>
                    <span>Refinement of 01</span>
                  </div>
                  <div className="concept-stage light-stage">
                    <ForwardRefinement version={refinement.version} />
                  </div>
                  <div className="concept-stage dark-stage">
                    <ForwardRefinement version={refinement.version} inverse />
                  </div>
                  <p>{refinement.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="concept-note section-wrap">
          <span className="section-index">NEXT</span>
          <p>
            These are visual directions to review. The selected option can be
            refined into final logo files and then applied consistently across
            the site.
          </p>
          <a className="under-link" href="/contact">
            Talk about the next step <Icon name="arrow" />
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function JllClientLogo() {
  return (
    <span className="client-jll" role="img" aria-label="JLL">
      <img src="/images/jll-logo.png" alt="" />
    </span>
  );
}

type FaviconOption = "selected" | "previous" | "g-arrow" | "tile" | "signal";
function FaviconMark({
  option,
  size = 64,
}: {
  option: FaviconOption;
  size?: number;
}) {
  if (option === "selected")
    return (
      <img
        className="favicon-current"
        width={size}
        height={size}
        src="/favicon.svg"
        alt="Selected Guideline favicon: two green chevrons"
      />
    );
  if (option === "previous")
    return (
      <img
        className="favicon-current"
        width={size}
        height={size}
        src="/favicon.ico"
        alt="Previous Guideline favicon: green G"
      />
    );
  return (
    <svg
      className={`favicon-mark favicon-${option}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={`${option} favicon concept`}
    >
      {option === "g-arrow" && (
        <>
          <text x="3" y="37">
            G
          </text>
          <path d="M27 14h8l10 10-10 10h-8l10-10-10-10Z" />
        </>
      )}
      {option === "tile" && (
        <>
          <rect x="2" y="2" width="44" height="44" rx="9" fill="#293239" />
          <text x="8" y="37">
            G
          </text>
        </>
      )}
      {option === "signal" && (
        <>
          <circle
            cx="22"
            cy="24"
            r="18"
            fill="none"
            stroke="#aacd4b"
            strokeWidth="3"
            strokeDasharray="82 18"
            transform="rotate(-52 22 24)"
          />
          <circle
            cx="22"
            cy="24"
            r="10"
            fill="none"
            stroke="#aacd4b"
            strokeWidth="3"
            strokeDasharray="42 18"
            transform="rotate(-52 22 24)"
          />
          <path
            d="M32 7h8v8"
            fill="none"
            stroke="#aacd4b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="24" r="3" fill="#aacd4b" />
        </>
      )}
    </svg>
  );
}

function FaviconOptionsPage() {
  const options: {
    key: FaviconOption;
    title: string;
    description: string;
    note: string;
  }[] = [
    {
      key: "selected",
      title: "Selected · Two chevrons",
      description: "The two-chevron mark selected to match the website logo.",
      note: "Now in use",
    },
    {
      key: "previous",
      title: "Previous · G",
      description: "The former Guideline lettermark, kept for reference.",
      note: "Previous favicon",
    },
    {
      key: "g-arrow",
      title: "02 · G + arrow",
      description: "Pairs the initial with the signature motion mark.",
      note: "Most distinctive",
    },
    {
      key: "tile",
      title: "03 · G tile",
      description: "A high contrast, compact version of the current G.",
      note: "Strongest at 16 px",
    },
    {
      key: "signal",
      title: "04 · Signal",
      description:
        "A subtle nod to intelligent systems, kept in Guideline green.",
      note: "Most AI-oriented",
    },
  ];
  return (
    <>
      <SiteHeader />
      <main className="favicon-options-page">
        <section className="favicon-intro section-wrap">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            Favicon selection
          </div>
          <h1>
            Small icon.
            <br />
            <em>Clear identity.</em>
          </h1>
          <p>
            The two-chevron mark is now selected to match the website logo. The
            previous G and other directions remain here for reference.
          </p>
        </section>
        <section className="favicon-grid section-wrap">
          {options.map((option) => (
            <article className="favicon-card" key={option.key}>
              <div className="favicon-card-heading">
                <span>{option.title}</span>
                <small>{option.note}</small>
              </div>
              <div className="favicon-large-stage">
                <FaviconMark option={option.key} size={56} />
              </div>
              <div className="favicon-tab-row">
                <span className="tab-demo">
                  <FaviconMark option={option.key} size={16} />{" "}
                  <b>Guideline Solutions</b>
                  <i>×</i>
                </span>
                <span className="tab-demo dark-demo">
                  <FaviconMark option={option.key} size={16} /> <b>Guideline</b>
                  <i>×</i>
                </span>
              </div>
              <p>{option.description}</p>
            </article>
          ))}
        </section>
        <section className="favicon-guidance section-wrap">
          <span className="section-index">NOTE</span>
          <p>
            At browser-tab size, simple shapes and strong contrast tend to stay
            clearest. The standalone chevrons or the G tile are the most legible
            at 16 pixels.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function LogoFontPreviewPage() {
  const fonts: { key: BrandFont; name: string; note: string }[] = [
    { key: "open-sans", name: "Open Sans Semibold", note: "Current logo" },
    { key: "sora", name: "Sora Semibold", note: "Geometric · AI-forward" },
    {
      key: "space-grotesk",
      name: "Space Grotesk Medium",
      note: "Distinctive · Modern",
    },
    { key: "manrope", name: "Manrope", note: "Previous logo font" },
    { key: "arial", name: "Arial", note: "Alternate" },
    { key: "helvetica", name: "Helvetica Neue Regular", note: "Alternate" },
  ];
  return (
    <>
      <SiteHeader />
      <main className="font-preview-page">
        <section className="font-preview-intro section-wrap">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            Logo font comparison
          </div>
          <h1>
            Compare the <em>“G”.</em>
          </h1>
          <p>
            Each option uses the same wordmark and chevrons. Compare how the
            capital G’s right-side stroke looks in each font.
          </p>
        </section>
        <section className="font-preview-grid section-wrap">
          {fonts.map((font) => (
            <article className="font-preview-card" key={font.key}>
              <div className="font-preview-label">
                <b>{font.name}</b>
                <span>{font.note}</span>
              </div>
              <div className="font-preview-stage">
                <Brand font={font.key} />
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const path = normalizePath(window.location.pathname);
  useEffect(() => {
    // Show the canonical path in the address bar, e.g. /Contact/ -> /contact.
    if (path !== window.location.pathname) {
      const { search, hash } = window.location;
      window.history.replaceState(null, "", path + search + hash);
    }
    applyPageMetadata(path);
  }, [path]);
  if (path === "/founder" || path === "/ceo" || path === "/about")
    return <CeoPage />;
  if (path === "/contact") return <ContactPage />;
  return (
    <>
      <header className="topbar" id="home">
        <div className="nav-shell">
          <Brand />
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            className={menuOpen ? "nav-links open" : "nav-links"}
            aria-label="Main navigation"
          >
            <a href="#approach" onClick={closeMenu}>
              Approach
            </a>
            <a href="#services" onClick={closeMenu}>
              Services
            </a>
            <a href="/founder" onClick={closeMenu}>
              Founder
            </a>
            <a className="nav-cta" href="/contact" onClick={closeMenu}>
              Contact <Icon name="arrow" />
            </a>
          </nav>
        </div>
      </header>
      <main>
        <section className="hero" aria-label="AI consulting for business">
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow light">
              <span className="eyebrow-line" />
              AI consulting, made practical
            </div>
            <h1>
              Make AI work
              <br />
              <em>for your business.</em>
            </h1>
            <p>
              From the first question to the finished solution, we turn the
              promise of AI into progress you can see.
            </p>
            <div className="hero-actions">
              <a className="button button-lime" href="#contact">
                Start a conversation <Icon name="arrow" />
              </a>
              <a className="text-link light-link" href="#services">
                Explore what we do <span>↓</span>
              </a>
            </div>
          </div>
          <div className="hero-caption">
            <span>Thoughtful technology. Measurable impact.</span>
            <span className="caption-rule" />
          </div>
        </section>
        <div className="trust-strip">
          <span>STRATEGY</span>
          <i />
          <span>ENGINEERING</span>
          <i />
          <span>RESPONSIBLE AI</span>
          <i />
          <span>BUILT AROUND YOU</span>
        </div>
        <section className="intro section-wrap" id="approach">
          <div className="intro-label">
            <span className="section-index">01</span>
            <span>Our approach</span>
          </div>
          <div className="intro-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Human insight. Intelligent technology.
            </div>
            <h2>
              Less AI theater.
              <br />
              <em>More business value.</em>
            </h2>
            <p>
              AI is changing what’s possible. We help you figure out what
              matters for your business—and then make it real. With the right
              mix of strategy, engineering, and practical experience, we design
              solutions that solve meaningful problems and make work better.
            </p>
            <a className="under-link" href="#about">
              Get to know Guideline <Icon name="arrow" />
            </a>
          </div>
          <div className="intro-note">
            <div className="note-symbol">
              G<span>›</span>
            </div>
            <p>
              Good technology should make your business feel simpler, smarter,
              and ready for what’s next.
            </p>
            <span className="note-byline">The Guideline principle</span>
          </div>
        </section>
        <section className="services-section" id="services">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" />
                  How we help
                </div>
                <h2>
                  AI, from idea
                  <br />
                  to <em>everyday impact.</em>
                </h2>
              </div>
              <p>
                We bring the experience to ask better questions, build the right
                thing, and make sure it works in the real world.
              </p>
            </div>
            <div className="service-grid">
              {services.map((s, i) => (
                <article className="service-card" key={s.title}>
                  <div className="service-top">
                    <span className="service-index">0{i + 1}</span>
                    <span className="service-icon">
                      <Icon name={s.icon} />
                    </span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <a
                    href="#contact"
                    aria-label={`Talk with us about ${s.title}`}
                  >
                    <Icon name="arrow" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="feature" id="about">
          <div
            className="feature-image"
            role="img"
            aria-label="Business leader working with a digital interface"
          />
          <div className="feature-copy">
            <div className="eyebrow light">
              <span className="eyebrow-line" />
              Strategy through to execution
            </div>
            <h2>
              Good ideas deserve
              <br />
              great <em>follow-through.</em>
            </h2>
            <p>
              We pair clear-eyed advice with hands-on delivery. That means one
              trusted partner to uncover the opportunity, shape a solution, and
              help your team put it to work.
            </p>
            <div className="feature-points">
              <span>
                <b>01</b> Understand your world
              </span>
              <span>
                <b>02</b> Design for real people
              </span>
              <span>
                <b>03</b> Deliver with care
              </span>
            </div>
          </div>
        </section>
        <section className="closing section-wrap" id="contact">
          <div className="closing-kicker">
            <span className="section-index">02</span>
            <span>Ready when you are</span>
          </div>
          <div className="closing-main">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Your next step
            </div>
            <h2>
              Let’s make your
              <br />
              <em>next move intelligent.</em>
            </h2>
            <p>
              Tell us where you’re headed. We’ll help you find a practical place
              to start.
            </p>
            <a
              className="button button-dark"
              href="mailto:info@guidelinesolutions.com?subject=Let%E2%80%99s%20talk%20about%20AI"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk with our team <Icon name="arrow" />
            </a>
          </div>
          <div className="closing-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orb-core">
              <Icon name="spark" />
            </div>
            <span className="orbit-dot dot-one" />
            <span className="orbit-dot dot-two" />
            <span className="orbit-dot dot-three" />
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand-stack">
            <Brand />
            <p>
              Practical AI.
              <br />
              Thoughtful partnership.
              <br />
              Built around your business.
            </p>
          </div>
          <FooterNav />
          <div className="footer-contact">
            <span>Start a conversation</span>
            <a href="mailto:info@guidelinesolutions.com" target="_blank" rel="noopener noreferrer">
              info@guidelinesolutions.com
            </a>
            <a href="tel:+17733922336">(773) 392-2336</a>
            <div className="footer-location">
              <span>Based in Austin, Texas</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Guideline Solutions. All rights reserved.</span>
          <span>AI consulting with a human point of view.</span>
        </div>
      </footer>
    </>
  );
}
