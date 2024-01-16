// Copied from @cowprotocol/cow-js

import { DEFAULT_DECIMALS } from '@cowprotocol/common-const'

import { BigNumber } from 'bignumber.js'

interface PriceTokenInfo {
  amount: BigNumber | string
  decimals?: number
}

interface CalculatePriceParams {
  numerator: PriceTokenInfo
  denominator: PriceTokenInfo
}

export const ONE_BIG_NUMBER = new BigNumber(1)
export const TEN_BIG_NUMBER = new BigNumber(10)

/**
 * Calculates price from either BN, BigNumber or string amounts
 * based on decimal precision of each part.
 *
 * Decimals defaults to 0.
 * Use case is to calculate the price when values already in the same unit
 * and no adjustment is required.
 *
 * Returns price in BigNumber and leave formatting up to the caller
 */
export function calculatePrice(params: CalculatePriceParams): BigNumber {
  const {
    numerator: { amount: numeratorAmount, decimals: numeratorDecimals = DEFAULT_DECIMALS },
    denominator: { amount: denominatorAmount, decimals: denominatorDecimals = DEFAULT_DECIMALS },
  } = params

  // convert to BigNumber
  const numerator = new BigNumber(numeratorAmount.toString())
  const denominator = new BigNumber(denominatorAmount.toString())

  if (numeratorDecimals >= denominatorDecimals) {
    const precisionFactor = TEN_BIG_NUMBER.exponentiatedBy(numeratorDecimals - denominatorDecimals)
    return numerator.dividedBy(denominator.multipliedBy(precisionFactor))
  } else {
    const precisionFactor = TEN_BIG_NUMBER.exponentiatedBy(denominatorDecimals - numeratorDecimals)
    return numerator.multipliedBy(precisionFactor).dividedBy(denominator)
  }
}

/**
 * Convenience function to invert price
 *
 * @param price Price to be inverted as BigNumber
 */
export function invertPrice(price: BigNumber): BigNumber {
  return ONE_BIG_NUMBER.div(price)
}
