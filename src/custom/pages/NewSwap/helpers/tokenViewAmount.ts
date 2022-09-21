import { formatSmartAmount } from 'utils/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { maxAmountSpend } from 'utils/maxAmountSpend'

export function tokenViewAmount(
  amount: CurrencyAmount<Currency> | undefined,
  balance: CurrencyAmount<Currency> | null
): string {
  const maxBalance = balance ? maxAmountSpend(balance) : undefined
  const isInputCurrencyHasMaxAmount = !!(maxBalance && amount?.equalTo(maxBalance))

  return (isInputCurrencyHasMaxAmount ? amount?.toExact() : formatSmartAmount(amount)) || ''
}
