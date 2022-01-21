import BigNumber from 'bignumber.js'

import { formatSmart as _formatSmart } from '@gnosis.pm/dex-js'
import { Currency, CurrencyAmount, Percent, Fraction } from '@uniswap/sdk-core'
import {
  DEFAULT_DECIMALS,
  DEFAULT_PRECISION,
  DEFAULT_SMALL_LIMIT,
  FULL_PRICE_PRECISION,
  LONG_PRECISION,
} from 'constants/index'

const TEN = new BigNumber(10)

export const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
})

export function formatAtoms(amount: string, decimals: number): string {
  return new BigNumber(amount).div(TEN.pow(decimals)).toString(10)
}

export interface FormatSmartOptions {
  thousandSeparator?: boolean
  smallLimit?: string
  isLocaleAware?: boolean
}

/**
 * Gets/adjusts small limits based on the amount of decimals to show
 *
 * - When `smallLimit` is set, use that
 * - When `decimalsToShow` < 1, return `1`
 * - When `decimalsToShow` < `DEFAULT_PRECISION`, reduce `smallLimit` to match precision
 * - Otherwise, use `DEFAULT_SMALL_LIMIT`, which matches `DEFAULT_PRECISION`
 *
 * @param smallLimit
 * @param decimalsToShow
 */
function _buildSmallLimit(smallLimit: string | undefined, decimalsToShow: number): string {
  if (smallLimit) {
    // explicitly set, use that
    return smallLimit
  }
  if (decimalsToShow < 1) {
    // special case when there's no decimal to display
    return '1'
  }
  if (decimalsToShow < DEFAULT_PRECISION) {
    // showing less than default precision, adjust small limit to avoid something like:
    // < 0.0000000001 when decimals to show =2 and the value is 0.00312
    return '0.' + '0'.repeat(decimalsToShow - 1) + '1'
  }
  // stick to default smallLimit (0.000001), which matches DEFAULT_PRECISION (6)
  return DEFAULT_SMALL_LIMIT
}

/**
 * Gets/adjusts CurrencyAmount display amount and precision
 *
 * Additional adjustment might be required in case amount is smaller than 1 token atom.
 * E.g.:
 *   Token decimals: `2`; value: `0.001`
 *   Without adjustment, we'll have `precision:2` and `amount:0`.
 *   This is formatted to `0`, which is not entirely true, but the formatter doesn't know there are more stuff.
 *
 *   So we get the remainder of the division and add as many decimals as needed to precision:
 *   Remainder: `0.1`; extra decimals: `1`
 *   => amount: 1
 *   => precision: precision + extra decimals => 2 + 1 => 3
 *
 *   When formatting, smallLimit will be set to 0.01, formatting the result as `< 0.01`
 *
 * @param value
 */
function _adjustCurrencyAmountPrecision(value: CurrencyAmount<Currency>): { amount: string; precision: number } {
  // Amount is in atoms, need to convert it to units by setting precision = token.decimals
  let precision = value.currency.decimals
  // Returns an integer value rounded down
  let amount = value.quotient.toString()

  // If given amount is zero it means  we have less that 1 atom
  // Adjust the precision and amount to indicate value is >0, even though tiny
  if (+amount === 0) {
    const remainder = value.remainder.toSignificant(1) // get only the first digit of the remainder
    // It can happen that remainder is `1`.
    // I know, how can the rest of the division be 1 is quotient is 0? o.O
    // Turns out the answer is rounding.
    // Requesting toSignificant(1) can return `0` if the value is something like 0.9
    // For this reason, we only remove `0.` and increase the precision if necessary
    let decimalPart = remainder
    if (/^0\./.test(remainder)) {
      decimalPart = remainder.slice(2) // drop `0.` part
      precision += decimalPart.length // how many more digits do we have? add that to the precision
    }
    amount = decimalPart.replace(/^0+/, '') // remove potential leading zeros, precision already accounts for it
  }
  return { amount, precision }
}

/**
 * formatSmart
 * @param value
 * @param decimalsToShow
 * @param options
 * @returns string or undefined
 */
export function formatSmart(
  value: CurrencyAmount<Currency> | Percent | BigNumber | Fraction | null | undefined,
  decimalsToShow: number = DEFAULT_PRECISION,
  options?: FormatSmartOptions
) {
  if (!value) return

  let precision
  let amount
  let smallLimitPrecision
  if (value instanceof CurrencyAmount) {
    const adjustedValues = _adjustCurrencyAmountPrecision(value)
    amount = adjustedValues.amount
    precision = adjustedValues.precision
    smallLimitPrecision = Math.min(decimalsToShow, precision ?? DEFAULT_DECIMALS)
  } else {
    // Amount is already at desired precision (e.g.: a price), just need to format it nicely
    precision = 0
    amount = value.toFixed(FULL_PRICE_PRECISION) // To a large enough precision so very small values are not rounded to 0
    smallLimitPrecision = Math.min(decimalsToShow, DEFAULT_DECIMALS)
  }

  return _formatSmart({
    amount,
    precision,
    decimals: decimalsToShow,
    thousandSeparator: !!options?.thousandSeparator,
    smallLimit: _buildSmallLimit(options?.smallLimit, smallLimitPrecision),
    isLocaleAware: !!options?.isLocaleAware,
  })
}

export function formatSmartLocaleAware(...params: Parameters<typeof formatSmart>): ReturnType<typeof formatSmart> {
  const [value, decimalsToShow, options = {}] = params
  return formatSmart(value, decimalsToShow, { ...options, isLocaleAware: true, thousandSeparator: true })
}

/**
 * Formats Fraction with max precision
 *
 * If value has less that `decimals` precision, show the value with 1 significant digit
 * E.g.:
 *   Token decimals: `2`; value: `0.0014123`
 *   => `0.001`
 *
 *   Token decimals: `5`; value: `0.0014123`
 *   => `0.00141`
 *
 *   Token decimals: `10`; value: `412310.0014123`
 *   => `412310.0014123000`
 *
 * @param value
 * @param decimals
 */
export function formatMax(value?: Fraction, decimals?: number): string | undefined {
  if (!value) {
    return
  }
  let amount = value.toFixed(decimals ?? LONG_PRECISION)

  if (+amount === 0) {
    amount = value.toSignificant(1)
  }
  return amount
}

/**
 * Truncated given `value` on `decimals`.
 * E.g.: value=10.001; decimals=2 => 10.00
 *
 * @param value
 * @param decimals
 */
export function truncateOnMaxDecimals(value: string, decimals: number): string {
  const regex = new RegExp(`(\\d*\\.\\d{${decimals}})\\d*`)
  return value.replace(regex, '$1')
}
