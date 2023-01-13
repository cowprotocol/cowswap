import { DECIMAL_SEPARATOR } from '@cow/constants/format'

export function decomposeDecimal(decimal: string, exactDecimals?: number): [string, string] {
  const [integerPart, decimalPart] = decimal.split(DECIMAL_SEPARATOR)

  // If we asked for the exactDecimals and the decimal part does not match that...
  if (exactDecimals && decimalPart && decimalPart.length !== exactDecimals) {
    const dPart =
      decimalPart.length > exactDecimals
        ? // If there are more than expected, cut it out
          decimalPart.slice(0, exactDecimals)
        : // If there are less than expected, pad it with 0s
          decimalPart + '0'.repeat(exactDecimals - decimalPart.length)
    return [integerPart, dPart]
  }

  return [integerPart, decimalPart]
}
