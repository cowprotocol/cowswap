import { Currency } from '@uniswap/sdk-core'

import { DEFAULT_DECIMALS } from 'legacy/constants'

/**
 * @deprecated use rawToTokenAmount
 */
export const parsePrice = (price: number, currency: Currency) =>
  price * 10 ** (DEFAULT_DECIMALS + getDecimals(currency))

function getDecimals(currency: Currency): number {
  const customMap: { [key: string]: number } = {
    ALI: 18,
  }

  if (currency.decimals === undefined) return DEFAULT_DECIMALS
  if (currency.symbol && currency.symbol in customMap) return customMap[currency.symbol]

  return currency.decimals
}
