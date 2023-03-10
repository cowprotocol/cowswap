// Copied from @cowprotocol/cow-js

import { DEFAULT_DECIMALS } from 'constants/index'
import { BigNumber } from 'bignumber.js'
import { CurrencyAmount, Fraction, Price, Token } from '@uniswap/sdk-core'
import { adjustDecimalsAtoms } from '@cow/modules/limitOrders/utils/calculateAmountForRate'

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

export function fractionToPrice(fraction: Fraction, inputCurrency: Token, outputCurrency: Token): Price<Token, Token> {
  // Note that here the fraction shows the price in units (for both tokens). The Price class is decimals aware, so we need to adapt it
  const adjustedFraction = adjustDecimalsAtoms(fraction, inputCurrency.decimals, outputCurrency.decimals)

  return new Price({
    quoteAmount: CurrencyAmount.fromRawAmount(outputCurrency, adjustedFraction.numerator),
    baseAmount: CurrencyAmount.fromRawAmount(inputCurrency, adjustedFraction.denominator),
  })
}
