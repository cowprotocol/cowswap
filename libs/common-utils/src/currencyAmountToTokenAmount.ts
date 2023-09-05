import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

export function currencyAmountToTokenAmount(
  amount: CurrencyAmount<Currency> | null | undefined
): CurrencyAmount<Token> | null {
  if (!amount) return null

  if (amount.currency.isToken) return amount as CurrencyAmount<Token>

  return CurrencyAmount.fromFractionalAmount(amount.currency.wrapped, amount.numerator, amount.denominator)
}
