import { Nullish } from '@cowprotocol/types'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { FractionUtils } from '../fractionUtils'
import { FractionLike } from '../types'

const TINIEST = new Fraction(1, 100_000_000)
const TINY = new Fraction(1, 100_000)
const ONE = JSBI.BigInt(1)
const HUNDRED_K = JSBI.BigInt(100_000)
const MILLION = JSBI.BigInt(1_000_000)
const TEN_MILLION = JSBI.BigInt(10_000_000)
const BILLION = JSBI.BigInt(1_000_000_000)
const TRILLION = JSBI.BigInt(1_000_000_000_000)

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
