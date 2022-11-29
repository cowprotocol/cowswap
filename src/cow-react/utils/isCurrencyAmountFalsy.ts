import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function isCurrencyAmountFalsy(amount: CurrencyAmount<Currency> | null | undefined): boolean {
  if (!amount) return true

  return amount.equalTo(0)
}
