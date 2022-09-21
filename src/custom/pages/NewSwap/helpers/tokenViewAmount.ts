import { formatSmartAmount } from 'utils/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function tokenViewAmount(
  amount: CurrencyAmount<Currency> | undefined,
  balance: CurrencyAmount<Currency> | null
): string {
  const isInputCurrencyHasMaxAmount = !!(balance && amount?.equalTo(balance))

  return (isInputCurrencyHasMaxAmount ? amount?.toExact() : formatSmartAmount(amount)) || ''
}
