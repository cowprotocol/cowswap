import { CurrencyAmount, Fraction } from '@cowprotocol/common-entities'
import { Nullish } from '@cowprotocol/types'

import { FractionUtils } from '../fractionUtils'
import { FractionLike } from '../types'

const TINIEST = new Fraction(1, 100_000_000)
const TINY = new Fraction(1, 100_000)
const ONE = 1n
const HUNDRED_K = 100_000n
const MILLION = 1_000_000n
const TEN_MILLION = 10_000_000n
const BILLION = 1_000_000_000n
const TRILLION = 1_000_000_000_000n

function getPrecisionForFraction(fraction: Fraction): number {
  if (FractionUtils.lte(fraction, TINIEST)) return 18
  if (FractionUtils.lte(fraction, TINY)) return 12
  if (FractionUtils.lte(fraction, ONE)) return 6
  if (FractionUtils.lte(fraction, HUNDRED_K)) return 4
  if (FractionUtils.lte(fraction, MILLION)) return 3
  if (FractionUtils.lte(fraction, TEN_MILLION)) return 2

  return 3
}

export function getPrecisionForAmount(amount: Nullish<FractionLike>): number {
  if (!amount) return 0

  const fraction = FractionUtils.fractionLikeToFraction(amount)
  const smartPrecision = getPrecisionForFraction(fraction)

  // Some tokens have decimals = 0
  if (amount instanceof CurrencyAmount && amount.currency.decimals < smartPrecision) {
    return amount.currency.decimals
  }

  return smartPrecision
}

export function getSuffixForAmount(amount: Fraction): string {
  if (FractionUtils.gte(amount, TRILLION)) return 'T'
  if (FractionUtils.gte(amount, BILLION)) return 'B'

  return ''
}

export function trimHugeAmounts(amount: Fraction): Fraction {
  if (FractionUtils.gte(amount, TRILLION)) return amount.divide(TRILLION)
  if (FractionUtils.gte(amount, BILLION)) return amount.divide(BILLION)

  return amount
}

export function lessThanPrecisionSymbol(precision: number): string {
  return `< 0.${'0'.repeat((precision || 4) - 1)}1`
}
