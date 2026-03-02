export interface FormatOptions {
  groupSeparator?: string
  decimalSeparator?: string
}

/**
 * Applies a `{ groupSeparator, decimalSeparator }` format object to a decimal string.
 */
export function applyFormat(value: string, format: FormatOptions): string {
  const groupSep = format.groupSeparator ?? ''
  const decimalSep = format.decimalSeparator ?? '.'

  const [intPart, fracPart] = value.split('.')
  const sign = intPart.startsWith('-') ? '-' : ''
  const absInt = sign ? intPart.slice(1) : intPart

  const grouped = groupSep ? absInt.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep) : absInt

  const intFormatted = `${sign}${grouped}`
  return fracPart !== undefined ? `${intFormatted}${decimalSep}${fracPart}` : intFormatted
}
