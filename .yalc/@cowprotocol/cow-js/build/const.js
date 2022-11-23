"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_BATCH_ID = exports.FEE_PERCENTAGE = exports.DEFAULT_ORDER_DURATION = exports.FEE_DENOMINATOR = exports.DECIMALS_SYMBOL = exports.THOUSANDS_SYMBOL = exports.DEFAULT_DECIMALS_SYMBOL = exports.DEFAULT_THOUSANDS_SYMBOL = exports.DEFAULT_SMALL_LIMIT = exports.DEFAULT_LARGE_NUMBER_PRECISION = exports.DEFAULT_PRECISION = exports.DEFAULT_DECIMALS = exports.ELLIPSIS = exports.ALLOWANCE_FOR_ENABLED_TOKEN = exports.ALLOWANCE_MAX_VALUE = exports.TEN_BIG_NUMBER = exports.ONE_BIG_NUMBER = exports.ZERO_BIG_NUMBER = exports.BN_1T = exports.BN_1B = exports.BN_10M = exports.BN_1M = exports.BN_100K = exports.TEN = exports.TWO = exports.ONE = exports.ZERO = void 0;
const tslib_1 = require("tslib");
const bn_js_1 = tslib_1.__importDefault(require("bn.js"));
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
// Some convenient numeric constant
exports.ZERO = new bn_js_1.default(0);
exports.ONE = new bn_js_1.default(1);
exports.TWO = new bn_js_1.default(2);
exports.TEN = new bn_js_1.default(10);
exports.BN_100K = new bn_js_1.default('100000');
exports.BN_1M = new bn_js_1.default('1000000');
exports.BN_10M = new bn_js_1.default('10000000');
exports.BN_1B = new bn_js_1.default('1000000000');
exports.BN_1T = new bn_js_1.default('1000000000000');
// BigNumber
exports.ZERO_BIG_NUMBER = new bignumber_js_1.default(0);
exports.ONE_BIG_NUMBER = new bignumber_js_1.default(1);
exports.TEN_BIG_NUMBER = new bignumber_js_1.default(10);
// Max allowance value for ERC20 approve
exports.ALLOWANCE_MAX_VALUE = exports.TWO.pow(new bn_js_1.default(256)).sub(exports.ONE); // 115792089237316195423570985008687907853269984665640564039457584007913129639935
// Arbitrarily big number for checking if the token is enabled
exports.ALLOWANCE_FOR_ENABLED_TOKEN = exports.TWO.pow(new bn_js_1.default(128)); // 340282366920938463463374607431768211456
// Default formatting constants
exports.ELLIPSIS = '...';
exports.DEFAULT_DECIMALS = 4;
exports.DEFAULT_PRECISION = 18;
// numbers over 1B / 1T
// e.g 234.543B
exports.DEFAULT_LARGE_NUMBER_PRECISION = 3;
// Represented as WEI to use BN comparison
// Why? Would not be possible otherwise, as
// BN does not accept fractional values
exports.DEFAULT_SMALL_LIMIT = '0.001';
exports.DEFAULT_THOUSANDS_SYMBOL = ',';
exports.DEFAULT_DECIMALS_SYMBOL = '.';
// Export symbols based on user locale
_a = _getLocaleSymbols(), exports.THOUSANDS_SYMBOL = _a.thousands, exports.DECIMALS_SYMBOL = _a.decimals;
// Model constants
exports.FEE_DENOMINATOR = 1000; // Fee is 1/fee_denominator i.e. 1/1000 = 0.1%
exports.DEFAULT_ORDER_DURATION = 6; // every batch takes 5min, we want it to be valid for 30min, ∴ 30/5 == 6
exports.FEE_PERCENTAGE = (1 / exports.FEE_DENOMINATOR) * 100; // syntatic sugar for displaying purposes
// Furthest batch id possible (uint32), must be a js Number
exports.MAX_BATCH_ID = Math.pow(2, 32) - 1;
function _getLocaleSymbols() {
    // Check number representation in default locale
    const formattedNumber = new Intl.NumberFormat(undefined).format(10000.1);
    return {
        thousands: formattedNumber[2],
        decimals: formattedNumber[6],
    };
}
//# sourceMappingURL=const.js.map