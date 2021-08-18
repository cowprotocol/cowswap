import BigNumber from 'bignumber.js'

import { formatSmart as _formatSmart } from '@gnosis.pm/dex-js'
import { Currency, CurrencyAmount, Percent, Fraction } from '@uniswap/sdk-core'
import { DEFAULT_DECIMALS, DEFAULT_PRECISION, DEFAULT_SMALL_LIMIT } from 'constants/index'

const TEN = new BigNumber(10)

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
 * formatSmart
 * @param value
 * @param decimalsToShow
 * @param options
 * @returns string or undefined
 */
export function formatSmart(
  value: CurrencyAmount<Currency> | Percent | Fraction | null | undefined,
  decimalsToShow: number = DEFAULT_PRECISION,
  options?: FormatSmartOptions
) {
  if (!value) return

  let precision
  let amount
  let smallLimitPrecision
  if (value instanceof CurrencyAmount) {
    // Amount is in atoms, need to convert it to units by setting precision = token.decimals
    precision = value.currency.decimals
    amount = value.quotient.toString()
    smallLimitPrecision = Math.min(decimalsToShow, precision ?? DEFAULT_DECIMALS)
  } else {
    // Amount is already at desired precision (e.g.: a price), just need to format it nicely
    precision = 0
    amount = value.toFixed(decimalsToShow)
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
