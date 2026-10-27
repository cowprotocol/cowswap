# Editing Careers and Affiliate Program

The website keeps the layouts and artwork in code. English copy is edited in Strapi's **Page** collection:

- **careers**: introductory heading and description, referral card, and recruitment safety notice. Job listings and application links come from Ashby.
- **affiliate-program**: page heading (hero label), hero copy and button, process introduction and steps, benefits heading, FAQs, and footer buttons. The four statistics remain in code.
- **refer-to-earn**: the referral program details, including the approved Candidate Referral Form process.

Refer-to-Earn retains the Careers article typography and breadcrumb. To keep an empty line inside a paragraph, end each preceding line with a backslash; a blank Markdown line starts a separate paragraph with different spacing.

Keep the section order below. These are fixed templates; changing the number or order of template sections requires a corresponding code change. Titles and descriptions are editable and are not used as identifiers. Descriptions support Markdown links and emphasis; safety lists and FAQ answers also support Markdown lists. Use two trailing spaces before a newline for a deliberate line break.

## Careers section order

1. **Bottom actions**: referral card title, description, and one button.
2. **Heading**: recruitment safety notice heading and introductory text.
3. **Features**: four text items, in order: “We Never”, “What You Should Do”, “Official Communication Channels”, and the closing message. The closing item's title contains the reassurance paragraph; its description contains the sign-off.

The page's main heading and description supply the Careers introduction. Keep the four safety items and the single referral button. Button labels and destinations are editable; destinations must be a local path or a valid HTTPS URL.

## Affiliate Program section order

1. **Bottom actions**: hero title, description, and one button.
2. **Heading**: introduction above the process steps.
3. **Features**: “How it works” heading and exactly three steps. Their illustrations stay in code and follow the step order.
4. **Heading**: heading and description above the existing statistics.
5. **Features**: FAQ heading, text above the docs button, and question/answer items. Each item's title is the question and its description is the answer; FAQ items can be added or removed, keeping at least one.
6. **Bottom actions**: footer title and description; the first button is the referral CTA, the second is the docs CTA shown below the FAQs.

## Publishing

Publish the entry before deploying code that depends on it. The website uses the existing CMS cache and authenticated revalidation endpoint. Time-based refresh remains available; webhook delivery must be configured separately. Saving a CMS entry does not deploy website code.

Careers and Affiliate Program use the validated CMS copy when it is available. If fetching or validation fails, they render the published-copy snapshot in `apps/cow-fi/data/marketingContentFallback.json`. This also covers a fresh build with no CMS cache. Careers continues to load job listings from Ashby independently.

The snapshot is an availability fallback and can be older than the CMS. Refresh it when approving changes that must also apply during an outage, especially referral rewards, safety notices, or program terms. Fix and republish invalid CMS edits to restore the current copy through the normal refresh cycle.

## CMS failure regression check

Run `pnpm exec nx run cow-fi:test-cms-resilience`. The same check runs in GitHub Actions for changes to cow.fi, its shared libraries, or the check itself.

It builds the entire production site twice with an isolated local CMS: once returning HTTP 503, then returning an incomplete page template. Each build starts with a fresh cache. It discovers static pages and generated dynamic URLs from Next.js's manifests, starts the production server, and requests every discovered URL. New static pages and generated URLs are included automatically.

The check rejects failed builds, HTTP server errors, streamed error responses hidden behind HTTP 200, unexpected not-found pages, and missing fallback copy on Careers or Affiliate Program. Existing CMS-only documents and article pagination explicitly allow not-found responses when their content is unavailable. A new exception must be added deliberately in `tools/scripts/cow-fi-cms-resilience.mjs`; there is no blanket allowance for future pages.

Dynamic URLs that are not generated during the build still need a representative test case. This check verifies availability under the two CMS failure scenarios; content-specific behavior remains covered by route/parser tests.

Test output and logs are stored in `apps/cow-fi/.next-cms-resilience/`. The check restores Next.js's generated changes to `tsconfig.json` and `next-env.d.ts` after it finishes.
