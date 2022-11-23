import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { TEN, DEFAULT_PRECISION, DEFAULT_DECIMALS, DEFAULT_SMALL_LIMIT, DEFAULT_THOUSANDS_SYMBOL, DEFAULT_DECIMALS_SYMBOL, ELLIPSIS, DEFAULT_LARGE_NUMBER_PRECISION, BN_1T, BN_1B, BN_10M, BN_1M, BN_100K, ONE_BIG_NUMBER, ZERO_BIG_NUMBER, TEN_BIG_NUMBER, THOUSANDS_SYMBOL, DECIMALS_SYMBOL, } from '../const';
function _formatDecimalsForDisplay(numberToConvert, decimalsSymbol) {
    // 2.00012366123.integerValue() ==> 2
    const integer = numberToConvert.integerValue(BigNumber.ROUND_DOWN);
    // 2.00012366123 <numberToConvert> - 2 <integer> ==> 00012366123
    const decimalsWithoutIntegerOrSymbol = numberToConvert.minus(integer).toString(10).slice(2);
    // 2 + <,|.> + 00012366123 ==> 2<,|.>00012366123
    return integer + decimalsSymbol + decimalsWithoutIntegerOrSymbol;
}
function _getSign(isNegative) {
    return isNegative ? '-' : '';
}
function _decomposeLargeNumberToString(baseUnit, baseUnitsPerRepresentationUnits, decimalsSymbol, thousandsSymbol) {
    // e.g TRILLION_123_123.div(ONE_TRILLION) = 123123.123123123
    const baseUnitAsDecimal = baseUnit
        .mul(TEN.pow(new BN(DEFAULT_LARGE_NUMBER_PRECISION)))
        .div(baseUnitsPerRepresentationUnits);
    const { integerPart, decimalPart, isNegative } = _decomposeBn(baseUnitAsDecimal, DEFAULT_LARGE_NUMBER_PRECISION, DEFAULT_LARGE_NUMBER_PRECISION);
    const sign = _getSign(isNegative);
    // 123123.123123123 = 123,123.123123123
    const formattedInteger = _formatNumber(integerPart.toString(10), thousandsSymbol);
    // no relevant decimal section
    if (decimalPart.isZero())
        return `${sign}${formattedInteger}`;
    const formattedDecimal = decimalPart
        .toString(10)
        .padStart(DEFAULT_LARGE_NUMBER_PRECISION, '0') // Pad the decimal part with leading zeros
        .replace(/0+$/, ''); // Remove the right zeros
    return sign + formattedInteger + decimalsSymbol + formattedDecimal;
}
function _formatNumber(num, thousandsSymbol = THOUSANDS_SYMBOL) {
    return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1' + thousandsSymbol);
}
function _formatSmart({ integerPart, decimalPart, decimalsPadded, isNegative }, smallLimit, isLocaleAware, thousandSeparator) {
    const decimalsSymbol = isLocaleAware ? DECIMALS_SYMBOL : DEFAULT_DECIMALS_SYMBOL;
    const thousandsSymbol = !thousandSeparator ? '' : isLocaleAware ? THOUSANDS_SYMBOL : DEFAULT_THOUSANDS_SYMBOL;
    const sign = _getSign(isNegative);
    // Is < 1
    if (integerPart.isZero()) {
        // if amount < 1 and decimal < smallLimit
        // return `< ${smallLimit}`
        // else return decimals as is
        const ourDecimalsAsBigNumber = new BigNumber('0.' + decimalsPadded);
        const smallLimitAsBigNumber = new BigNumber(smallLimit);
        return ourDecimalsAsBigNumber.isLessThan(smallLimitAsBigNumber)
            ? `< ${_formatDecimalsForDisplay(smallLimitAsBigNumber, decimalsSymbol)}`
            : `${sign}${_formatDecimalsForDisplay(ourDecimalsAsBigNumber, decimalsSymbol)}`;
    }
    // Number compacting logic
    // Anything > 1,000,000,000,000 denoted as <XXX,XXX.xxx>T
    if (integerPart.gte(BN_1T)) {
        return _decomposeLargeNumberToString(integerPart, BN_1T, decimalsSymbol, thousandsSymbol) + 'T';
    }
    // Anything not above 1T but > 1,000,000,000 denoted as <XXX.xxx>B
    if (integerPart.gte(BN_1B)) {
        return _decomposeLargeNumberToString(integerPart, BN_1B, decimalsSymbol, thousandsSymbol) + 'B';
    }
    // At this point can just return thousands separated formatted integer
    // if decimals are zero
    if (decimalPart.isZero()) {
        return `${sign}${_formatNumber(integerPart.toString(10), thousandsSymbol)}`;
    }
    let finalPrecision;
    // normal format + separator
    if (integerPart.lt(BN_100K)) {
        // 99,999.3424
        finalPrecision = 4;
    }
    else if (integerPart.lt(BN_1M)) {
        // 999,999.342
        finalPrecision = 3;
    }
    else if (integerPart.lt(BN_10M)) {
        // 9,999,999.34
        finalPrecision = 2;
    }
    else {
        // 99,999,999.3
        finalPrecision = 1;
    }
    const amountBeforePrecisionCheck = _formatNumber(integerPart.toString(10), thousandsSymbol) + decimalsSymbol + decimalsPadded;
    return `${sign}${adjustPrecision(amountBeforePrecisionCheck, finalPrecision, decimalsSymbol).replace(/\.?0*$/, '')}`;
}
function _decomposeBn(amount, amountPrecision, decimals) {
    if (decimals > amountPrecision) {
        throw new Error('The decimals cannot be bigger than the precision');
    }
    // Discard the decimals we don't need
    //  i.e. for WETH (precision=18, decimals=4) --> amount / 1e14
    //        1, 18:  16.5*1e18 ---> 165000
    const amountRaw = amount.divRound(TEN.pow(new BN(amountPrecision - decimals)));
    const integerPart = amountRaw.div(TEN.pow(new BN(decimals))).abs(); // 165000 / 10000 = 16
    const decimalPart = amountRaw.mod(TEN.pow(new BN(decimals))).abs(); // 165000 % 10000 = 5000
    const decimalsPadded = decimalPart.toString(10).padStart(decimals, '0');
    return { integerPart, decimalPart, decimalsPadded, isNegative: amount.isNeg() };
}
/**
 * Transforms (possibly decimal) amount as string into a BN
 * Takes into account original precision from amount + argument precision
 *
 *
 * Internally we use BNs, but we all know BNs don't like decimals.
 * To convert arbitrary strings, we need to make them integers.
 * We do so by creating a BigNumber and moving the decimal separator to the right
 * by multiplying it by 10^(amount precision).
 * Which we then later add to regular precision to be 'compressed'.
 * Finally, convert it to a string base 10,
 * to avoid numbers with exponents which BN also doesn't like
 *
 * @param amountStr Amount with arbitrary precision
 * @param additionalPrecision Optional precision to add on top of existing precision
 */
