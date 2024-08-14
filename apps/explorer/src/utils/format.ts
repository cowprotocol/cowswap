import { parseBytes32String } from '@ethersproject/strings'

import { formatSmart, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { DEFAULT_DECIMALS, MINIMUM_ATOM_VALUE, ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER, TEN_BIG_NUMBER } from 'const'
import { arrayify } from 'ethers/lib/utils'
import { FormatAmountPrecision } from 'utils'

import {
  HIGH_PRECISION_DECIMALS,
  HIGH_PRECISION_SMALL_LIMIT,
  MIDDLE_PRECISION_DECIMALS,
  NO_ADJUSTMENT_NEEDED_PRECISION,
} from '../explorer/const'

export {
  formatSmart,
  formatAmountFull,
  adjustPrecision,
  parseAmount,
  abbreviateString,
  safeTokenName,
  safeFilledToken,
  formatPrice,
} from '@gnosis.pm/dex-js'

// TODO: Move utils to dex-utils

export function makeMultipleOf(mult = 5, value?: number | string | null): number {
  const cache = {}
  const numValue = Number(value)

  if (numValue === 0 || !value || isNaN(numValue)) return 0
  if (!(numValue % mult) || cache[numValue]) return numValue

  const remainder = numValue % mult

  let finalVal
  if (remainder > mult / 2) {
    cache[numValue] = numValue
    finalVal = numValue - remainder + mult
  } else {
    cache[numValue] = numValue
    finalVal = numValue - remainder
  }

  return finalVal
}

/**
 * Prevents invalid numbers from being inserted by hand in the URL
 *
 * @param value Input from URL
 */
export function sanitizeInput(value?: string | null, defaultValue = '0'): string {
  return value && Number(value) ? value : defaultValue
}

/**
 * Prevents invalid NEGATIVE numbers from being inserted by hand in the URL
 * Pushes number to nearest multiple of 5 (batch time)
 *
 * @param value Input from URL
 */
export function sanitizeNegativeAndMakeMultipleOf(value?: string | number | null, defaultValue = '0'): string {
  return typeof value === 'number' || (typeof value === 'string' && Number(value) >= 0)
    ? makeMultipleOf(5, value).toString()
    : defaultValue
}

export function validatePositiveConstructor(message: string) {
  return (value: string, constraint = 0): true | string => Number(value) > constraint || message
}
export const validInputPattern = /^\d+\.?\d*$/ // allows leading and trailing zeros
export const leadingAndTrailingZeros = /(^0*(?=\d)|\.0*$)/g // removes leading zeros and trailing '.' followed by zeros
export const trailingZerosAfterDot = /(.*\.\d+?)0*$/ // selects valid input without leading zeros after '.'

/**
 * Removes extra leading and trailing zeros, while allowing for partial numbers, so users can input decimals manually
 * //    0 -> 0. -> 0.1 -> 0.10 -> 0.105
 *
 * @param value The input value to parse
 */
export function formatPartialNumber(value: string): string {
  return value.replace(leadingAndTrailingZeros, '').replace(trailingZerosAfterDot, '$1')
}

export const formatTimeInHours = (
  validTime: string | number,
  matchedConstraintText: string,
  errorText = 'Invalid time - time cannot be negative'
): string =>
  +validTime === 0
    ? matchedConstraintText
    : +validTime < 0
    ? errorText
    : `in ~
${(+validTime / 60).toFixed(2).replace(leadingAndTrailingZeros, '').replace(trailingZerosAfterDot, '$1')}
hours`

export function parseBigNumber(value: string): BigNumber | null {
  const bigNumber = new BigNumber(value)
  return bigNumber.isNaN() ? null : bigNumber
}

/**
 * Formats percentage values with 2 decimals of precision.
 * Adds `%` at the end
 * Adds `<` at start when smaller than 0.01
 * Adds `>` at start when greater than 99.99
 *
 * @param percentage Raw percentage value. E.g.: 50% == 0.5
 */
export function formatPercentage(percentage: BigNumber): string {
  const displayPercentage = percentage.times(ONE_HUNDRED_BIG_NUMBER)

  if (displayPercentage.gt('0') && displayPercentage.lt('0.01')) {
    return '<0.01%'
  }

  if (displayPercentage.gt('99.99') && displayPercentage.lt('100')) {
    return '>99.99%'
  }

  return (
    formatSmart({
      amount: displayPercentage.decimalPlaces(2, BigNumber.ROUND_DOWN).toString(),
      precision: 0,
      thousandSeparator: false,
      decimals: 2,
    }) + '%'
  )
}

/**
 * @function formatBigNumberToPrecisionAndRoundingFactory
 *
 * @description sets decimal places on BigNumber amount using current ROUDING_MODE selected. Removes any extra right padded zeroes.
 *
 * @example
 * // 0.437300089
 * amountToPrecisionDown(new BigNumber("0.437300089"), 5).toString(10) // => "0.4373" Note: it removes the extra "0" padded right
 * amountToPrecisionDown(new BigNumber("0.437300089"), 2).toString(10) // => "0.43"   Note: it does NOT round to 0.44!
 *
 * @param ROUNDING_MODE BigNumber.RoundingMode
 */
export const formatBigNumberToPrecisionAndRoundingFactory =
  (ROUNDING_MODE: BigNumber.RoundingMode) =>
  (amount: BigNumber, precision: number): BigNumber =>
    amount.decimalPlaces(precision, ROUNDING_MODE)

/**
 * @function amountToPrecisionDown
 *
 * @description Rounds DOWN - see example below
 * @param amount BigNumber amount
 * @param precision number of decimal places to show
 *
 * @example
 * // 0.437300089
 * amountToPrecisionDown(new BigNumber("0.437300089"), 5).toString(10) // => "0.4373" Note: it removes the extra "0" padded right
 * amountToPrecisionDown(new BigNumber("0.437300089"), 2).toString(10) // => "0.43"   Note: it does NOT round to 0.44!
 */
export const amountToPrecisionDown = formatBigNumberToPrecisionAndRoundingFactory(BigNumber.ROUND_DOWN)

/**
 * @function amountToPrecisionUp
 *
 * @description Rounds UP - see example below
 * @param amount BigNumber amount
 * @param precision number of decimal places to show
 *
 * @example
 * // 0.437300089
 * amountToPrecisionUp(new BigNumber("0.437300089"), 5).toString(10) // => "0.4373" Note: it removes the extra "0" padded right
 * amountToPrecisionUp(new BigNumber("0.437300089"), 3).toString(10) // => "0.44"   Note: it DOES round to 0.44 from 0.437!
 */
export const amountToPrecisionUp = formatBigNumberToPrecisionAndRoundingFactory(BigNumber.ROUND_UP)

export function formatPriceWithFloor(price: BigNumber): string {
  const LOW_PRICE_FLOOR = new BigNumber('0.0001')
  if (!price || price.isZero()) return 'N/A'

  const displayPrice = amountToPrecisionDown(price, DEFAULT_DECIMALS).toString(10)
  return price.gt(LOW_PRICE_FLOOR) ? displayPrice : '< ' + LOW_PRICE_FLOOR.toString(10)
}

export function capitalize(sentence: string): string {
  return sentence
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function getMinimumRepresentableValue(decimals?: number): string {
  // Small limit === 1 token atom in relation to token units.
  // E.g.: Token decimals: 5; 1 unit => 100000; 1 atom => 0.00001 === small limit
  return decimals ? ONE_BIG_NUMBER.div(TEN_BIG_NUMBER.exponentiatedBy(decimals)).toString(10) : MINIMUM_ATOM_VALUE
}

/**
 * Wrapper around `formatSmart` that formats amount to max precision for given token.
 * Assumes `amount` to be in atom units. E.g:
 * amount: 10001
 * token.decimals: 4
 * return: 1.0001
 *
 * @param amount BigNumber integer amount
 * @param token Erc20 token
 */
export function formatSmartMaxPrecision(amount: BigNumber, token?: TokenErc20 | null): string {
  return formatSmart({
    amount: amount.toString(10),
    precision: token?.decimals || 0,
    decimals: token?.decimals || 0,
    smallLimit: getMinimumRepresentableValue(token?.decimals),
  })
}

/**
 * Transforms a BigNumber order calculatedPrice (buy/sell) into a string
 * based on buyToken / sellToken (Erc20 both of them)
 * e.g:
 * return: 3,000.2 USDT per WETH
 *
 * @param calculatedPrice BigNumber integer amount
 * @param buyToken Erc20 token
 * @param sellToken Erc20 token
 * @param inverted Optional. Whether to invert the price (1/price).
 */

export function formatCalculatedPriceToDisplay(
  calculatedPrice: BigNumber,
  buyToken: TokenErc20,
  sellToken: TokenErc20,
  isPriceInverted?: boolean
): string {
  const displayPrice = calculatedPrice.toString(10)
  const formattedPrice = formatSmart({
    amount: displayPrice,
    precision: NO_ADJUSTMENT_NEEDED_PRECISION,
    smallLimit: HIGH_PRECISION_SMALL_LIMIT,
    decimals: HIGH_PRECISION_DECIMALS,
  })
  const buySymbol = safeTokenName(buyToken)
  const sellSymbol = safeTokenName(sellToken)

  const quoteSymbol = isPriceInverted ? buySymbol : sellSymbol

  return `${formattedPrice} ${quoteSymbol}`
}

export function formatExecutedPriceToDisplay(
  calculatedPrice: BigNumber,
  buyToken: TokenErc20,
  sellToken: TokenErc20,
  isPriceInverted?: boolean
): string {
  const displayPrice = calculatedPrice.toString(10)
  const formattedPrice = formatSmart({
    amount: displayPrice,
    precision: NO_ADJUSTMENT_NEEDED_PRECISION,
    smallLimit: HIGH_PRECISION_SMALL_LIMIT,
    decimals: HIGH_PRECISION_DECIMALS,
  })
  const buySymbol = safeTokenName(buyToken)
  const sellSymbol = safeTokenName(sellToken)
  const baseSymbol = isPriceInverted ? sellSymbol : buySymbol

  return `${formattedPrice} ${baseSymbol}`
}

/**
 * @param amount BigNumber integer amount
 * @param token Erc20 token
 */
export function formattingAmountPrecision(
  amount: BigNumber,
  token: TokenErc20 | null,
  typePrecision: FormatAmountPrecision
): string {
  const typeFormatPrecision = {
    [FormatAmountPrecision.highPrecision]: HIGH_PRECISION_DECIMALS,
    [FormatAmountPrecision.middlePrecision]: MIDDLE_PRECISION_DECIMALS,
  }
  return formatSmart({
    amount: amount.toString(10),
    precision: token?.decimals || 0,
    decimals: typeFormatPrecision[typePrecision],
    smallLimit: getMinimumRepresentableValue(typeFormatPrecision[typePrecision]),
  })
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

export function parseStringOrBytes32(value: string | undefined, defaultValue: string): string {
  return value && BYTES32_REGEX.test(value) && arrayify(value)[31] === 0
    ? parseBytes32String(value)
    : value && value.length > 0
    ? value
    : defaultValue
}
