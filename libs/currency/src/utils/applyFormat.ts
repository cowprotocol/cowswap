export interface FormatOptions {
  groupSeparator?: string
  decimalSeparator?: string
}

/**
 * applies number formatting to a numeric string that uses '.' as the decimal separator.
 */
export function applyFormat(value: string, format: FormatOptions = {}): string {
  const { groupSeparator = '', decimalSeparator = '.' } = format
  const [intPart, fracPart] = value.split('.')

  const formattedInt = groupSeparator ? intPart.replace(/\B(?=(\d{3})+$)/g, groupSeparator) : intPart

  return fracPart !== undefined ? formattedInt + decimalSeparator + fracPart : formattedInt
}

/**
 * Removes trailing zeros after the decimal point (and the dot itself if no decimals remain).
 */
export function stripTrailingZeros(value: string): string {
  if (!value.includes('.')) return value
  return value.replace(/\.?0+$/, '')
}
