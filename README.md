# Loan Calculator Pro — loancalculatorpro.in

EMI, part-payment and bank-comparison calculator for Indian loans. Next.js 16
(App Router) + React 19 + Tailwind 4, with a SQLite-compatible database, a
private admin console, and a blog.

The original single-file static page is preserved at [`legacy/index.html`](legacy/index.html).

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run db:seed                # 50 Indian lenders + 2 starter guides
npm run dev                    # http://localhost:3000
```

### Required environment

Generate the secrets rather than inventing them:

```bash
npm run gen:secret                           # AUTH_SECRET + IP_SALT
npm run gen:hash -- 'your-strong-password'   # ADMIN_PASSWORD_HASH
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Drives canonical tags, sitemap, robots, OG image URLs. |
| `DATABASE_URL` / `DATABASE_AUTH_TOKEN` | `file:./data/…` locally; a Turso URL in production. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET` | The single admin account. |
| `IP_SALT` | Salt for the one-way IP hash. |
| `NEXT_PUBLIC_ADSENSE_SLOT_*` | AdSense unit ids. Blank = that slot renders nothing. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console token; emits the meta tag automatically. |

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server. |
| `npm run build` / `npm start` | Production build and serve. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint (Next + React Compiler rules). |
| `npm run db:seed` | Seed lenders and starter guides. Safe to re-run. |
| `npm run verify:examples` | Recompute every figure quoted in the marketing copy. |
| `npm run gen:secret` / `npm run gen:hash` | Generate credentials. |

**Run `npm run verify:examples` whenever you edit a worked example.** The
homepage and FAQ quote specific rupee figures; that script prints what the
engine actually produces, so a number can never drift away from the tool that
claims to have produced it.

---

## Architecture

```
app/
  (public)/            public site — shares one header/footer shell
    page.tsx           home: hero + calculator + explainer + FAQ
    [calculator]/      /home-loan-emi-calculator, /car-loan-… (6 SSG pages)
    compare-loans/     up to 4 lenders ranked by total cost
    bank-interest-rates/[loanType]/
    blog/[slug]/       + per-post opengraph-image
    faq, feedback, about, contact, privacy-policy, terms, disclaimer
  admin/
    login/             public
    (dashboard)/       everything behind requireAdmin()
  api/
    feedback, track    public writes (validated + rate limited)
    admin/*            session-guarded
  icon, apple-icon, opengraph-image, sitemap, robots, manifest
lib/
  loan.ts              amortisation engine — pure, no I/O, unit-testable
  db.ts, schema.ts     libSQL client + idempotent schema
  auth.ts              bcrypt + JWT session, login rate limiting
  seo.ts, site.ts      metadata builders, JSON-LD, keyword sets
  markdown.ts          Markdown → sanitised HTML + heading anchors
components/
  calculator/ compare/ rates/ charts/ blog/ admin/ ui/ layout/
```

### The engine

`lib/loan.ts` is the only place loan maths happens, and it is a pure module —
the same code runs during static generation and in the browser on every
keystroke. It handles the reducing-balance EMI formula, any number of one-off
prepayments plus a recurring extra payment, both `reduceTenure` and `reduceEMI`
modes, processing fee and GST, and a 0% rate (which the closed-form expression
divides by zero on).

### Charts

Hand-built SVG — donut, balance line with hover crosshair, stacked yearly bars.
No charting library, so the client bundle carries no dependency for them.

### Animation

CSS only, plus one shared `IntersectionObserver` behind `<Reveal>`. No animation
library ships to the browser.

---

## Bank interest rates

**No rates are seeded, deliberately.** Publishing an invented interest rate on a
finance site is a real liability, so the seed script creates the 50 lenders and
leaves every rate blank.

To populate them, sign in and go to `/admin/rates`. Transcribe each figure from
the lender's own published page, paste that page's URL into `source_url`, then
tick **Verified**. The API refuses to set `verified` without both a rate and a
source URL — in the CSV importer, such a row is imported unverified with a
warning rather than being trusted.

Until a row is verified the public table shows **"Not published"** and sorts it
below every verified row, so an unchecked figure can never head up a
"lowest rate first" list.

Bulk import accepts:

```csv
bank,category,loan_type,min_rate,max_rate,processing_fee,max_tenure_years,source_url,effective_date,verified
State Bank of India,public,home,8.50,9.65,0.35% of loan amount,30,https://…,2026-09-01,yes
```

Unknown banks are created automatically.

---

## Admin console

`/admin` — dashboard (traffic, feedback, content), feedback inbox with status
and private notes, activity log, the rates editor, and the blog editor with a
live search-preview.

Security posture:

- No sign-up route exists. The one account is defined by environment variables.
- Password stored as a bcrypt hash; sessions are signed JWTs in an HTTP-only cookie.
- Failed logins rate-limited to 8 per 15 minutes per hashed IP.
- `requireAdmin()` guards the layout; every admin route handler re-checks independently.
- The whole area is `noindex` and `Disallow`ed in robots.txt.
- Changing `ADMIN_EMAIL` invalidates every outstanding session immediately.

---

## Privacy and analytics

First-party, cookie-free. Each page view records the path, the referring
**host** only, a random `sessionStorage` id that dies with the tab, a coarse
device bucket, and a salted one-way hash of the IP. Raw IPs are never stored.
Visitors sending Do Not Track are skipped entirely, as are crawlers. Loan inputs
never leave the browser.

---

## SEO

- Per-page canonical URLs, OG and Twitter cards through one `pageMetadata()` builder.
- Generated OG images site-wide and per blog post (`next/og`).
- JSON-LD: Organization, WebSite + SearchAction, WebApplication, BreadcrumbList,
  FAQPage, BlogPosting, Dataset (rate tables), ItemList.
- Dynamic `sitemap.xml` including published posts; `robots.txt`; `manifest.webmanifest`.
- Keyword-exact top-level URLs for the six calculators.
- `public/ads.txt` carries the AdSense publisher line.

FAQ copy lives once in `lib/faqs.ts` and feeds both the visible accordion and the
FAQPage schema, so the two cannot drift apart.

---

## Deploying to Vercel

Serverless filesystems are read-only and ephemeral, so a local SQLite file would
lose every write. Use [Turso](https://turso.tech) — hosted libSQL, wire- and
SQL-compatible with SQLite, so no query code changes:

```bash
turso db create loancalculatorpro
turso db show loancalculatorpro --url      # -> DATABASE_URL
turso db tokens create loancalculatorpro   # -> DATABASE_AUTH_TOKEN
```

Set every variable from `.env.example` in the Vercel project (use fresh secrets,
not the development ones), point `loancalculatorpro.in` at the deployment, then
run the seed once against the production database:

```bash
DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npm run db:seed
```

### Before launch

- [ ] Replace the placeholder social URLs in `lib/site.ts` with real profiles.
- [ ] Add your legal entity name and postal address to the privacy policy.
- [ ] Create AdSense units and set the four `NEXT_PUBLIC_ADSENSE_SLOT_*` values.
- [ ] Verify the domain in Search Console and set the verification token.
- [ ] Populate and verify bank rates in `/admin/rates`.
- [ ] Confirm `ADMIN_PASSWORD_HASH` is set and no plaintext `ADMIN_PASSWORD` remains.
