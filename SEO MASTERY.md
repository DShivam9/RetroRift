---
name: seo
description: >
  Use this skill for any task involving Search Engine Optimization on a web project.
  Triggers include: "improve my SEO", "help me rank on Google", "add meta tags",
  "generate a sitemap", "fix my robots.txt", "add structured data / schema",
  "optimize Core Web Vitals", "improve page speed", "make my site indexable",
  "add Open Graph tags", "audit my SEO", or any mention of Google Search Console,
  Lighthouse SEO score, or search rankings. Also triggers when building a new public
  web page, landing page, or blog that needs to be discovered organically.
  Do NOT use for internal dashboards, auth-gated pages, or non-public tooling.
version: 1.0.0
---

# SEO Optimization Skill

Covers full-stack SEO implementation for web projects: technical crawlability,
on-page semantics, structured data, performance, and indexing pipeline.
Works across Next.js, Remix, Astro, plain HTML, and React SPA projects.

---

## Quick Reference

| Task                          | Jump To                          |
|-------------------------------|----------------------------------|
| Audit an existing page        | [SEO Audit Checklist](#seo-audit-checklist) |
| Add meta / Open Graph tags    | [Head Tag Templates](#head-tag-templates) |
| Generate JSON-LD schema       | [Structured Data](#structured-data) |
| Fix rendering / CSR problem   | [Rendering Strategy](#rendering-strategy-decision) |
| Create sitemap.xml            | [Sitemap Generation](#sitemapxml) |
| Write robots.txt              | [Robots.txt](#robotstxt) |
| Fix Core Web Vitals           | [Performance](#core-web-vitals) |
| Internal linking rules        | [Internal Links](#internal-linking) |
| Choose a schema type          | [Schema Decision Tree](#schema-decision-tree) |

---

## SEO Audit Checklist

Run this before touching anything. Identify failures first, then fix in order.

```
TIER 1 — CRITICAL (blocks indexing)
  [ ] Page is reachable over HTTPS with a valid certificate
  [ ] URL returns HTTP 200 (not 3xx chain, 4xx, or 5xx)
  [ ] Page is not blocked by robots.txt or <meta name="robots" content="noindex">
  [ ] Critical content is NOT rendered solely via client-side JavaScript
  [ ] <title> tag exists and is under 60 characters
  [ ] <meta name="description"> exists and is under 160 characters
  [ ] Page has exactly one <h1>

TIER 2 — HIGH IMPACT (ranking signals)
  [ ] Canonical <link rel="canonical" href="..."> points to the correct URL
  [ ] Open Graph tags present (og:title, og:description, og:image, og:url)
  [ ] All images have descriptive alt attributes (not empty, not "image.png")
  [ ] Images use WebP/AVIF format with explicit width and height attributes
  [ ] Heading hierarchy is sequential (h1 → h2 → h3, no skipping)
  [ ] Page contains at least one internal link to a related page
  [ ] Valid JSON-LD schema injected in <head> or before </body>
  [ ] URL slug is lowercase, hyphen-separated, descriptive, under 75 chars
  [ ] Sitemap.xml exists and lists this URL

TIER 3 — QUALITY SIGNALS (authority and engagement)
  [ ] LCP < 2.5s, INP < 200ms, CLS < 0.1 (measure with Lighthouse or PageSpeed Insights)
  [ ] Mobile viewport meta tag present
  [ ] Page answers the target query in the first ~200 words
  [ ] No duplicate content (same text served on multiple URLs)
  [ ] hreflang tags set if serving multiple languages
```

**CRITICAL**: Never skip Tier 1 before Tier 2. A perfectly structured page that is
`noindex`-ed or CSR-only is invisible to Google. Fix indexability before everything else.

---

## Rendering Strategy Decision

**CRITICAL**: Google can render JavaScript, but it queues JS rendering separately.
Pure CSR pages may not be indexed for days or never if they are slow. Use this tree:

```
Is the page public-facing AND needs organic traffic?
├── YES → Is it a React/Vue/Svelte SPA?
│         ├── Next.js / Remix / Nuxt? → Use SSR (getServerSideProps / loader) or SSG
│         ├── Vite/CRA SPA?          → Migrate critical routes to SSR OR add prerendering
│         └── Static content?        → Use SSG (generateStaticParams, static export)
└── NO  → CSR is fine (dashboards, auth-gated tools, admin panels)
```

### Next.js — Enforce SSR on a page

```typescript
// app/blog/[slug]/page.tsx — App Router (recommended)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://yourdomain.com/blog/${params.slug}` },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);  // runs on server — fully indexed
  return <article>{/* content */}</article>;
}
```

### Next.js — Static Generation (preferred for blogs/docs)

```typescript
// Generates all paths at build time — fastest LCP, ideal for static content
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

### Vite SPA — Add prerendering (vite-plugin-ssr or @vitejs/plugin-react)

```javascript
// vite.config.ts — add prerender for critical routes
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // For full SSR, migrate to Remix or Next.js
  // For prerendering only: use vite-plugin-prerender
});
```

**Rule**: If you cannot add SSR, ensure the page's `<head>` meta tags are injected
server-side (even if the body hydrates client-side). Meta tags in CSR are invisible
to most crawlers.

---

## Head Tag Templates

### Universal — HTML/PHP/plain server-rendered

```html
<head>
  <!-- Charset and viewport MUST be first -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Core SEO -->
  <title>Primary Keyword – Brand Name</title>  <!-- ≤60 chars, keyword first -->
  <meta name="description" content="Concise value prop answering the user's query. Include primary keyword naturally. Under 160 chars." />
  <link rel="canonical" href="https://yourdomain.com/exact-page-url" />

  <!-- Open Graph (social + AI crawlers read these) -->
  <meta property="og:type"        content="website" />
  <meta property="og:title"       content="Primary Keyword – Brand Name" />
  <meta property="og:description" content="Same or similar to meta description." />
  <meta property="og:url"         content="https://yourdomain.com/exact-page-url" />
  <meta property="og:image"       content="https://yourdomain.com/og-image-1200x630.webp" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name"   content="Your Brand" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="Primary Keyword – Brand Name" />
  <meta name="twitter:description" content="Under 200 chars." />
  <meta name="twitter:image"       content="https://yourdomain.com/og-image-1200x630.webp" />

  <!-- Robots (only add when you need to RESTRICT — default is index,follow) -->
  <!-- <meta name="robots" content="noindex, nofollow" /> -->

  <!-- Structured Data (inline JSON-LD — see section below) -->
  <script type="application/ld+json">{ ... }</script>
</head>
```

### Next.js App Router — metadata export (preferred)

```typescript
// layout.tsx or page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Brand Name',
    template: '%s | Brand Name',   // child pages: "Page Title | Brand Name"
  },
  description: 'Site-level fallback description under 160 chars.',
  metadataBase: new URL('https://yourdomain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    siteName: 'Brand Name',
    images: [{ url: '/og-image.webp', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@yourhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
```

**CRITICAL**: `metadataBase` must be set in root layout or canonical/OG URLs will
be relative and invalid. Always set it.

---

## Structured Data

JSON-LD is the **only** structured data format Google recommends for new implementations.
Inject it in `<head>` or before `</body>`. Never in a CSR-only component.

### Schema Decision Tree

```
What type of page is this?
├── Article / Blog Post          → Article or BlogPosting
├── Product / E-commerce         → Product + AggregateRating + Offer
├── FAQ page or FAQ section      → FAQPage (must match visible text EXACTLY)
├── How-To guide                 → HowTo
├── Software / App / SaaS        → SoftwareApplication
├── Video game / retro game      → VideoGame
├── Person / Portfolio           → Person
├── Company / Brand              → Organization
├── Local business               → LocalBusiness (extends Organization)
├── Sitewide breadcrumbs         → BreadcrumbList (every content page)
└── Home page                    → WebSite + SearchAction (sitelinks searchbox)
```

### Article / BlogPosting

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title (under 110 chars)",
  "description": "Match meta description. Under 160 chars.",
  "image": {
    "@type": "ImageObject",
    "url": "https://yourdomain.com/article-image.webp",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "Author Full Name",
    "url": "https://yourdomain.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Brand Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "datePublished": "2025-01-15T08:00:00+00:00",
  "dateModified": "2025-06-01T12:00:00+00:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://yourdomain.com/blog/article-slug"
  }
}
</script>
```

### FAQPage

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is X?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The answer text must match what is VISIBLE on the page verbatim. Google rejects FAQ schema that doesn't match visible content."
      }
    },
    {
      "@type": "Question",
      "name": "How does Y work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Second answer visible on the page."
      }
    }
  ]
}
</script>
```

**CRITICAL**: FAQ schema text must be identical to the visible DOM text.
If the page says "X costs $10/month" the schema must say exactly that.
Mismatches cause Google to reject the rich result silently.

### SoftwareApplication / WebApp

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App Name",
  "operatingSystem": "Web",
  "applicationCategory": "UtilitiesApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "240"
  },
  "url": "https://yourdomain.com",
  "screenshot": "https://yourdomain.com/screenshot.webp"
}
</script>
```

### BreadcrumbList (add to every content page)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",     "item": "https://yourdomain.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog",     "item": "https://yourdomain.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Article Title" }
  ]
}
</script>
```

### WebSite + Sitelinks Searchbox (root homepage only)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Brand Name",
  "url": "https://yourdomain.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://yourdomain.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

**Validate all schema** at: https://validator.schema.org  and
https://search.google.com/test/rich-results before deploying.

---

## Semantic HTML Structure

**CRITICAL**: Heading hierarchy and semantic tags are direct ranking signals.
Google's crawler builds a document outline from them.

### Correct page structure

```html
<body>
  <header>
    <nav aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
    </nav>
  </header>

  <main>
    <!-- ONE h1 per page. Matches <title> closely but not identically. -->
    <h1>Primary Keyword: Descriptive Title</h1>

    <article>
      <section aria-labelledby="section-1-heading">
        <h2 id="section-1-heading">First Major Subtopic</h2>
        <p>Introductory paragraph answering the query within first 200 words.</p>

        <h3>Supporting Detail</h3>
        <p>Elaboration with semantic entity terms and natural keyword variations.</p>
      </section>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        <!-- FAQ items here — match FAQPage schema exactly -->
      </section>
    </article>

    <aside aria-label="Related content">
      <!-- Related links, author bio, supplementary content -->
    </aside>
  </main>

  <footer>
    <!-- Site-wide links, legal, social -->
  </footer>
</body>
```

### Heading rules (non-negotiable)

```
✅ One <h1> per page — describes the whole page
✅ h2 sections divide the page into major topics
✅ h3 subdivides h2 sections only
✅ Never skip levels (h1 → h3 without h2 = invalid outline)
✅ Heading text should contain target/semantic keywords naturally

❌ Do not use headings for visual sizing — use CSS classes instead
❌ Do not repeat the h1 text verbatim as an h2
❌ Do not use <div> where <section>, <article>, <nav>, <aside> apply
```

---

## Image Optimization

Every `<img>` without alt text is a missed ranking signal AND an accessibility failure.

```html
<!-- ✅ Correct — next-gen format, explicit dimensions, lazy loading, descriptive alt -->
<img
  src="/images/retro-arcade-cabinet.webp"
  alt="Custom retro arcade cabinet running MAME emulator on Raspberry Pi"
  width="800"
  height="500"
  loading="lazy"
  decoding="async"
/>

<!-- ✅ Hero/LCP image — do NOT lazy-load the above-the-fold image -->
<img
  src="/images/hero.webp"
  alt="RetroRift — browser-based retro game streaming platform"
  width="1200"
  height="630"
  fetchpriority="high"
/>

<!-- ❌ Wrong — missing alt, no dimensions, blocking format -->
<img src="image.png" />
```

### Responsive images with srcset

```html
<img
  srcset="
    /images/hero-480.webp  480w,
    /images/hero-800.webp  800w,
    /images/hero-1200.webp 1200w
  "
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  src="/images/hero-1200.webp"
  alt="Descriptive text"
  width="1200"
  height="630"
  fetchpriority="high"
/>
```

**CRITICAL**: Always set `width` and `height` attributes explicitly. Without them,
the browser cannot reserve space before image loads, causing **Cumulative Layout Shift (CLS)**
which is a Core Web Vitals penalty and ranking factor.

---

## sitemap.xml

### Static sitemap (plain HTML / small site)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2025-06-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/blog</loc>
    <lastmod>2025-06-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/blog/your-post-slug</loc>
    <lastmod>2025-05-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Next.js App Router — dynamic sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const BASE = 'https://yourdomain.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/about`,lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url:             `${BASE}/blog/${post.slug}`,
    lastModified:    new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority:        0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
```

**Sitemap rules:**
- Never include URLs that return non-200 status codes
- Never include `noindex` pages
- Never include duplicate/canonical variants (list canonical URLs only)
- Submit to Google Search Console after every major content update

---

## robots.txt

```
# robots.txt — place at root: https://yourdomain.com/robots.txt

User-agent: *
Allow: /

# Block non-public routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/           # Next.js internals (already non-indexable but good hygiene)
Disallow: /dashboard/
Disallow: /auth/

# NEVER block CSS, JS, or font files — Google needs them to render pages
# Wrong: Disallow: /static/   <- blocks rendering, hurts SEO

# Crawl delay (optional — be conservative with aggressive crawlers only)
# Crawl-delay: 1

Sitemap: https://yourdomain.com/sitemap.xml
```

**CRITICAL**: Blocking CSS or JS in robots.txt prevents Google from rendering your
pages visually. This is one of the most damaging and hardest-to-diagnose SEO errors.
Never disallow asset folders.

### Next.js App Router — robots.ts

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
    ],
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

---

## Core Web Vitals

Target thresholds (Google "Good" range):

| Metric | Good   | Needs Improvement | Poor    |
|--------|--------|-------------------|---------|
| LCP    | < 2.5s | 2.5s – 4.0s       | > 4.0s  |
| INP    | < 200ms| 200ms – 500ms     | > 500ms |
| CLS    | < 0.1  | 0.1 – 0.25        | > 0.25  |

### Fix LCP (Largest Contentful Paint)

```html
<!-- 1. Preconnect to critical third-party origins -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- 2. Preload the LCP image (hero image, above-the-fold banner) -->
<link
  rel="preload"
  as="image"
  href="/images/hero.webp"
  imagesrcset="/images/hero-480.webp 480w, /images/hero-1200.webp 1200w"
  imagesizes="100vw"
/>

<!-- 3. Preload critical fonts -->
<link rel="preload" as="font" href="/fonts/brand-font.woff2" type="font/woff2" crossorigin />
```

```css
/* 4. Prevent font layout shift */
@font-face {
  font-family: 'BrandFont';
  src: url('/fonts/brand-font.woff2') format('woff2');
  font-display: swap;   /* shows fallback immediately, swaps when loaded */
  font-weight: 400;
}
```

### Fix CLS (Cumulative Layout Shift)

```html
<!-- ALWAYS reserve space for images with width/height -->
<img src="..." width="800" height="450" alt="..." />

<!-- ALWAYS reserve space for iframes/embeds -->
<div style="aspect-ratio: 16/9; position: relative;">
  <iframe src="..." style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

<!-- Avoid injecting content above existing content after load -->
<!-- Common culprit: cookie banners, notification bars, late-loading ads -->
```

### Fix INP (Interaction to Next Paint)

```typescript
// Break up long tasks — keep main thread blocks under 50ms
// ❌ Wrong — blocks main thread
function processLargeList(items: Item[]) {
  return items.map(heavyTransform);  // can block for 200ms+
}

// ✅ Correct — yield to browser between chunks
async function processLargeList(items: Item[]) {
  const results = [];
  for (let i = 0; i < items.length; i += 50) {
    const chunk = items.slice(i, i + 50);
    results.push(...chunk.map(heavyTransform));
    await new Promise(r => setTimeout(r, 0));  // yield to browser
  }
  return results;
}
```

```typescript
// Debounce search inputs to avoid firing on every keystroke
import { useDeferredValue } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);  // defers expensive re-renders
  // use deferredQuery for the search results rendering
}
```

### Next.js bundle optimization

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],   // serve AVIF first, WebP fallback
    minimumCacheTTL: 60 * 60 * 24 * 30,     // 30-day image cache
  },
  compress: true,          // Brotli/Gzip compression
  poweredByHeader: false,  // remove X-Powered-By (minor security + hygiene)
  experimental: {
    optimizeCss: true,     // inline critical CSS
  },
};
```

---

## Internal Linking

Internal links pass authority (PageRank) and help Google discover content.

### Rules

```
✅ Every page should receive at least ONE internal link from another page
✅ Anchor text must be descriptive — matches what the linked page is about
✅ Link from high-authority pages (homepage, popular posts) to deep content
✅ Use contextual inline links — not just navigation or footer links
✅ Orphan pages (zero inbound internal links) will rank poorly or not at all

❌ Never use generic anchors: "click here", "read more", "this page"
❌ Never link the same anchor text to two different URLs on the same page
❌ Avoid excessive links in a single paragraph (dilutes authority signal)
```

### Anchor text patterns

```
Primary target keyword:    "retro game browser emulator"   → /products/emulator
Semantic variation:        "play classic games online"     → /products/emulator
Brand navigation:          "RetroRift platform"            → /
Supporting entity:         "pixel art rendering pipeline"  → /docs/rendering
```

---

## URL Architecture

```
✅ Correct slug patterns:
   /blog/how-to-optimize-core-web-vitals
   /products/retro-game-emulator
   /docs/api-reference/authentication

❌ Wrong patterns (fix these):
   /blog/post?id=123           → no query string IDs in slugs
   /Blog/How-To-Optimize       → no uppercase
   /blog/how_to_optimize       → use hyphens not underscores
   /blog/category/sub/post/v2  → avoid deep nesting (> 3 levels)
   /p/1234                     → non-descriptive
```

### Redirect rules when changing URLs

```
Old URL → New URL: Always use 301 (permanent redirect), not 302
Redirect chains: A → B → C is a signal loss. Flatten to A → C directly
Never delete a page that has inbound links — redirect to nearest relevant page
```

```nginx
# nginx
rewrite ^/old-path/?$ /new-path permanent;
```

```typescript
// Next.js next.config.ts
const nextConfig = {
  async redirects() {
    return [
      { source: '/old-path', destination: '/new-path', permanent: true },
    ];
  },
};
```

---

## Canonical Tags

Canonicals tell Google which URL is the "real" version when duplicate content exists.

```html
<!-- Self-referencing canonical on every page — prevents accidental duplicate signals -->
<link rel="canonical" href="https://yourdomain.com/exact-url-no-trailing-slash" />
```

### Common canonical problems to fix

```
Problem: Trailing slash inconsistency
  https://yourdomain.com/blog  ≠  https://yourdomain.com/blog/
Fix: Pick one, set canonical to it, 301 redirect the other.

Problem: HTTP/HTTPS serving same content
Fix: Canonical to HTTPS version. Force HTTPS redirect at server/CDN level.

Problem: www vs non-www
Fix: Pick one, canonical + 301 redirect from the other.

Problem: Paginated content (/blog?page=2)
Fix: Each page gets its own canonical to itself (not page 1).
     Consider rel="next"/rel="prev" for older Google versions.

Problem: UTM parameters creating duplicate URLs
Fix: Add canonical pointing to the base URL (without UTM params).
```

---

## hreflang (Multi-language / Multi-region)

Only implement if you serve content in multiple languages or regions.

```html
<!-- In <head> of each language variant -->
<link rel="alternate" hreflang="en"    href="https://yourdomain.com/page" />
<link rel="alternate" hreflang="en-GB" href="https://yourdomain.co.uk/page" />
<link rel="alternate" hreflang="hi"    href="https://yourdomain.com/hi/page" />
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/page" />
```

**Rule**: Every page in the hreflang cluster must reference ALL other language
variants. If page A references B but B doesn't reference A, Google ignores it.

---

## Validation & Testing Commands

### Check page rendering as Googlebot

```bash
# Google's URL Inspection tool is the authoritative source.
# Fastest CLI alternative — fetch as Googlebot user agent:
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
     https://yourdomain.com/your-page \
     | grep -E "<title>|<h1>|<meta name|<link rel=\"canonical\""
```

### Validate sitemap

```bash
# Check sitemap returns 200 and valid XML
curl -I https://yourdomain.com/sitemap.xml
curl https://yourdomain.com/sitemap.xml | xmllint --noout -
```

### Validate robots.txt

```bash
curl https://yourdomain.com/robots.txt
# Verify: Sitemap line exists, no asset folders blocked
```

### Run Lighthouse SEO audit headlessly

```bash
npm install -g lighthouse
lighthouse https://yourdomain.com --only-categories=seo,performance \
  --output=json --output-path=./lighthouse-report.json
# Check: seo score >= 90, performance >= 90 target
```

### Validate JSON-LD schema

```bash
# Use the Rich Results API programmatically
curl "https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/page"}'

# Manual: paste JSON-LD at https://validator.schema.org
```

---

## Content SEO Rules

For every public page, apply these before writing content:

```
1. INTENT MATCH first — classify the query:
   Informational   → "how does X work"   → write an explainer/guide
   Navigational    → "brand login"       → direct them there fast, minimal content
   Commercial      → "best X tools"      → comparison, pros/cons, specific recommendations
   Transactional   → "buy X"             → product page, clear CTA, pricing, trust signals

2. Answer the query in the FIRST paragraph.
   Google surfaces the answer from the top of the page for featured snippets.
   Don't bury the lede with history or preamble.

3. Semantic entity coverage — include natural variations:
   Primary keyword:     "retro game emulator"
   Semantic variants:   "MAME emulator", "browser-based emulator", "classic arcade games online"
   Related entities:    "ROM files", "pixel art", "CRT filter", "frame rate throttling"

4. EEAT signals — include per page:
   Experience:      Author's direct experience with the subject
   Expertise:       Technical depth, specific correct details
   Authoritativeness: Links FROM authoritative sources, citations, data
   Trustworthiness: Author bio, date published/updated, clear attribution

5. Content freshness — add to every article page:
   <time datetime="2025-06-01">June 1, 2025</time>
   Update dateModified in JSON-LD schema on every significant edit.
```

---

## Critical Anti-Patterns

These are the most common SEO mistakes that kill rankings. Check for all of them.

```
❌ noindex on production pages
   Check: grep -r "noindex" ./src --include="*.tsx" --include="*.html"

❌ Hardcoded localhost or staging URLs in canonical/OG tags
   Check: grep -r "localhost\|staging\." ./src --include="*.tsx"

❌ metadataBase not set in Next.js root layout
   Effect: all OG/canonical URLs become relative → invalid → ignored

❌ Images without width/height attributes
   Effect: CLS score tanks, layout shifts on every page load

❌ Multiple <h1> tags on a page
   Effect: Google can't identify primary topic → ranking dilution

❌ Schema text that doesn't match visible content
   Effect: Rich result silently rejected by Google

❌ Blocking CSS/JS in robots.txt
   Effect: Google sees unstyled/broken page → reduced rankings

❌ CSR-only rendering of critical content
   Effect: Content may not be indexed or indexed with delay

❌ Redirect chains longer than one hop
   Effect: PageRank dilution at each redirect step

❌ Missing self-referencing canonicals
   Effect: Google picks a canonical for you — often the wrong one
```

---

## Dependencies & Tools

| Tool | Purpose | Install |
|------|---------|---------|
| Lighthouse CLI | SEO + performance audit | `npm install -g lighthouse` |
| Schema Validator | JSON-LD validation | https://validator.schema.org |
| Rich Results Test | Google rich result preview | https://search.google.com/test/rich-results |
| Google Search Console | Index coverage, crawl stats | https://search.google.com/search-console |
| PageSpeed Insights | CWV real-world data | https://pagespeed.web.dev |
| Screaming Frog | Full site crawl audit | https://www.screamingfrog.co.uk/seo-spider/ |
| xmllint | Sitemap XML validation | `apt install libxml2-utils` / `brew install libxml2` |