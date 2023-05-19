import { FractionLike, Nullish } from 'types'
import { Currency, CurrencyAmount, Percent, Rounding } from '@uniswap/sdk-core'
import { maxAmountSpend } from 'legacy/utils/maxAmountSpend'
import { AMOUNT_PRECISION, FIAT_PRECISION, PERCENTAGE_PRECISION, ZERO_FRACTION } from 'legacy/constants'
import { trimTrailingZeros } from 'utils/trimTrailingZeros'
import { FractionUtils } from 'utils/fractionUtils'
import { getPrecisionForAmount, getSuffixForAmount, lessThanPrecisionSymbol, trimHugeAmounts } from './utils'
import { INTL_NUMBER_FORMAT } from 'constants/intl'

export function formatFiatAmount(amount: Nullish<FractionLike>): string {
  return formatAmountWithPrecision(amount, FIAT_PRECISION)
}

export function formatTokenAmount(amount: Nullish<FractionLike>): string {
  return formatAmountWithPrecision(amount, getPrecisionForAmount(amount))
}

export function formatPercent(percent: Nullish<Percent>): string {
  return percent ? trimTrailingZeros(percent.toFixed(PERCENTAGE_PRECISION)) : ''
}

export function formatAmountWithPrecision(
  amount: Nullish<FractionLike>,
  precision: number,
  numberFormat = INTL_NUMBER_FORMAT
): string {
  if (!amount) return ''

  if (amount.equalTo(ZERO_FRACTION)) {
    return '0'
  }

  // Align fraction-like types to Fraction
  const amountAsFraction = FractionUtils.fractionLikeToFraction(amount)
  // Calculate suffix (T,B or nothing)
  const suffix = getSuffixForAmount(amountAsFraction)
  // For cases when an amount is more than billions
  const { quotient, remainder } = trimHugeAmounts(amountAsFraction)

  const decimalsSeparator = numberFormat.format(1.1)[1]
  // Apply the language formatting for the amount
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
  const formattedQuotient = numberFormat.format(BigInt(trimTrailingZeros(quotient.toString(), decimalsSeparator)))
  // Trim the remainder up to precision
  const fixedRemainder = remainder.toFixed(precision, undefined, Rounding.ROUND_HALF_UP)

  // toFixed() could round the remainder up, and the result could be 1.00 or greater
  if (+fixedRemainder >= 1) {
    return trimTrailingZeros(fixedRemainder)
  }

  const formattedRemainder = remainder.greaterThan(0)
    ? decimalsSeparator + trimTrailingZeros(fixedRemainder.slice(1)).slice(1)
    : ''
  const result = formattedQuotient + formattedRemainder + suffix

  return amount.greaterThan(0) && +result === 0 ? lessThanPrecisionSymbol(precision) : result
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
