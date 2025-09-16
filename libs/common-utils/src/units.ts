/**
 * Lightweight, dependency-free formatter that converts atom amounts to human-readable units.
 * - Accepts string | number | bigint inputs
 * - Handles negatives and trims trailing zeros in the fractional part
 * - Returns an empty string for undefined/null inputs
 */
export function formatUnitsSafe(value: string | number | bigint | undefined | null, decimals?: number): string {
  const normalized = sanitizeIntegerLikeValue(value)
  if (!normalized) return ''
  if (!decimals || decimals <= 0) return normalized

  return applyDecimals(normalized, decimals)
}

function sanitizeIntegerLikeValue(value: string | number | bigint | undefined | null): string {
  if (value === undefined || value === null) return ''

  const raw = typeof value === 'bigint' ? value.toString() : String(value)
  const normalized = raw.trim()

  if (!/^-?\d+$/.test(normalized)) {
    throw new TypeError(`formatUnitsSafe expected an integer-like value, received "${raw}"`)
  }

  return normalized
}

function applyDecimals(normalized: string, decimals: number): string {
  const negative = normalized.startsWith('-')
  const digits = negative ? normalized.slice(1) : normalized

  const pad = decimals - digits.length + 1
  const padded = pad > 0 ? '0'.repeat(pad) + digits : digits
  const pointIndex = padded.length - decimals
  const integerPart = padded.slice(0, pointIndex)
  const fractionalPart = padded.slice(pointIndex).replace(/0+$/, '')
  const result = fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart

  return negative ? `-${result}` : result
}
