import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { DEFAULT_PRECISION, FULL_PRICE_PRECISION } from 'constants/index'

export function tokenViewAmount(
  amount: Nullish<CurrencyAmount<Currency> | Fraction>,
  balance: CurrencyAmount<Currency> | null = null,
  isIndependentField = false
): string {
  if (!amount) return ''

  const maxBalance = balance ? maxAmountSpend(balance) : undefined
  const isInputCurrencyHasMaxAmount = !!(maxBalance && amount.equalTo(maxBalance))

  if (isIndependentField || isInputCurrencyHasMaxAmount) {
    if (amount instanceof CurrencyAmount) {
      return amount.toExact() || ''
    }

    return amount.toFixed(FULL_PRICE_PRECISION) || ''
  }

  return amount.toSignificant(DEFAULT_PRECISION)
}
