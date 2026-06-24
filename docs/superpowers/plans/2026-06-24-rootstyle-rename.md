# `rootStyle` Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the widget param `iframeStyle` → `rootStyle` and apply it to the host container (the iframe's parent) instead of the iframe, with the iframe filling the container.

**Architecture:** The host `container` becomes the single styled/sized "root" box: `rootStyle`, the deprecated `width`/`height`/`maxHeight`, and the `--dynamicHeight` CSS var all go on the container. The injected `<iframe>` becomes a dumb fill element (`width:100%; height:100%; border:0; display:block`). All internal consumers (widget-configurator, cow-fi) are renamed to match. Clean breaking rename — no `iframeStyle` alias.

**Tech Stack:** TypeScript, Jest (jsdom), Nx monorepo, csstype, changesets.

## Global Constraints

- **No `iframeStyle` alias** — the old param name is removed entirely.
- **Breaking change** — must ship with a **major** changeset for `@cowprotocol/widget-lib`.
- Follow existing code style; do not reformat unrelated code.
- `theme.boxShadow` → `cardStyle.boxShadow` deprecation behavior is **unchanged**.
- Run widget-lib tests with: `npx nx test widget-lib`
- Run configurator tests with: `npx nx test widget-configurator`

---

### Task 1: widget-lib — rename `iframeStyle` → `rootStyle` and move styling to the container

**Files:**
- Modify: `libs/widget-lib/src/types.ts`
- Modify: `libs/widget-lib/src/cowSwapWidget.ts`
- Test: `libs/widget-lib/src/cowSwapWidget.test.ts`

**Interfaces:**
- Consumes: `assignElementStyles(element: HTMLElement, styles: CSS.Properties | undefined)` (unchanged), `isCowSwapWidgetPalette`, `WidgetMethodsEmit`.
- Produces:
  - `CowSwapWidgetParams.rootStyle?: CSS.Properties` (replaces `iframeStyle`)
  - `CowSwapWidgetAppParams = Omit<CowSwapWidgetParams, 'theme' | 'hooks' | 'rootStyle'>`
  - internal `applyContainerStyles(container: HTMLElement, params: CowSwapWidgetParams, lastDynamicHeight?: string): void` (replaces `updateIframeElement`)
  - internal `listenToHeightChanges(container: HTMLElement, iframe: HTMLIFrameElement, iframeOrigin: string, setLastDynamicHeight: (nextHeight: string) => void): WindowListener[]`

- [ ] **Step 1: Update the tests to describe the new behavior (failing).**

In `libs/widget-lib/src/cowSwapWidget.test.ts` make the following replacements.

Replace the first test (`updates iframe width and default height when params change`) body so it reads the container instead of the iframe:

```ts
  it('updates container width and default height when params change', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        rootStyle: {
          width: '100%',
          height: '640px',
          backgroundColor: 'red',
          borderRadius: '1.6rem',
        },
      },
    })
    widgetHandlers.push(handler)

    expect(container.style.width).toBe('100%')
    expect(container.style.height).toBe('640px')
    expect(container.style.backgroundColor).toBe('red')
    expect(container.style.borderRadius).toBe('1.6rem')

    handler.updateParams({
      appCode: 'widget-test',
      rootStyle: {
        width: '320px',
        height: '432px',
        backgroundColor: 'transparent',
        borderRadius: '0',
      },
    })

    expect(container.style.width).toBe('320px')
    expect(container.style.height).toBe('432px')
    expect(container.style.backgroundColor).toBe('transparent')
    expect(container.style.borderRadius).toBe('0')
  })
```

Replace the `applies iframeStyle to the iframe` test with one that asserts the container styling and the iframe fill:

```ts
  it('applies rootStyle to the container and makes the iframe fill it', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          rootStyle: { backgroundColor: 'blue', margin: '12px', border: '2px solid green' },
        },
      }),
    )

    expect(container.style.backgroundColor).toBe('blue')
    expect(container.style.margin).toBe('12px')
    expect(container.style.border).toBe('2px solid green')

    const iframe = getIframe(container)
    expect(iframe.style.width).toBe('100%')
    expect(iframe.style.height).toBe('100%')
  })
```

Replace the dynamic-height test body so the var and sizing are read off the container:

```ts
  it('updates the dynamic height css variable on resize events', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        rootStyle: { height: '640px' },
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 400 })
    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('400px')

    handler.updateParams({
      appCode: 'widget-test',
      rootStyle: { height: '432px', maxHeight: '350px' },
    })

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 500 })
    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('500px')
    expect(container.style.height).toBe('432px')
    expect(container.style.maxHeight).toBe('350px')

    emitWidgetEvent(iframe, WidgetMethodsEmit.SET_FULL_HEIGHT, {})
    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('100dvh')
  })
```

Replace the `applies deprecated width and height on create and updateParams` test so it reads container style (note: deprecated dims now use `container.style.*`, not the iframe `width`/`height` attributes):

```ts
  it('applies deprecated width and height on create and updateParams', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => void 0)
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        width: '100%',
        height: '640px',
      },
    })
    widgetHandlers.push(handler)

    expect(container.style.width).toBe('100%')
    expect(container.style.height).toBe('640px')

    handler.updateParams({
      appCode: 'widget-test',
      width: '320px',
      height: '432px',
    })

    expect(container.style.width).toBe('320px')
    expect(container.style.height).toBe('432px')
    warnSpy.mockRestore()
  })
```

Replace the `applies deprecated maxHeight on the iframe without clamping dynamic height` test:

```ts
  it('applies deprecated maxHeight on the container without clamping dynamic height', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        rootStyle: { height: 'var(--dynamicHeight)' },
        maxHeight: 400,
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 500 })

    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('500px')
    expect(container.style.maxHeight).toBe('400px')
  })
```

Replace the `warns when deprecated width conflicts with iframeStyle.width` test:

```ts
  it('warns when deprecated width conflicts with rootStyle.width', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => void 0)
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          width: '100%',
          rootStyle: { width: '320px' },
        },
      }),
    )

    expect(warnSpy).toHaveBeenCalledWith(
      'Both params.width and rootStyle.width have been set. params.width will be ignored.',
    )
    expect(container.style.width).toBe('320px')

    warnSpy.mockRestore()
  })
```

- [ ] **Step 2: Run the tests to verify they fail.**

Run: `npx nx test widget-lib`
Expected: FAIL — the rewritten tests reference `rootStyle` (a property that does not exist yet on `CowSwapWidgetParams`) and assert container styles the implementation does not set. TypeScript compile error on `rootStyle` and/or assertion failures.

- [ ] **Step 3: Rename the param in `types.ts`.**

In `libs/widget-lib/src/types.ts`:

Change the three deprecated doc comments from `iframeStyle.*` to `rootStyle.*`:
- `@deprecated Use iframeStyle.width instead.` → `@deprecated Use rootStyle.width instead.`
- `@deprecated Use iframeStyle.height instead.` → `@deprecated Use rootStyle.height instead.`
- `@deprecated Use iframeStyle.maxHeight instead.` → `@deprecated Use rootStyle.maxHeight instead.`

Replace the `iframeStyle` property block:

```ts
  /**
   * Extra inline styles for the outer container element (host page only; not sent into the iframe app).
   * Applied after width/height attributes. Use e.g. `backgroundColor`, `borderRadius`, `boxShadow`, `border`.
   * The injected iframe fills this container. Use `height: 'var(--dynamicHeight)'` here for dynamic height.
   */
  rootStyle?: CSS.Properties
```

Update the app-params Omit:

```ts
export type CowSwapWidgetAppParams = Omit<CowSwapWidgetParams, 'theme' | 'hooks' | 'rootStyle'>
```

- [ ] **Step 4: Make the iframe a fill element in `createIframe`.**

In `libs/widget-lib/src/cowSwapWidget.ts`, replace the body of `createIframe`:

```ts
function createIframe(params: CowSwapWidgetParams): HTMLIFrameElement {
  const iframe = document.createElement('iframe')

  iframe.id = WIDGET_IFRAME_ID
  iframe.src = buildWidgetUrl(params)
  iframe.setAttribute('sandbox', WIDGET_IFRAME_SANDBOX)
  iframe.referrerPolicy = WIDGET_IFRAME_REFERRER_POLICY
  iframe.allow = WIDGET_IFRAME_ALLOW

  // The container carries the user's rootStyle; the iframe simply fills it.
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = '0'
  iframe.style.display = 'block'

  return iframe
}
```

- [ ] **Step 5: Replace `updateIframeElement` with `applyContainerStyles`.**

In `libs/widget-lib/src/cowSwapWidget.ts`, replace the entire `updateIframeElement` function with:

```ts
function applyContainerStyles(container: HTMLElement, params: CowSwapWidgetParams, lastDynamicHeight?: string): void {
  assignElementStyles(container, params.rootStyle)

  const deprecatedParams = [
    {
      name: 'params.width',
      value: params.width,
      replacementName: 'rootStyle.width',
      replacementValue: params.rootStyle?.width,
      applyDeprecated: () => (params.width ? (container.style.width = params.width) : void 0),
    },
    {
      name: 'params.height',
      value: params.height,
      replacementName: 'rootStyle.height',
      replacementValue: params.rootStyle?.height,
      applyDeprecated: () => (params.height ? (container.style.height = params.height) : void 0),
    },
    {
      name: 'params.maxHeight',
      value: params.maxHeight,
      replacementName: 'rootStyle.maxHeight',
      replacementValue: params.rootStyle?.maxHeight,
      applyDeprecated: () => (params.maxHeight ? (container.style.maxHeight = `${params.maxHeight}px`) : void 0),
    },
    {
      name: 'params.theme.boxShadow',
      value: isCowSwapWidgetPalette(params.theme) ? params.theme.boxShadow : undefined,
      replacementName: 'cardStyle.boxShadow',
      replacementValue: params.cardStyle?.boxShadow,
      applyDeprecated: () => void 0,
    },
  ].filter((paramConfig) => !!paramConfig.value)

  deprecatedParams.forEach((param) => {
    if (param.replacementValue) {
      console.warn(`Both ${param.name} and ${param.replacementName} have been set. ${param.name} will be ignored.`)
    } else {
      console.warn(`${param.name} is deprecated. Use ${param.replacementName} instead.`)
      param.applyDeprecated()
    }
  })

  if (lastDynamicHeight) container.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, lastDynamicHeight)
}
```

- [ ] **Step 6: Apply container styles at create time and on updateParams.**

In `createCowSwapWidget`, after `container.appendChild(iframe)` (the `// 2. Clear the content` block), add the container styling call:

```ts
  // 2. Clear the content (delete any previous iFrame if it exists)
  container.innerHTML = ''
  container.appendChild(iframe)

  // Style the container (the root box). The iframe fills it.
  applyContainerStyles(container, currentParams)
```

In the returned handler's `updateParams`, replace the `updateIframeElement(...)` call:

```ts
    updateParams: (newParams: CowSwapWidgetParams) => {
      if (!iframeWindow) return
      currentParams = resolveWidgetParams(newParams)

      applyContainerStyles(container, currentParams, lastDynamicHeight)
      updateParams(iframeWindow, iframeOrigin, currentParams, provider)
      updateInterceptDeepLinks()
      updateWidgetHooks()
    },
```

- [ ] **Step 7: Set the dynamic-height var on the container in `listenToHeightChanges`.**

Replace the `listenToHeightChanges` function with the container-targeted version:

```ts
function listenToHeightChanges(
  container: HTMLElement,
  iframe: HTMLIFrameElement,
  iframeOrigin: string,
  setLastDynamicHeight: (nextHeight: string) => void,
): WindowListener[] {
  if (!iframe.contentWindow) return []

  return [
    widgetIframeTransport.listenToMessageFromWindow(
      window,
      iframe.contentWindow,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      (data) => {
        const nextHeight = `${(data?.height ?? 0) + HEIGHT_THRESHOLD}px`
        container.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, nextHeight)
        setLastDynamicHeight(nextHeight)
      },
      iframeOrigin,
    ),
    widgetIframeTransport.listenToMessageFromWindow(
      window,
      iframe.contentWindow,
      WidgetMethodsEmit.SET_FULL_HEIGHT,
      () => {
        container.style.setProperty(DYNAMIC_HEIGHT_CSS_VAR, '100dvh')
        setLastDynamicHeight('100dvh')
      },
      iframeOrigin,
    ),
  ]
}
```

Update its caller inside `setup()` (step 4 comment block) to pass the container:

```ts
    // 4. Handle widget height changes (re-registered when params change so defaults/maxHeight stay in sync)
    heightChangeListeners = listenToHeightChanges(container, iframe, iframeOrigin, (nextHeight) => {
      lastDynamicHeight = nextHeight
    })
```

- [ ] **Step 8: Stop forwarding `rootStyle` into the iframe app.**

In the `updateParams` transport function, replace the destructure that omits host-only styles:

```ts
  // Omit theme, hooks, and host-only container styles from appParams
  const { theme: _theme, hooks: _hooks, rootStyle: _rootStyle, ...appParams } = params
```

- [ ] **Step 9: Run the tests to verify they pass.**

Run: `npx nx test widget-lib`
Expected: PASS — all `cowSwapWidget.test.ts` tests green. (The `theme.boxShadow` deprecation tests are unaffected and still pass.)

- [ ] **Step 10: Verify no stray `iframeStyle` references remain in widget-lib.**

Run: `grep -rn "iframeStyle" libs/widget-lib/src`
Expected: no output.

- [ ] **Step 11: Commit.**

```bash
git add libs/widget-lib/src/types.ts libs/widget-lib/src/cowSwapWidget.ts libs/widget-lib/src/cowSwapWidget.test.ts
git commit -m "feat(widget)!: rename iframeStyle to rootStyle and apply it to the container

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017Mf885b1rsigiC8BdZBj3e"
```

---

### Task 2: widget-configurator + cow-fi — rename `iframeStyle`/`iframeStyleJson` → `rootStyle`/`rootStyleJson`

**Files:**
- Modify: `apps/widget-configurator/src/components/controls/AppearanceStyleControls/AppearanceStyleControls.utils.ts`
- Modify: `apps/widget-configurator/src/components/controls/AppearanceStyleControls/AppearanceStyleControls.component.tsx`
- Modify: `apps/widget-configurator/src/configurator.types.ts`
- Modify: `apps/widget-configurator/src/configurator.constants.ts`
- Modify: `apps/widget-configurator/src/configurator.utils.ts`
- Modify: `apps/widget-configurator/src/components/sidebar/sidebar.component.tsx`
- Modify: `apps/widget-configurator/src/hooks/useWidgetParamsAndSettings.ts`
- Modify: `apps/widget-configurator/src/utils/legacyIframeDimensions/legacyIframeDimensions.utils.ts`
- Test: `apps/widget-configurator/src/utils/legacyIframeDimensions/legacyIframeDimensions.utils.test.ts`
- Modify: `apps/widget-configurator/src/components/snippet/code-example-templates/sanitizeParameters.ts`
- Test: `apps/widget-configurator/src/components/snippet/code-example-templates/sanitizeParameters.test.ts`
- Modify: `apps/widget-configurator/src/components/snippet/code-example-templates/common/codeExample.constants.ts`
- Modify: `apps/cowswap-frontend/src/theme/mapWidgetTheme.ts`
- Modify: `apps/cow-fi/app/(main)/widget/page.tsx`

**Interfaces:**
- Consumes from Task 1: `CowSwapWidgetParams.rootStyle`, `CowSwapWidgetAppParams`.
- Produces: configurator state field `rootStyleJson` and resolved field `rootStyle`; preset element key `'root'`; constants `RESPONSIVE_BLOCK_ROOT_STYLE`, `DEFAULT_ROOT_STYLE_JSON`.

- [ ] **Step 1: Update the configurator tests first (failing).**

In `apps/widget-configurator/src/utils/legacyIframeDimensions/legacyIframeDimensions.utils.test.ts`, replace the description `maps width and height from iframeStyle` with `maps width and height from rootStyle` (test logic unchanged — it calls `getLegacyIframeDimensionParams(...)` with a CSS object, which is unaffected by the param rename).

In `apps/widget-configurator/src/components/snippet/code-example-templates/sanitizeParameters.test.ts`:
- Change the test description `omits deprecated top-level width when iframeStyle carries sizing` → `omits deprecated top-level width when rootStyle carries sizing`.
- Change the input `iframeStyle: { width: '100%', height: 'var(--dynamicHeight)' }` → `rootStyle: { width: '100%', height: 'var(--dynamicHeight)' }`.
- Change the assertion `expect(snippet).toContain('"iframeStyle"')` → `expect(snippet).toContain('"rootStyle"')`.

- [ ] **Step 2: Run configurator tests to verify failure.**

Run: `npx nx test widget-configurator`
Expected: FAIL — `sanitizeParameters.test.ts` now expects `"rootStyle"` in the snippet, but the code still emits `iframeStyle`.

- [ ] **Step 3: Rename the appearance-style constants and preset keys.**