export function stringToBn(amountStr, additionalPrecision = 0) {
    if (!amountStr || isNaN(+amountStr)) {
        return { amount: null, precision: 0 };
    }
    const bigNumberAmount = new BigNumber(amountStr);
    const decimalPlaces = bigNumberAmount.decimalPlaces();
    const amount = new BN(bigNumberAmount.multipliedBy(TEN_BIG_NUMBER.pow(decimalPlaces)).integerValue().toString(10));
    const precision = decimalPlaces + additionalPrecision;
    return { amount, precision };
}
export function formatSmart(params, _amountPrecision) {
    var _a, _b, _c, _d;
    /*
      1. integer part in Billion or Trillion becomes abbreviated w/4 decimals + decimals are DROPPED
          ==> e.g 1.2546T
      2. everything under is shown as is, with local thousands separator and 4 decimal points
          ==> e.g 125,456,777.8888
      3. anything under "smallLimit" is shown as < ${smallLimit}
          ==> < 0.0001
    */
    let amount;
    let precision;
    let decimals = DEFAULT_DECIMALS;
    let smallLimit = DEFAULT_SMALL_LIMIT;
    // `isLocaleAware` defaults to true for backwards compatibility,
    // as it was the standard behaviour before this change
    let isLocaleAware = true;
    let thousandSeparator = true;
    if (!params ||
        (typeof params === 'string' && isNaN(+params)) ||
        (typeof params !== 'string' && 'amount' in params && !params.amount)) {
        return null;
    }
    if (BN.isBN(params)) {
        amount = params;
        precision = _amountPrecision;
    }
    else if (typeof params === 'string') {
        const { amount: _amount, precision: _precision } = stringToBn(params, _amountPrecision);
        if (!_amount) {
            return null;
        }
        amount = _amount;
        precision = _precision;
    }
    else {
        if (typeof params.amount === 'string') {
            const { amount: _amount, precision: _precision } = stringToBn(params.amount, params.precision);
            if (!_amount) {
                return null;
            }
            amount = _amount;
            precision = _precision;
        }
        else {
            amount = params.amount;
            precision = params.precision;
        }
        decimals = (_a = params.decimals) !== null && _a !== void 0 ? _a : decimals;
        smallLimit = (_b = params.smallLimit) !== null && _b !== void 0 ? _b : smallLimit;
        isLocaleAware = (_c = params.isLocaleAware) !== null && _c !== void 0 ? _c : isLocaleAware;
        thousandSeparator = (_d = params.thousandSeparator) !== null && _d !== void 0 ? _d : thousandSeparator;
    }
    // amount is already zero
    if (amount.isZero())
        return '0';
    const actualDecimals = Math.min(precision, decimals);
    const numberParts = _decomposeBn(amount, precision, actualDecimals);
    return _formatSmart(numberParts, smallLimit, isLocaleAware, thousandSeparator);
}
export function formatAmount(params, _amountPrecision) {
    var _a, _b, _c;
    let amount;
    let precision;
    let decimals = DEFAULT_DECIMALS;
    let thousandSeparator = true;
    let isLocaleAware = true;
    if (!params || ('amount' in params && !params.amount))
        return null;
    if (BN.isBN(params)) {
        amount = params;
        precision = _amountPrecision;
    }
    else {
        amount = params.amount;
        precision = params.precision;
        decimals = (_a = params.decimals) !== null && _a !== void 0 ? _a : decimals;
        thousandSeparator = (_b = params.thousandSeparator) !== null && _b !== void 0 ? _b : thousandSeparator;
        isLocaleAware = (_c = params.isLocaleAware) !== null && _c !== void 0 ? _c : isLocaleAware;
    }
    let thousandSymbol;
    let decimalSymbol;
    if (isLocaleAware) {
        thousandSymbol = THOUSANDS_SYMBOL;
        decimalSymbol = DECIMALS_SYMBOL;
    }
    else {
        thousandSymbol = DEFAULT_THOUSANDS_SYMBOL;
        decimalSymbol = DEFAULT_DECIMALS_SYMBOL;
    }
    const actualDecimals = Math.min(precision, decimals);
    const { integerPart, decimalPart, isNegative } = _decomposeBn(amount, precision, actualDecimals);
    const sign = _getSign(isNegative);
    const integerPartFmt = thousandSeparator
        ? _formatNumber(integerPart.toString(10), thousandSymbol)
        : integerPart.toString(10);
    if (decimalPart.isZero()) {
        // Return just the integer part
        return sign + integerPartFmt;
    }
    else {
        const decimalFmt = decimalPart
            .toString(10)
            .padStart(actualDecimals, '0') // Pad the decimal part with leading zeros
            .replace(/0+$/, ''); // Remove the right zeros
        // Return the formatted integer plus the decimal
        return sign + integerPartFmt + decimalSymbol + decimalFmt;
    }
}
export function formatAmountFull(params) {
    var _a, _b, _c;
    let amount;
    let precision = DEFAULT_PRECISION;
    let thousandSeparator = true;
    let isLocaleAware = true;
    if (!params || ('amount' in params && !params.amount))
        return null;
    if (BN.isBN(params)) {
        amount = params;
    }
    else {
        amount = params.amount;
        precision = (_a = params.precision) !== null && _a !== void 0 ? _a : precision;
        thousandSeparator = (_b = params.thousandSeparator) !== null && _b !== void 0 ? _b : thousandSeparator;
        isLocaleAware = (_c = params.isLocaleAware) !== null && _c !== void 0 ? _c : isLocaleAware;
    }
    return formatAmount({ amount, precision, decimals: precision, thousandSeparator, isLocaleAware });
}
/**
 * Adjust the decimal precision of the given decimal value, without converting to/from BN or Number
 * Takes in a string and returns a string
 *
 * E.g.:
 * adjustPrecision('1.2657', 3) === '1.265'
 *
 * @param value The decimal value to be adjusted as a string
 * @param precision How many decimals should be kept
 * @param decimalsSymbol What is used as a decimal separator symbol
 */
