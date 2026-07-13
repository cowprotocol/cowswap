import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'

// Avoid BigInt literals / ** — Webpack/Babel can rewrite them to Math.pow/Number and crash
const MIN_NATIVE_CURRENCY_FOR_GAS = BigInt('10000000000000000') // 0.01 ETH

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 * @param canUseAllNative whether or not the use can use all the native currency, if native
 */
export function maxAmountSpend(
  currencyAmount?: CurrencyAmount<Currency>,
  canUseAllNative?: boolean,
): CurrencyAmount<Currency> | undefined {
  if (!currencyAmount) return undefined
  if (getIsNativeToken(currencyAmount.currency) && !canUseAllNative) {
    if (currencyAmount.quotient > MIN_NATIVE_CURRENCY_FOR_GAS) {
      return CurrencyAmount.fromRawAmount(
        currencyAmount.currency,
        currencyAmount.quotient - MIN_NATIVE_CURRENCY_FOR_GAS,
      )
    } else {
      return CurrencyAmount.fromRawAmount(currencyAmount.currency, BigInt(0))
    }
  }
  return currencyAmount
}
