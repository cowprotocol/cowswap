const ZERO = '0'

/**
 * Returns the trimmed value by removing trailing zeros.
 *
 * For example
 *    - 0.1 for 0.10
 *    - 0 for 0.00
 *    - 1 for 1.00
 *
 * @param value The value to trim trailing zeros from
 * @param decimalsSeparator The decimals separator to use
 * @returns The trimmed value
 */
export function trimTrailingZeros(value: string, decimalsSeparator = '.'): string {
  if (!value.includes(decimalsSeparator)) return value

  const trimmed = value.slice(0, getFirstTrailingZeroIndex(value))

  // If after trimming all we are left with just the decimal separator, we remove it (it will be presented as an integer)
  if (trimmed[trimmed.length - 1] === decimalsSeparator) return trimmed.slice(0, -1)

  return trimmed
}

/**
 * Returns the position of the last not zero number in the decimal part
 *
 * This function will be used to trim the value up to the first trailing zero index.
 *
 * i.e 3 for 0.1000
 *           0123
 *              ^
 *
 * i.e 2 for 0.0
 *           012
 *             ^
 *
 * i.e 2 for 0.0000
 *           012
 *             ^
 *
 * i.e 4 for 0.0100
 *           01234
 *               ^
 *
 * i.e 5 for 0.123
 *           012345
 *                ^
 * @param value
 * @returns
 */
function getFirstTrailingZeroIndex(value: string): number {
  for (let i = value.length - 1; i > 0; i--) {
    if (value[i] !== ZERO) return i + 1
  }

  return value.length
}