In `AppearanceStyleControls.utils.ts`:
- `RESPONSIVE_BLOCK_IFRAME_STYLE` → `RESPONSIVE_BLOCK_ROOT_STYLE` (declaration + the reference inside the `responsive-block` preset).
- `DEFAULT_IFRAME_STYLE_JSON` → `DEFAULT_ROOT_STYLE_JSON`.
- `type PresetElement = 'iframe' | 'bodyWrapper' | 'card'` → `type PresetElement = 'root' | 'bodyWrapper' | 'card'`.
- In every preset object, rename the `iframe:` key to `root:` (occurrences at `responsive-block`, `full-screen`, `bottom-right-popup`, `right-sidebar`, `modal`, `debug` — all the `iframe:` keys returned by `getAppearanceStylePresets`).

- [ ] **Step 4: Update the appearance-style component.**

In `AppearanceStyleControls.component.tsx`:
- `applyPresetStyle((styleValue) => onChange('iframeStyleJson', styleValue), preset?.iframe)` → `applyPresetStyle((styleValue) => onChange('rootStyleJson', styleValue), preset?.root)`.
- `const iframeStyleJsonError = useAsyncJsonError(values.iframeStyleJson)` → `const rootStyleJsonError = useAsyncJsonError(values.rootStyleJson)`.
- Input props: `name="iframeStyleJson"` → `name="rootStyleJson"`, `value={values.iframeStyleJson}` → `value={values.rootStyleJson}`, `error={iframeStyleJsonError.error}` → `error={rootStyleJsonError.error}`, `helperText={iframeStyleJsonError.helperText}` → `helperText={rootStyleJsonError.helperText}`.

- [ ] **Step 5: Rename the state field in types and constants.**

In `configurator.types.ts`:
- `iframeStyleJson: string | null` → `rootStyleJson: string | null` (in `ConfiguratorFormValues`).
- In the `ConfiguratorState extends Omit<ConfiguratorFormValues, ...>` union: `| 'iframeStyleJson'` → `| 'rootStyleJson'`.
- `iframeStyle: CSS.Properties` → `rootStyle: CSS.Properties` (in `ConfiguratorState`).

In `configurator.constants.ts`:
- import `DEFAULT_IFRAME_STYLE_JSON` → `DEFAULT_ROOT_STYLE_JSON`.
- `iframeStyleJson: DEFAULT_IFRAME_STYLE_JSON,` → `rootStyleJson: DEFAULT_ROOT_STYLE_JSON,`.

- [ ] **Step 6: Rename in `configurator.utils.ts`.**

In `buildConfiguratorState`:
- destructure `iframeStyleJson,` → `rootStyleJson,`.
- `iframeStyle: parseJsonOrFallback<CSS.Properties>(iframeStyleJson, {}),` → `rootStyle: parseJsonOrFallback<CSS.Properties>(rootStyleJson, {}),`.

- [ ] **Step 7: Rename in `sidebar.component.tsx`.**

Change the persisted-field entry `'iframeStyleJson',` → `'rootStyleJson',` (line ~50, in the list of fields).

- [ ] **Step 8: Rename in `useWidgetParamsAndSettings.ts`.**

- destructure `iframeStyle,` → `rootStyle,` (in the `// Layout:` block).
- `const legacyIframeDimensionParams = getLegacyIframeDimensionParams(iframeStyle)` → `getLegacyIframeDimensionParams(rootStyle)`.
- In the returned params `// Layout:` block, `iframeStyle,` → `rootStyle,`.

- [ ] **Step 9: Rename the param in the legacy-dimensions util.**

In `legacyIframeDimensions.utils.ts` (keep the function name `getLegacyIframeDimensionParams` and filename), rename the parameter and update the doc comment:

```ts
/**
 * Maps rootStyle sizing into deprecated top-level params for widget-lib releases
 * that predate `rootStyle` (they only read `width` / `height` / `maxHeight`).
 */
export function getLegacyIframeDimensionParams(
  rootStyle: CSS.Properties,
): Pick<CowSwapWidgetParams, 'width' | 'height' | 'maxHeight'> {
  return {
    width: asCssDimension(rootStyle.width),
    height: asCssDimension(rootStyle.height),
    maxHeight: asPixels(rootStyle.maxHeight),
  }
}
```

- [ ] **Step 10: Rename in `sanitizeParameters.ts`.**

- Comment: `/** Prunes empty/false leaves inside nested param values (sell, iframeStyle, disableTrade, …). */` → `(sell, rootStyle, disableTrade, …)`.
- Comment block before the `delete sanitized.width/height/maxHeight` lines:

