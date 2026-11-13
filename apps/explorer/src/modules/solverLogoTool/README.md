# Solver logo tool

Browser-local logo preparation at `/solver-logo-tool`. The lazy-loaded native React page uses Explorer's `GenericLayout`, `ButtonBase` and `Color` tokens. It is unlisted, with no menu entry.

The page applies route-only Helmet `noindex,follow` metadata. Vercel `X-Robots-Tag` headers are configured and tested for both slash and non-slash URLs; a deployed response has not been verified. No deployment or CMS changes are part of this port.

## Behaviour

- Upload SVG or PNG; position with dragging, numeric offsets, keyboard nudges, Centre and Reset; zoom from 10–800%.
- Inspect six proposed light/dark logo treatments at actual size or 2×. Context papers are 36px or 72px respectively; actual logos are 24px for Row/Winner and 18px for Stack. These are design-reference treatments, not production verification.
- Export a prepared 1024×1024 PNG, a vector SVG only for vector input, the exact original source, current settings and a preview in a ZIP. PNG sources remain raster, with resolution warnings when enlarged.
- After a real upload, optionally download an AI ZIP and copy a live prompt. The ZIP contains the original, current prepared logo/preview and settings, guidelines and two visual examples for context and spacing. ChatGPT and Claude links open separate browser chats; they do not upload files or prompts automatically. Users choose what to attach and paste.

Logo processing and pack generation happen in the browser. Existing Explorer analytics remain unchanged. Downloaded packs and AI output require human review and do not publish assets.

SVG uploads must be static and self-contained. Escaped CSS, CSS comments and `xml:base` are rejected; export a simpler SVG or use a PNG if needed. AI example downloads have a 10-second request/body deadline, and exports from a replaced source or an unmounted page are discarded.

## Source provenance

Assets were copied unchanged from the approved standalone prototype: the supplied Fibrous, Dfusion and BRRRolver logos and proposed-context screenshot. The screenshot illustrates intended treatments; it is not evidence of current production behaviour.

## Validation

- 53 tests across 11 suites passed, covering geometry, local/hostile SVG handling, ZIP binary/CRC/path safety, zoom editing, prompt metadata, asynchronous source/export races, request and response-body deadlines, thin-mark detection, disposal/recovery, Helmet cleanup and server-header configuration.
- Scoped ESLint, `tsc -p apps/explorer/tsconfig.app.json --noEmit`, `nx explorer:build:dev` and `nx run explorer:build:production --skip-nx-cache` passed.
- Browser checks covered actual SVG upload, 800% zoom, preview scales, offsets/background, keyboard positioning, PNG resolution warnings, prompt clipboard contents and safe provider links.
- Actual PNG, SVG and AI ZIP downloads passed integrity, exact-original, dimensions and settings checks, including SVG/AI export at 70%, X 10%, Y −5% and white background.
- A browser pixel comparison at those settings confirmed identical PNG/SVG rendering with conflicting root inline and stylesheet geometry, including `!important` sizing. The exported SVG remained vector and 1024×1024.
- The final reviewer returned **ship** for the incumbent utility-page scope. Saved local review captures cover desktop, mobile, the 978px viewport and expanded AI help on desktop/mobile.

Local development without a LaunchDarkly ID produces inherited console messages without affecting the tool. Deployed HTTP responses remain unverified.
