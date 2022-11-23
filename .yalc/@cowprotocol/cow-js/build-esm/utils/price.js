import BigNumber from 'bignumber.js';
import { ONE_BIG_NUMBER, TEN_BIG_NUMBER, DEFAULT_PRECISION } from '../const';
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
export function calculatePrice(params) {
    const { numerator: { amount: numeratorAmount, decimals: numeratorDecimals = DEFAULT_PRECISION }, denominator: { amount: denominatorAmount, decimals: denominatorDecimals = DEFAULT_PRECISION }, } = params;
    // convert to BigNumber
    const numerator = new BigNumber(numeratorAmount.toString());
    const denominator = new BigNumber(denominatorAmount.toString());
    if (numeratorDecimals >= denominatorDecimals) {
        const precisionFactor = TEN_BIG_NUMBER.exponentiatedBy(numeratorDecimals - denominatorDecimals);
        return numerator.dividedBy(denominator.multipliedBy(precisionFactor));
    }
    else {
        const precisionFactor = TEN_BIG_NUMBER.exponentiatedBy(denominatorDecimals - numeratorDecimals);
        return numerator.multipliedBy(precisionFactor).dividedBy(denominator);
    }
}
/**
 * Convenience function to invert price
 *
 * @param price Price to be inverted as BigNumber
 */
export function invertPrice(price) {
    return ONE_BIG_NUMBER.div(price);
}
//# sourceMappingURL=price.js.map