export function adjustPrecision(value, precision, decimalsSymbol = DEFAULT_DECIMALS_SYMBOL) {
    if (!value) {
        return '';
    }
    const regexp = new RegExp(`(\\${decimalsSymbol}\\d{${precision}})\\d+$`);
    return value.replace(regexp, '$1');
}
export function parseAmount(amountFmt, amountPrecision) {
    if (!amountFmt) {
        return null;
    }
    const adjustedAmount = adjustPrecision(amountFmt, amountPrecision);
    const groups = /^(\d*)(?:\.(\d+))?$/.exec(adjustedAmount);
    if (groups) {
        const [, integerPart, decimalPart = ''] = groups;
        const decimalBN = new BN(decimalPart.padEnd(amountPrecision, '0'));
        const factor = TEN.pow(new BN(amountPrecision));
        return new BN(integerPart || 0).mul(factor).add(decimalBN);
    }
    else {
        return null;
    }
}
export function abbreviateString(inputString, prefixLength, suffixLength = 0) {
    // abbreviate only if it makes sense, and make sure ellipsis fits into word
    // 1. always add ellipsis
    // 2. do not shorten words in case ellipsis will make the word longer
    // 3. min prefix == 1
    // 4. add suffix if requested
    const _prefixLength = Math.max(1, prefixLength);
    if (inputString.length < _prefixLength + ELLIPSIS.length + suffixLength) {
        return inputString;
    }
    const prefix = inputString.slice(0, _prefixLength);
    const suffix = suffixLength > 0 ? inputString.slice(-suffixLength) : '';
    return prefix + ELLIPSIS + suffix;
}
export function safeTokenName(token) {
    return token.symbol || token.name || abbreviateString(token.address, 6, 4);
}
export function safeFilledToken(token) {
    return Object.assign(Object.assign({}, token), { name: token.name || token.symbol || abbreviateString(token.address, 6, 4), symbol: token.symbol || token.name || abbreviateString(token.address, 6, 4) });
}
/**
 * Formats given BigNumber price to a locale aware string.
 *
 * Rounds price if price decimals > decimals parameter.
 * Pads right zeros if price decimals < decimals parameter if zeroPadding is set. Removes otherwise.
 * Returns no decimals if decimals paramter == 0.
 * Adds thousands separator if price >= 1000 and thousands parameter is set.
 *
 * Accepts either a single price BigNumber parameter and uses the defaults,
 * or an object containing all parameters, also using defaults if any is omitted.
 *
 * @param price Price as BigNumber
 * @param decimals Optional amount of decimals to show the price. Defaults to `4`
 * @param thousands Whether thousands separator should be included. Defaults to `false`
 * @param zeroPadding Whether formatted value should be zero padded to the right. Defaults to `true`
 */
