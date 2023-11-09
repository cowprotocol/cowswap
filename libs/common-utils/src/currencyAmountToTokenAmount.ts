import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { getIsNativeToken } from './getIsNativeToken'
import { getWrappedToken } from './getWrappedToken'

export function currencyAmountToTokenAmount(
  amount: CurrencyAmount<Currency> | null | undefined
): CurrencyAmount<Token> | null {
  if (!amount) return null

  if (!getIsNativeToken(amount.currency)) {
    return amount as CurrencyAmount<Token>
  }

  return CurrencyAmount.fromFractionalAmount(getWrappedToken(amount.currency), amount.numerator, amount.denominator)
}
