import { formatSmartAmount } from '@cow/utils/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { maxAmountSpend } from 'utils/maxAmountSpend'

export function tokenViewAmount(
  amount: CurrencyAmount<Currency> | undefined | null,
  balance: CurrencyAmount<Currency> | null,
  isIndependentField: boolean
): string {
  if (isIndependentField) {
    return amount?.toExact() || ''
  }

  const maxBalance = balance ? maxAmountSpend(balance) : undefined
  const isInputCurrencyHasMaxAmount = !!(maxBalance && amount?.equalTo(maxBalance))

  return (isInputCurrencyHasMaxAmount ? amount?.toExact() : formatSmartAmount(amount)) || ''
}
