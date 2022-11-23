import BN from 'bn.js';
import BigNumber from 'bignumber.js';
// Some convenient numeric constant
export const ZERO = new BN(0);
export const ONE = new BN(1);
export const TWO = new BN(2);
export const TEN = new BN(10);
export const BN_100K = new BN('100000');
export const BN_1M = new BN('1000000');
export const BN_10M = new BN('10000000');
export const BN_1B = new BN('1000000000');
export const BN_1T = new BN('1000000000000');
// BigNumber
export const ZERO_BIG_NUMBER = new BigNumber(0);
export const ONE_BIG_NUMBER = new BigNumber(1);
export const TEN_BIG_NUMBER = new BigNumber(10);
// Max allowance value for ERC20 approve
export const ALLOWANCE_MAX_VALUE = TWO.pow(new BN(256)).sub(ONE); // 115792089237316195423570985008687907853269984665640564039457584007913129639935
// Arbitrarily big number for checking if the token is enabled
export const ALLOWANCE_FOR_ENABLED_TOKEN = TWO.pow(new BN(128)); // 340282366920938463463374607431768211456
// Default formatting constants
export const ELLIPSIS = '...';
export const DEFAULT_DECIMALS = 4;
export const DEFAULT_PRECISION = 18;
// numbers over 1B / 1T
// e.g 234.543B
export const DEFAULT_LARGE_NUMBER_PRECISION = 3;
// Represented as WEI to use BN comparison
// Why? Would not be possible otherwise, as
// BN does not accept fractional values
export const DEFAULT_SMALL_LIMIT = '0.001';
export const DEFAULT_THOUSANDS_SYMBOL = ',';
export const DEFAULT_DECIMALS_SYMBOL = '.';
// Export symbols based on user locale
export const { thousands: THOUSANDS_SYMBOL, decimals: DECIMALS_SYMBOL } = _getLocaleSymbols();
// Model constants
export const FEE_DENOMINATOR = 1000; // Fee is 1/fee_denominator i.e. 1/1000 = 0.1%
export const DEFAULT_ORDER_DURATION = 6; // every batch takes 5min, we want it to be valid for 30min, ∴ 30/5 == 6
export const FEE_PERCENTAGE = (1 / FEE_DENOMINATOR) * 100; // syntatic sugar for displaying purposes
// Furthest batch id possible (uint32), must be a js Number
export const MAX_BATCH_ID = Math.pow(2, 32) - 1;
function _getLocaleSymbols() {
    // Check number representation in default locale
    const formattedNumber = new Intl.NumberFormat(undefined).format(10000.1);
    return {
        thousands: formattedNumber[2],
        decimals: formattedNumber[6],
    };
}
//# sourceMappingURL=const.js.map