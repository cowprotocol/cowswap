export interface FormatOptions {
  groupSeparator?: string
  decimalSeparator?: string
  stripTrailingZeros?: boolean
}

/**
 * Applies groupSeparator, decimalSeparator, and optional stripTrailingZeros
 * to a decimal string.
 */
export function applyFormat(value: string, format: FormatOptions): string {
  const groupSep = format.groupSeparator ?? ''
  const decimalSep = format.decimalSeparator ?? '.'
  const stripped = format.stripTrailingZeros ? stripTrailingFracZeros(value) : value

  const [intPart, fracPart] = stripped.split('.')
  const sign = intPart.startsWith('-') ? '-' : ''
  const absInt = sign ? intPart.slice(1) : intPart

  const grouped = groupSep ? absInt.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep) : absInt

  const intFormatted = `${sign}${grouped}`
  return fracPart !== undefined ? `${intFormatted}${decimalSep}${fracPart}` : intFormatted
}

function stripTrailingFracZeros(value: string): string {
  if (!value.includes('.')) return value
  return value.replace(/(\.[0-9]*[1-9])0+$|\.0+$/, '$1')
}
