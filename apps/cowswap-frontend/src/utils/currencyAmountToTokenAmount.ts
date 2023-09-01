import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

export function currencyAmountToTokenAmount(amount: Nullish<CurrencyAmount<Currency>>): CurrencyAmount<Token> | null {
  if (!amount) return null

  if (amount.currency.isToken) return amount as CurrencyAmount<Token>

  return CurrencyAmount.fromFractionalAmount(amount.currency.wrapped, amount.numerator, amount.denominator)
}
