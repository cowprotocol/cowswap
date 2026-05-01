import type * as CSS from 'csstype'

/**
 * Assigns camelCase CSS properties to a DOM element's style.
 * Values are stringified; callers should use explicit units in JSON (e.g. `"100px"`).
 */
export function assignElementStyles(element: HTMLElement, styles: CSS.Properties | undefined): void {
  element.removeAttribute('style')

  if (!styles) {
    return
  }

  for (const key of Object.keys(styles)) {
    const styleKey = key as keyof CSS.Properties
    const value = styles[styleKey]

    if (value === undefined || (value !== null && typeof value !== 'string')) {
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.style[styleKey as any] = value || ''
  }
}
