/**
 * Lightweight, dependency-free formatter that converts atom amounts to human-readable units.
 * - Accepts string | number | bigint inputs
 * - Handles negatives and trims trailing zeros in the fractional part
 * - Returns an empty string for undefined/null inputs
 */
export function formatUnitsSafe(value: string | number | bigint | undefined | null, decimals?: number): string {
  if (value === undefined || value === null) return ''
  const raw = typeof value === 'bigint' ? value.toString() : String(value)
  if (!decimals || decimals <= 0) return raw

  const negative = raw.startsWith('-')
  const digits = negative ? raw.slice(1) : raw

  const pad = decimals - digits.length + 1
  const padded = pad > 0 ? '0'.repeat(pad) + digits : digits
  const pointIndex = padded.length - decimals
  const integerPart = padded.slice(0, pointIndex)
  const fractionalPart = padded.slice(pointIndex).replace(/0+$/, '')
  const result = fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart

  return negative ? `-${result}` : result
}
