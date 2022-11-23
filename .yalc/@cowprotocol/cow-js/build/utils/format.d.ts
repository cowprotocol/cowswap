import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { TokenDex } from '../types';
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
export declare function stringToBn(amountStr: string, additionalPrecision?: number): {
    amount: BN | null;
    precision: number;
};
interface SmartFormatParams<T> extends FormatAmountParams<T> {
    smallLimit?: string;
}
/**
 * formatSmart
 * @description prettier formatting based on Gnosis Safe - uses same signature as formatAmount
 * @param amount
 * @param amountPrecision
 */
export declare function formatSmart(amount: BN, amountPrecision: number): string;
export declare function formatSmart(amount: string, amountPrecision: number): string;
export declare function formatSmart(amount: null | undefined, amountPrecision: number): null;
export declare function formatSmart(params: SmartFormatParams<BN>): string;
export declare function formatSmart(params: SmartFormatParams<string>): string;
export declare function formatSmart(params: SmartFormatParams<null | undefined>): null;
interface FormatAmountParams<T> {
    amount: T;
    precision: number;
    decimals?: number;
    thousandSeparator?: boolean;
    isLocaleAware?: boolean;
}
export declare function formatAmount(amount: BN, amountPrecision: number): string;
export declare function formatAmount(amount: null | undefined, amountPrecision: number): null;
export declare function formatAmount(params: FormatAmountParams<BN>): string;
export declare function formatAmount(params: FormatAmountParams<null | undefined>): null;
interface FormatAmountFullParams<T> extends Omit<FormatAmountParams<T>, 'decimals'> {
}
export declare function formatAmountFull(amount: BN): string;
export declare function formatAmountFull(amount?: undefined | null): null;
export declare function formatAmountFull(params: FormatAmountFullParams<BN>): string;
export declare function formatAmountFull(params: FormatAmountFullParams<null | undefined>): null;
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
export declare function adjustPrecision(value: string | undefined | null, precision: number, decimalsSymbol?: string): string;
export declare function parseAmount(amountFmt: string, amountPrecision: number): BN | null;
export declare function abbreviateString(inputString: string, prefixLength: number, suffixLength?: number): string;
declare type MinimalSafeToken = Pick<TokenDex, 'symbol' | 'name' | 'address'>;
export declare function safeTokenName(token: MinimalSafeToken): string;
export declare function safeFilledToken<T extends MinimalSafeToken>(token: T): T;
interface FormatPriceParams {
    price: BigNumber;
    decimals?: number;
    thousands?: boolean;
    zeroPadding?: boolean;
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
export declare function formatPrice(params: FormatPriceParams | BigNumber): string;
export {};
//# sourceMappingURL=format.d.ts.map