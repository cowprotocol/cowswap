import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'

// Amount of native currency to leave for gas when selling the max amount.
// Values were derived from researched live gas costs per chain (see PR discussion).
const MIN_NATIVE_CURRENCY_FOR_GAS_MAINNET: bigint = 10n ** 16n // 0.01 native (Mainnet, Sepolia)
const MIN_NATIVE_CURRENCY_FOR_GAS_POLYGON: bigint = 10n ** 17n // 0.1 POL (Polygon: high gas price relative to POL's USD value)
const MIN_NATIVE_CURRENCY_FOR_GAS_MID: bigint = 3n * 10n ** 15n // 0.003 native (BNB Chain, Linea)
const MIN_NATIVE_CURRENCY_FOR_GAS_LOW: bigint = 10n ** 15n // 0.001 native (Gnosis Chain, Arbitrum One, Base, Avalanche, Ink, Plasma)
// SOL has 9 decimals, unlike the 18-decimal tiers above, so it needs its own value rather than the
// LOW fallback. Covers the ~5_000 lamport fee plus the 2_039_280 lamport rent-exempt reserve that
// creating the wrapped-SOL associated token account requires.
const MIN_NATIVE_CURRENCY_FOR_GAS_SOLANA: bigint = 10n ** 7n // 0.01 SOL

// Per-chain native currency reserve for gas. Chains not listed fall back to the LOW tier.
const MIN_NATIVE_CURRENCY_FOR_GAS: Partial<Record<SupportedChainId, bigint>> = {
  [SupportedChainId.MAINNET]: MIN_NATIVE_CURRENCY_FOR_GAS_MAINNET,
  [SupportedChainId.SEPOLIA]: MIN_NATIVE_CURRENCY_FOR_GAS_MAINNET,
  [SupportedChainId.POLYGON]: MIN_NATIVE_CURRENCY_FOR_GAS_POLYGON,
  [SupportedChainId.BNB]: MIN_NATIVE_CURRENCY_FOR_GAS_MID,
  [SupportedChainId.LINEA]: MIN_NATIVE_CURRENCY_FOR_GAS_MID,
  [SupportedChainId.GNOSIS_CHAIN]: MIN_NATIVE_CURRENCY_FOR_GAS_LOW,
  [SupportedChainId.ARBITRUM_ONE]: MIN_NATIVE_CURRENCY_FOR_GAS_LOW,
  [SupportedChainId.BASE]: MIN_NATIVE_CURRENCY_FOR_GAS_LOW,
  [SupportedChainId.AVALANCHE]: MIN_NATIVE_CURRENCY_FOR_GAS_LOW,
  [SupportedChainId.INK]: MIN_NATIVE_CURRENCY_FOR_GAS_LOW,
  [SupportedChainId.PLASMA]: MIN_NATIVE_CURRENCY_FOR_GAS_LOW,
  [SupportedChainId.SOLANA]: MIN_NATIVE_CURRENCY_FOR_GAS_SOLANA,
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

function getMinNativeCurrencyForGas(chainId: number): bigint {
  return MIN_NATIVE_CURRENCY_FOR_GAS[chainId as SupportedChainId] ?? MIN_NATIVE_CURRENCY_FOR_GAS_LOW
}
