/**
 * Converts a number to a pixel string, or returns the string value as-is
 * @param value - Number (converted to px) or string (returned as-is)
 * @returns CSS value string or undefined
 * @example
 * toPixelValue(100) // '100px'
 * toPixelValue('50%') // '50%'
 * toPixelValue(undefined) // undefined
 */
export function toPixelValue(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}
