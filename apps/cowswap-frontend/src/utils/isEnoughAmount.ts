import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function isEnoughAmount(
  sellAmount: CurrencyAmount<Currency>,
  targetAmount: CurrencyAmount<Currency> | undefined
): boolean {
  if (!targetAmount) return true

  if (targetAmount.equalTo(sellAmount)) return true

  return sellAmount.lessThan(targetAmount)
}
