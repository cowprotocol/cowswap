import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'

// Amount of native currency to leave for gas when selling the max amount.
// Chains with higher gas costs reserve more of the native balance.
const MIN_NATIVE_CURRENCY_FOR_GAS_HIGH: bigint = 10n ** 16n // 0.01 native
const MIN_NATIVE_CURRENCY_FOR_GAS_LOW: bigint = 10n ** 15n // 0.001 native

// Chains that should reserve the higher amount (0.01) of native currency for gas.
const HIGH_NATIVE_GAS_RESERVE_CHAINS: Set<SupportedChainId> = new Set([
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.SEPOLIA,
])

function getMinNativeCurrencyForGas(chainId: number): bigint {
  return HIGH_NATIVE_GAS_RESERVE_CHAINS.has(chainId as SupportedChainId)
    ? MIN_NATIVE_CURRENCY_FOR_GAS_HIGH
    : MIN_NATIVE_CURRENCY_FOR_GAS_LOW
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
      return CurrencyAmount.fromRawAmount(currencyAmount.currency, currencyAmount.quotient - minNativeCurrencyForGas)
    } else {
      return CurrencyAmount.fromRawAmount(currencyAmount.currency, 0n)
    }
  }
  return currencyAmount
}
