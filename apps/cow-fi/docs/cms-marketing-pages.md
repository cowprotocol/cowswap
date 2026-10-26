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
