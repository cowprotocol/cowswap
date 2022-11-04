import { DEFAULT_DECIMALS } from '@src/custom/constants'
import { Currency } from '@uniswap/sdk-core'

export function getDecimals(currency: Currency): number {
  const mistakes = ['ALI']

  if (!currency.decimals) return DEFAULT_DECIMALS
  if (currency.symbol && mistakes.includes(currency.symbol)) return DEFAULT_DECIMALS

  return currency.decimals
}
