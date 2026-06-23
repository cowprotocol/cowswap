# CSP-safe error UI for `widgetIframeLoading`

Date: 2026-06-23

## Problem

When the widget iframe fails to load, `widgetIframeLoading` renders the error UI by
assigning a full HTML document to `iframe.srcdoc`. That document contains an inline
`<style>` (default look + the integrator's `loadingErrorStyles`) and an inline
`<script>` that wires the Retry button to `postMessage` the parent.

A `srcdoc` document inherits the **embedding page's** Content-Security-Policy. An
integrator with a strict `script-src` / `style-src` (no `'unsafe-inline'`) has the
inline `<script>` (and possibly the `<style>`) blocked, so the error UI is broken and
the Retry button does nothing.

## Goal

Render the error UI as a real DOM element in the **parent document** (the integrator's
bundle context) shown *instead of* the iframe, using only mechanisms that are not
subject to `'unsafe-inline'` CSP restrictions.

## Design

### Rendering & placement (swap)

- On failure, build an error `<div>` programmatically and insert it as a sibling of the
  iframe in its `parentNode`. Hide the iframe (`iframe.style.display = 'none'`) and size
  the error element to fill the iframe's box (mirror width/height).
- On retry **success**, remove the error element, restore the iframe's previous
  `display`, and reload `iframe.src = originalSrc`.
- No `srcdoc` is set anywhere. `completeCleanUpLoadCheck` resets via display + `src`
  instead of `removeAttribute('srcdoc')`.

### CSP-safe styling

- Elements created via `document.createElement`; text via `textContent`.
- Default appearance (including `:hover` / `:disabled`, which inline `.style` cannot
  express) is applied through a **constructable stylesheet**
  (`new CSSStyleSheet()` + `replaceSync` → `document.adoptedStyleSheets`), attached once
  and guarded against duplicate insertion. Constructable stylesheets are not subject to
  `style-src 'unsafe-inline'`.
- Fallback: if `adoptedStyleSheets` is unsupported, append a `<style>` element
  (best-effort; affected only on browsers old enough not to have strict CSP concerns).
- Class names are **namespaced** (`cow-swap-widget-error`,
  `cow-swap-widget-error__retry`) to avoid collisions in the now-shared parent DOM.
  These are the documented styling/override hooks. Integrators override with
  equal-or-higher specificity from their own (CSP-compliant) stylesheet.

### CSP-safe retry

- The Retry button's click handler is attached with `addEventListener` (no inline
  script) and calls the existing `checkIfCowSwapLoads()` directly — no `postMessage`
  round-trip.
- Button state (`disabled` + "Loading…") is toggled in parent JS. On probe failure the
  error UI re-renders with the button reset; on success it is removed.
- Removed: `WIDGET_LOAD_RETRY`, `WIDGET_TRANSPORT_KEY`, `isWidgetLoadRetryMessage`,
  `onRetryMessage`, and the `window` `'message'` listener.

### API change (breaking, intentional)

- Remove the `customErrorStyles` parameter from `widgetIframeLoading`.
- Remove `loadingErrorStyles` from `CowSwapWidgetProps` and its pass-through in
  `cowSwapWidget.ts`. Update JSDoc to point integrators at the namespaced class hooks.
- `onLoadingError` is unchanged.
- Remove now-dead `sanitizeInlineStyle` and `buildErrorDocument`.

## Testing

`widgetIframeLoading.test.ts` (jsdom):

- Failure (load-error event and timeout) hides the iframe and inserts the error element.
- The error element is never rendered via `iframe.srcdoc`; no inline `<script>` is created.
- Retry click runs a probe; on widget `READY` the iframe is restored and reloaded, error removed.
- Retry click while a probe is in flight does not start a second probe.
- The default stylesheet is adopted exactly once across multiple widgets/retries.
- `cancelWidgetLoading` / `onWidgetReady` still clear timers and listeners.
