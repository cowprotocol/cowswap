import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import JSBI from 'jsbi'
import { Nullish } from 'types'

/**
 * Returns the highest parts count that still keeps each part above the fiat minimum.
 */
export function getMaxTwapPartsForSellAmount(
  totalSellAmountFiat: Nullish<CurrencyAmount<Currency>>,
  minimumPartSellAmountFiat: Nullish<CurrencyAmount<Currency>>,
): number {
  if (!totalSellAmountFiat || !minimumPartSellAmountFiat) {
    return 1
  }

  const minimumRaw = minimumPartSellAmountFiat.quotient
  const totalRaw = totalSellAmountFiat.quotient

  if (JSBI.lessThanOrEqual(minimumRaw, ZERO_JSBI)) return 1
  if (JSBI.lessThanOrEqual(totalRaw, ZERO_JSBI)) return 1

  const maxParts = JSBI.divide(totalRaw, minimumRaw)

  return Math.max(1, toSafeNumber(maxParts))
}

const ZERO_JSBI = JSBI.BigInt(0)
const MAX_SAFE_INTEGER_JSBI = JSBI.BigInt(Number.MAX_SAFE_INTEGER)

function toSafeNumber(value: JSBI): number {
  if (JSBI.greaterThan(value, MAX_SAFE_INTEGER_JSBI)) {
    return Number.MAX_SAFE_INTEGER
  }

  return Number(value.toString())
}
