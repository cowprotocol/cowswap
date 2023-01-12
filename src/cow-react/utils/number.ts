import { DECIMAL_SEPARATOR } from '@cow/constants/format'

export function decomposeDecimal(decimal: string): [string, string] {
  const [integerPart, decimalPart] = decimal.split(DECIMAL_SEPARATOR)

  return [integerPart, decimalPart]
}