```ts
  // Preview maps rootStyle into deprecated top-level width/height/maxHeight for older widget-lib
  // consumers. Copied snippets should only include rootStyle (widget-lib applies layout there).
```

- [ ] **Step 11: Rename in `codeExample.constants.ts`.**

Change the description key `iframeStyle: 'Optional inline styles on the outer iframe element (host page).'` → `rootStyle: 'Optional inline styles on the outer container element (host page).'`.

- [ ] **Step 12: Update the comment in `mapWidgetTheme.ts`.**

In `apps/cowswap-frontend/src/theme/mapWidgetTheme.ts`, change the comment referencing `iframeStyle` to `rootStyle`:
`` * `iframeStyle`, `bodyWrapperStyle`, and `cardStyle` instead of the palette. `` → `` * `rootStyle`, `bodyWrapperStyle`, and `cardStyle` instead of the palette. ``

- [ ] **Step 13: Rename in the cow-fi demo page.**

In `apps/cow-fi/app/(main)/widget/page.tsx`: `iframeStyle: { width: '100%' },` → `rootStyle: { width: '100%' },`.

- [ ] **Step 14: Verify no stray `iframeStyle`/`iframeStyleJson` references remain.**

Run: `grep -rn "iframeStyle" apps/ libs/ --include="*.ts" --include="*.tsx" | grep -v node_modules`
Expected: no output (the `getLegacyIframeDimensionParams` function name and `legacyIframeDimensions` path remain, but they do not contain the substring `iframeStyle`).

- [ ] **Step 15: Run configurator tests + typecheck.**

Run: `npx nx test widget-configurator`
Expected: PASS.

Run: `npx nx run widget-configurator:typecheck` (or `npx tsc -p apps/widget-configurator/tsconfig.json --noEmit` if no typecheck target)
Expected: no type errors.

- [ ] **Step 16: Commit.**

```bash
git add apps/widget-configurator apps/cowswap-frontend/src/theme/mapWidgetTheme.ts "apps/cow-fi/app/(main)/widget/page.tsx"
git commit -m "refactor(widget-configurator): rename iframeStyle to rootStyle

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017Mf885b1rsigiC8BdZBj3e"
```

---

### Task 3: Add the breaking-change changeset

**Files:**
- Create: `.changeset/widget-rootstyle-rename.md`

- [ ] **Step 1: Write the changeset.**

Create `.changeset/widget-rootstyle-rename.md`:

```markdown
---
'@cowprotocol/widget-lib': major
---

Rename the `iframeStyle` param to `rootStyle` and apply it to the host container (the iframe's parent) instead of the iframe.

The container is now the styled, sized "root" box; the injected iframe fills it (`width: 100%; height: 100%`). The `--dynamicHeight` CSS variable is now set on the container.

**Migration:**

- Rename `iframeStyle` → `rootStyle` in your widget params.
- If you relied on the dynamic-height variable, set it on the container via `rootStyle: { height: 'var(--dynamicHeight)' }` (previously applied to the iframe).
- The deprecated `width` / `height` / `maxHeight` params now apply to the container and their deprecation messages point to `rootStyle.*`.
```

- [ ] **Step 2: Commit.**

```bash
git add .changeset/widget-rootstyle-rename.md
git commit -m "chore: changeset for rootStyle rename

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017Mf885b1rsigiC8BdZBj3e"
```

---

## Self-Review notes

- **Spec coverage:** Goal 1 (rename) → Task 1 steps 3, 8 + Task 2. Goal 2 (apply to container) → Task 1 steps 5–6. Goal 3 (iframe fills) → Task 1 step 4. Goal 4 (dynamic var on container) → Task 1 step 7. Goal 5 (deprecated dims on container + messages) → Task 1 step 5. Changeset → Task 3. Configurator full rename + cow-fi + mapWidgetTheme → Task 2. All covered.
- **Type consistency:** `applyContainerStyles(container, params, lastDynamicHeight?)` and `listenToHeightChanges(container, iframe, iframeOrigin, setLastDynamicHeight)` signatures match all call sites updated in Task 1. `rootStyle` / `rootStyleJson` names are consistent across Task 2 files.
- **Note on `assignElementStyles`:** it calls `element.removeAttribute('style')` only when `rootStyle` is defined, then reapplies — this is why `lastDynamicHeight` is re-set at the end of `applyContainerStyles` (same pattern as the previous iframe implementation). Behavior preserved.
