import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'
import { FULL_PRICE_PRECISION } from 'constants/index'

export function tokenViewAmount(amount: Nullish<CurrencyAmount<Currency> | Fraction>): string {
  if (!amount) return ''

  if (amount instanceof CurrencyAmount) {
    return amount.toSignificant(amount.currency.decimals) || ''
  }

  return amount.toFixed(FULL_PRICE_PRECISION) || ''
}