export function formatPrice(params) {
    var _a, _b, _c;
    let price;
    // defaults
    let decimals = DEFAULT_DECIMALS;
    let thousands = false;
    let zeroPadding = true;
    if (params instanceof BigNumber) {
        price = params;
    }
    else {
        price = params.price;
        decimals = (_a = params.decimals) !== null && _a !== void 0 ? _a : decimals;
        thousands = (_b = params.thousands) !== null && _b !== void 0 ? _b : thousands;
        zeroPadding = (_c = params.zeroPadding) !== null && _c !== void 0 ? _c : zeroPadding;
    }
    // No much to be done regarding an infinite number
    if (!price.isFinite()) {
        return price.toString(10);
    }
    // truncate all decimals away: 5.516 => 5
    let integerPart = price.integerValue(BigNumber.ROUND_FLOOR);
    const priceMinusIntPart = price
        // adjust decimal precision: 5.516; decimals 2 => 5.52
        // keep in mind there's rounding
        .decimalPlaces(decimals, BigNumber.ROUND_HALF_CEIL)
        // remove integer part: 5.52 => 0.52
        .minus(integerPart);
    let decimalPart;
    // 0.99999 after .decimalPlaces() becomes 1
    // like Math.round(0.9) === 1
    if (priceMinusIntPart.gte(ONE_BIG_NUMBER)) {
        // add to integer, +1
        integerPart = integerPart.plus(priceMinusIntPart);
        // reset decimals
        decimalPart = ZERO_BIG_NUMBER;
    }
    else {
        decimalPart = priceMinusIntPart
            // turn decimals into integer: 0.52 -> 52
            .shiftedBy(decimals);
    }
    // add thousand separator, if set
    const integerPartFmt = thousands ? _formatNumber(integerPart.toString(10)) : integerPart.toString(10);
    if (decimals <= 0 || (!zeroPadding && decimalPart.isZero())) {
        // decimals == 0 or no zeroPadding and decimal part is 0, ignore decimal part
        return integerPartFmt;
    }
    else {
        let decimalPartFmt = decimalPart
            .toString(10)
            // Why padStart, you might ask? Funny story.
            // If the price has zeros at the start of the decimal places, they need to be added back!
            // Price 1.0003457, decimals 4: to precision => 1.0003
            // Decomposing: integer part '1', decimal part '0003' == 3
            // Putting it back: '1' + '.' + <add zeros back, if any> + '3'
            .padStart(decimals, '0');
        if (!zeroPadding) {
            // no zero padding, remove if any
            decimalPartFmt = decimalPartFmt.replace(/0+$/, '');
        }
        else if (decimalPartFmt.length < decimals) {
            // less decimals than what was asked for, pad right: 5.5; decimals 2 => 5.50
            decimalPartFmt = decimalPartFmt.padEnd(decimals, '0');
        }
        return integerPartFmt + DECIMALS_SYMBOL + decimalPartFmt;
    }
}
//# sourceMappingURL=format.js.map