import { DEFAULT_DECIMALS } from '@src/custom/constants'
import { Currency } from '@uniswap/sdk-core'

export function getDecimals(currency: Currency): number {
  const customMap: { [key: string]: number } = {
    ALI: 18,
  }

  if (!currency.decimals) return DEFAULT_DECIMALS
  if (currency.symbol && currency.symbol in customMap) return customMap[currency.symbol]

  return currency.decimals
}
