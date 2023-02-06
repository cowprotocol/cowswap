import { FractionLike, Nullish } from '@cow/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { AMOUNT_PRECISION, FIAT_PRECISION } from 'constants/index'
import { trimTrailingZeros } from '@cow/utils/trimTrailingZeros'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { getPrecisionForAmount, getSuffixForAmount, lessThanPrecisionSymbol, trimHugeAmounts } from './utils'
import { INTL_NUMBER_FORMAT } from '@cow/constants/intl'

export function formatFiatAmount(amount: Nullish<FractionLike>): string {
  return formatAmountWithPrecision(amount, FIAT_PRECISION)
}

export function formatTokenAmount(amount: Nullish<FractionLike>): string {
  return formatAmountWithPrecision(amount, getPrecisionForAmount(amount))
}

export function formatAmountWithPrecision(amount: Nullish<FractionLike>, precision: number): string {
  if (!amount) return ''

  // Align fraction-like types to Fraction
  const amountAsFraction = FractionUtils.fractionLikeToFraction(amount)
  // Calculate suffix (T,B or nothing)
  const suffix = getSuffixForAmount(amountAsFraction)
  // For cases when an amount is more than billions
  const { quotient, remainder } = trimHugeAmounts(amountAsFraction)

  // Apply the language formatting for the amount
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
  const formattedQuotient = INTL_NUMBER_FORMAT.format(BigInt(trimTrailingZeros(quotient.toString())))
  // Trim the remainder up to precision
  const formattedRemainder = remainder.greaterThan(0) ? trimTrailingZeros(remainder.toFixed(precision).slice(1)) : ''
  const result = formattedQuotient + formattedRemainder + suffix

  return remainder.greaterThan(0) && +result === 0 ? lessThanPrecisionSymbol(precision) : result
}

export function formatInputAmount(
  amount: Nullish<FractionLike>,
  balance: Nullish<CurrencyAmount<Currency>> = null,
  isIndependentField = false
): string {
  if (!amount) return ''

  const usesMaxBalance = balance ? maxAmountSpend(balance) : undefined
  const amountMatchesBalance = !!(usesMaxBalance && amount.equalTo(usesMaxBalance))

  if (isIndependentField || amountMatchesBalance) {
    return trimTrailingZeros(FractionUtils.fractionLikeToExactString(amount))
  }

  const precision = getPrecisionForAmount(amount)
  const result = amount.toFixed(precision)

  return trimTrailingZeros(+result === 0 ? amount.toSignificant(AMOUNT_PRECISION) : result)
}
