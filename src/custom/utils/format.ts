import BigNumber from 'bignumber.js'

import { formatSmart as _formatSmart } from '@gnosis.pm/dex-js'
import { Currency, CurrencyAmount, Percent, Fraction } from '@uniswap/sdk-core'
import { DEFAULT_PRECISION } from 'constants/index'

const TEN = new BigNumber(10)
const SMALL_LIMIT = '0.000000000000000001'

export function formatAtoms(amount: string, decimals: number): string {
  return new BigNumber(amount).div(TEN.pow(decimals)).toString(10)
}

/**
 * formatSmart
 * @param amount
 * @param decimalsToShow
 * @returns string or undefined
 */
export function formatSmart(
  value: CurrencyAmount<Currency> | Percent | Fraction | null | undefined,
  decimalsToShow: number = DEFAULT_PRECISION
) {
  if (!value) return

  const precision = value instanceof CurrencyAmount ? value.currency.decimals : 0
  const amount = value instanceof CurrencyAmount ? value.quotient.toString() : value.toFixed(decimalsToShow)

  return _formatSmart({
    amount,
    precision,
    decimals: decimalsToShow,
    thousandSeparator: false,
    smallLimit: SMALL_LIMIT,
  })
}
