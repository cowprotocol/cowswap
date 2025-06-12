import {
  AMOUNT_PRECISION,
  FIAT_PRECISION,
  INTL_NUMBER_FORMAT,
  PERCENTAGE_PRECISION,
  ZERO_FRACTION,
} from '@cowprotocol/common-const'
import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Percent, Rounding } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { getPrecisionForAmount, getSuffixForAmount, lessThanPrecisionSymbol, trimHugeAmounts } from './utils'

import { FractionUtils } from '../fractionUtils'
import { maxAmountSpend } from '../maxAmountSpend'
import { trimTrailingZeros } from '../trimTrailingZeros'
import { FractionLike } from '../types'

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
  numberFormat = INTL_NUMBER_FORMAT,
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

  // Trim the remainder up to precision
  const reminderWithPrecision = remainder.toFixed(precision, undefined, Rounding.ROUND_HALF_UP)

  // If rounding up means we carry over to the next integer, add 1 to quotient
  const adjustedQuotient = +reminderWithPrecision >= 1 ? JSBI.add(quotient, JSBI.BigInt(1)) : quotient

  // Apply the language formatting for the amount
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
  const formattedQuotient = numberFormat.format(
    BigInt(trimTrailingZeros(adjustedQuotient.toString(), decimalsSeparator)),
  )

  // Remove trailing zeros
  const reminderWithotTrailingZeros = trimTrailingZeros(reminderWithPrecision)

  // Make sure the reminder is internationalised
  const formattedRemainder =
    reminderWithotTrailingZeros.includes('.') && remainder.greaterThan(0)
      ? decimalsSeparator + reminderWithotTrailingZeros.slice(2) // removes the integer part and the decimals separator (note how is pre-pended)
      : ''

  const result = formattedQuotient + (formattedRemainder === '0' ? '' : formattedRemainder) + suffix

  const nonZeroAmountIsRoundedToZero = amount.greaterThan(0) && +result === 0
  return nonZeroAmountIsRoundedToZero ? lessThanPrecisionSymbol(precision) : result
}

export function formatInputAmount(
  amount: Nullish<FractionLike>,
  balance: Nullish<CurrencyAmount<Currency>> = null,
  isIndependentField = false,
): string {
  if (!amount) return ''

  const usesMaxBalance = balance ? maxAmountSpend(balance) : undefined
  const amountMatchesBalance = !!(usesMaxBalance && amount.equalTo(usesMaxBalance))

  if (isIndependentField || amountMatchesBalance) {
    return trimTrailingZeros(FractionUtils.fractionLikeToExactString(amount))
  }

  const precision = getPrecisionForAmount(amount)
  const result = amount.toFixed(precision, undefined, Rounding.ROUND_HALF_UP)

  return trimTrailingZeros(+result === 0 ? amount.toSignificant(AMOUNT_PRECISION) : result)
}
