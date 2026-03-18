import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'
import { getWrappedToken } from './getWrappedToken'

export function currencyAmountToTokenAmount(amount: CurrencyAmount<Currency>): CurrencyAmount<Token>
export function currencyAmountToTokenAmount(amount: null | undefined): null
export function currencyAmountToTokenAmount(
  amount: CurrencyAmount<Currency> | null | undefined,
): CurrencyAmount<Token> | null {
  if (!amount) return null

  if (!getIsNativeToken(amount.currency)) {
    return amount as CurrencyAmount<Token>
  }

  const wrappedToken = getWrappedToken(amount.currency)

  if (!wrappedToken) return null

  return CurrencyAmount.fromFractionalAmount(wrappedToken, amount.numerator, amount.denominator)
}
