---
"@cowprotocol/widget-lib": major
---

Rename the `iframeStyle` param to `rootStyle` and apply it to the host container (the iframe's parent) instead of the iframe.

The container is now the styled, sized "root" box; the injected iframe fills it (`width: 100%; height: 100%`). The `--dynamicHeight` CSS variable is now set on the container.

**Migration:**

- Rename `iframeStyle` → `rootStyle` in your widget params.
- If you relied on the dynamic-height variable, set it on the container via `rootStyle: { height: 'var(--dynamicHeight)' }` (previously applied to the iframe).
- The deprecated `width` / `height` / `maxHeight` params now apply to the container and their deprecation messages point to `rootStyle.*`.
