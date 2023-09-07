import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function isEnoughAmount(
  sellAmount: CurrencyAmount<Currency>,
  targetAmount: CurrencyAmount<Currency> | undefined
): boolean | undefined {
  if (!targetAmount) return undefined

  return sellAmount.equalTo(targetAmount) || sellAmount.lessThan(targetAmount)
}
