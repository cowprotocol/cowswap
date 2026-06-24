# Design: rename `iframeStyle` → `rootStyle` and apply it to the container

**Date:** 2026-06-24
**Status:** Approved (pending spec review)
**Scope:** `@cowprotocol/widget-lib`, `apps/widget-configurator`, `apps/cow-fi`

## Problem

`createCowSwapWidget(container, props)` currently applies the `iframeStyle` param
directly to the `<iframe>` element it injects into the host's `container`. Sizing,
background, border, border-radius, positioning and the dynamic-height CSS variable
(`--dynamicHeight`) all live on the iframe.

This is awkward now that the widget renders a loading/error UI as a sibling element
inside the same `container`: the styled, sized box is the iframe, but the error UI is
a separate `<div>` appended to the (unstyled) container, so it does not inherit the
host's intended dimensions/appearance.

We want the **container** to be the single styled, sized "root" box, with the iframe
simply filling it.

## Goals

1. Rename the public param `iframeStyle` → `rootStyle` (clean breaking rename, no alias).
2. Apply `rootStyle` to the `container` (the iframe's parent) instead of the iframe.
3. The iframe becomes a fill element: `width:100%; height:100%`.
4. The `--dynamicHeight` CSS variable is set on the container.
5. The deprecated `width` / `height` / `maxHeight` params apply to the container, and
   their deprecation messages point to `rootStyle.*`.

## Non-goals

- No backward-compatible `iframeStyle` alias. The old name is removed entirely.
- No unrelated refactoring of the widget loading flow or other params.

## Design

### widget-lib core (`libs/widget-lib/src`)

**`types.ts`**
- Rename `iframeStyle?: CSS.Properties` → `rootStyle?: CSS.Properties`. Update the doc
  comment to describe it as inline styles for the outer **container** element (host page
  only; not sent into the iframe app).
- Update the three `@deprecated Use iframeStyle.width|height|maxHeight instead` comments on
  `width` / `height` / `maxHeight` to reference `rootStyle.*`.
- Update `CowSwapWidgetAppParams = Omit<CowSwapWidgetParams, 'theme' | 'hooks' | 'rootStyle'>`.

**`cowSwapWidget.ts`**
- `createIframe`: stop applying user styles to the iframe. Instead set fixed fill styles
  once: `width:100%`, `height:100%`, `border:0`, `display:block`. (The iframe keeps its
  id/src/sandbox/referrerPolicy/allow attributes.)
- Repurpose `updateIframeElement` into a container-styling function, e.g.
  `applyContainerStyles(container, params, lastDynamicHeight)`, which:
  - calls `assignElementStyles(container, params.rootStyle)`,
  - runs the deprecated-param handling (`width`/`height`/`maxHeight`) against the
    **container** — `container.style.width/height`, `container.style.maxHeight = "${n}px"` —
    with conflict/deprecation messages referencing `rootStyle.*`,
  - sets `--dynamicHeight` on the **container** when `lastDynamicHeight` is present.
- Call `applyContainerStyles(container, currentParams)` during initial setup (after the
  iframe is appended), and from the `updateParams` handler instead of `updateIframeElement`.
- `listenToHeightChanges`: keep listening via `iframe.contentWindow`, but set the
  `--dynamicHeight` var on the **container** (pass `container` in addition to `iframe`).
- `updateParams` (transport): destructure `rootStyle` out of params (replacing the current
  `iframeStyle: _iframeStyle` omission) so it is not forwarded into the iframe app.

**Note on `theme.boxShadow` deprecation:** unchanged — it still maps to `cardStyle.boxShadow`.

### widget-configurator (`apps/widget-configurator/src`) — full rename

- `AppearanceStyleControls.utils.ts`:
  - `RESPONSIVE_BLOCK_IFRAME_STYLE` → `RESPONSIVE_BLOCK_ROOT_STYLE`
  - `DEFAULT_IFRAME_STYLE_JSON` → `DEFAULT_ROOT_STYLE_JSON`
  - `PresetElement` member `'iframe'` → `'root'`; every preset's `iframe:` key → `root:`.
    (The existing positioning presets — `full-screen` `inset:0`, popups with
    `position:absolute` — translate directly: they now position the container, and the
    iframe fills it at 100%×100%.)
- `AppearanceStyleControls.component.tsx`: `preset?.iframe` → `preset?.root`;
  `iframeStyleJson` → `rootStyleJson` (state key, error var, input `name`/`value`).
- Rename the state field `iframeStyleJson` → `rootStyleJson` across:
  `configurator.types.ts`, `configurator.constants.ts`, `configurator.utils.ts`
  (`iframeStyle:` produced param → `rootStyle:`), `sidebar.component.tsx`,
  `useWidgetParamsAndSettings.ts`.
- `legacyIframeDimensions/legacyIframeDimensions.utils.ts` (+ test): the function still maps
  sizing into deprecated top-level `width`/`height`/`maxHeight` for old widget-lib releases,
  but its input param/comments rename from `iframeStyle` to `rootStyle`. (Filename may stay;
  renaming the symbol/param is sufficient.)
- `sanitizeParameters.ts` (+ test): references to `iframeStyle` → `rootStyle`
  (comments, the pruning list mention, and the snippet/test assertions on `"iframeStyle"`).
- `codeExample.constants.ts`: the `iframeStyle` description key → `rootStyle` with updated text
  ("Optional inline styles on the outer container element (host page).").
- `mapWidgetTheme.ts` (`apps/cowswap-frontend`): update the comment referencing `iframeStyle`.

### cow-fi (`apps/cow-fi`)

- `app/(main)/widget/page.tsx`: `iframeStyle: { width: '100%' }` → `rootStyle: { width: '100%' }`.

### Tests

`libs/widget-lib/src/cowSwapWidget.test.ts`:
- All params use `rootStyle` instead of `iframeStyle`.
- Style assertions move from the iframe to the **container**:
  - "updates width and default height" → assert `container.style.width/height/...`.
  - "applies rootStyle to the container" → assert `container.style.*`; also assert the iframe
    is `width:100%`, `height:100%`.
  - dynamic-height test → assert `container.style.getPropertyValue('--dynamicHeight')` and
    `container.style.height/maxHeight`.
  - deprecated width/height/maxHeight tests → assert on the container; the conflict warning
    message becomes `Both params.width and rootStyle.width have been set. ...`.

### Changeset

Add a **major** changeset for `@cowprotocol/widget-lib`:
- Document the breaking rename `iframeStyle` → `rootStyle`.
- Note the behavior change: styles now apply to the container, the iframe fills it
  (`100%`/`100%`), and `--dynamicHeight` is set on the container.
- Migration: rename `iframeStyle` → `rootStyle`; any host that previously read
  `--dynamicHeight` on the iframe should read it on the container (typically set
  `rootStyle.height: 'var(--dynamicHeight)'`).

## Risks

- **Breaking for external SDK consumers.** Mitigated by the major changeset + migration note.
- **Positioning presets** that used `position:absolute` on the iframe now position the
  container; verify the configurator presets still render correctly (manual check in the
  configurator).
- **Default iframe border.** Browsers give iframes a default border; setting `border:0` on the
  iframe ensures the container's `rootStyle` border/radius is the only visible frame.
