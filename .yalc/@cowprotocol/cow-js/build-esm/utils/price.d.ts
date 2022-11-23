import BigNumber from 'bignumber.js';
import BN from 'bn.js';
interface Token {
    amount: BN | BigNumber | string;
    decimals?: number;
}
interface CalculatePriceParams {
    numerator: Token;
    denominator: Token;
}
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
export declare function calculatePrice(params: CalculatePriceParams): BigNumber;
/**
 * Convenience function to invert price
 *
 * @param price Price to be inverted as BigNumber
 */
export declare function invertPrice(price: BigNumber): BigNumber;
export {};
//# sourceMappingURL=price.d.ts.map