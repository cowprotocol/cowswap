import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getIsNativeToken } from './getIsNativeToken'

// Amount of native currency to leave for gas when selling the max amount.
// Ethereum mainnet has the highest gas costs, so we reserve more there.
const MIN_NATIVE_CURRENCY_FOR_GAS_MAINNET: bigint = 10n ** 16n // 0.01 ETH
const MIN_NATIVE_CURRENCY_FOR_GAS_OTHER: bigint = 10n ** 15n // 0.001 native

function getMinNativeCurrencyForGas(chainId: number): bigint {
  return chainId === SupportedChainId.MAINNET
    ? MIN_NATIVE_CURRENCY_FOR_GAS_MAINNET
    : MIN_NATIVE_CURRENCY_FOR_GAS_OTHER
}

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
    const minNativeCurrencyForGas = getMinNativeCurrencyForGas(currencyAmount.currency.chainId)
    if (currencyAmount.quotient > minNativeCurrencyForGas) {
      return CurrencyAmount.fromRawAmount(
        currencyAmount.currency,
        currencyAmount.quotient - minNativeCurrencyForGas,
      )
    } else {
      return CurrencyAmount.fromRawAmount(currencyAmount.currency, 0n)
    }
  }
  return currencyAmount
}
