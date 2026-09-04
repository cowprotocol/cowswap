import { USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { TradeCurrencies, TradeCurrenciesIds } from '../types'

export function getDefaultCurrencies(chainId: SupportedChainId | null): TradeCurrencies {
  return {
    inputCurrency: chainId ? WRAPPED_NATIVE_CURRENCIES[chainId] || null : null,
    outputCurrency: chainId ? USDC[chainId] || null : null,
  }
}

export function getDefaultTradeCurrenciesIds(chainId: SupportedChainId | null): TradeCurrenciesIds {
  const { inputCurrency, outputCurrency } = getDefaultCurrencies(chainId)
  // Currently WETH/wxDAI, less likely to be duplicated, symbol is fine
  // Non-EVM chains are exclusion
  const inputCurrencyId = (!!chainId && isEvmChain(chainId) ? inputCurrency?.symbol : inputCurrency?.address) ?? null

  return {
    inputCurrencyId,
    outputCurrencyId: outputCurrency?.address || null, // Currently USDC, more likely to be duplicated, better to use address
  }
}
