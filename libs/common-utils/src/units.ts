const INTEGER_PATTERN = /^-?\d+$/

function normalizeInput(value: string | number | bigint): string {
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new TypeError(`formatUnitsSafe expected an integer-like number, received "${value}"`)
    }
    return Math.trunc(value).toString()
  }

  const trimmed = value.trim()
  if (!INTEGER_PATTERN.test(trimmed)) {
    throw new TypeError(`formatUnitsSafe expected an integer-like string, received "${value}"`)
  }
  return trimmed
}

function normalizeDecimals(decimals?: number): number {
  if (decimals === undefined) return 0
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new TypeError(`formatUnitsSafe expected a non-negative integer decimals value, received "${decimals}"`)
  }
  return decimals
}

export function formatUnitsSafe(
  value: string | number | bigint | undefined | null,
  decimals?: number,
): string {
  if (value === undefined || value === null) return ''

  const normalizedValue = normalizeInput(value)
  const normalizedDecimals = normalizeDecimals(decimals)

  if (normalizedDecimals === 0) return normalizedValue

  const isNegative = normalizedValue.startsWith('-')
  const absoluteValue = isNegative ? normalizedValue.slice(1) : normalizedValue

  const bigIntValue = BigInt(absoluteValue)
  const divisor = BigInt(10) ** BigInt(normalizedDecimals)

  const wholePart = bigIntValue / divisor
  const fractionPart = bigIntValue % divisor

  let fractionString = fractionPart.toString().padStart(normalizedDecimals, '0')
  fractionString = fractionString.replace(/0+$/, '')

  const prefix = isNegative && (wholePart !== 0n || fractionString.length > 0) ? '-' : ''
  const wholeString = wholePart.toString()

  if (!fractionString) return prefix + wholeString

  return `${prefix}${wholeString}.${fractionString}`
}

