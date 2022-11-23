"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invertPrice = exports.calculatePrice = void 0;
const tslib_1 = require("tslib");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const const_1 = require("../const");
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
function calculatePrice(params) {
    const { numerator: { amount: numeratorAmount, decimals: numeratorDecimals = const_1.DEFAULT_PRECISION }, denominator: { amount: denominatorAmount, decimals: denominatorDecimals = const_1.DEFAULT_PRECISION }, } = params;
    // convert to BigNumber
    const numerator = new bignumber_js_1.default(numeratorAmount.toString());
    const denominator = new bignumber_js_1.default(denominatorAmount.toString());
    if (numeratorDecimals >= denominatorDecimals) {
        const precisionFactor = const_1.TEN_BIG_NUMBER.exponentiatedBy(numeratorDecimals - denominatorDecimals);
        return numerator.dividedBy(denominator.multipliedBy(precisionFactor));
    }
    else {
        const precisionFactor = const_1.TEN_BIG_NUMBER.exponentiatedBy(denominatorDecimals - numeratorDecimals);
        return numerator.multipliedBy(precisionFactor).dividedBy(denominator);
    }
}
exports.calculatePrice = calculatePrice;
/**
 * Convenience function to invert price
 *
 * @param price Price to be inverted as BigNumber
 */
function invertPrice(price) {
    return const_1.ONE_BIG_NUMBER.div(price);
}
exports.invertPrice = invertPrice;
//# sourceMappingURL=price.js.map