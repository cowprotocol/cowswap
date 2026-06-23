import type * as CSS from 'csstype'

/**
 * Assigns camelCase CSS properties to a DOM element's style.
 * String values are applied as-is; numbers are stringified (e.g. `inset: 0` → `"0"`).
 */
export function assignElementStyles(element: HTMLElement, styles: CSS.Properties | undefined): void {
  if (!styles) {
    return
  }

  element.removeAttribute('style')

  for (const key of Object.keys(styles)) {
    const styleKey = key as keyof CSS.Properties
    const value = styles[styleKey]

    if (value === undefined || value === null) {
      continue
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      continue
    }

    const styleValue = `${value}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.style[styleKey as any] = styleValue
  }
}
