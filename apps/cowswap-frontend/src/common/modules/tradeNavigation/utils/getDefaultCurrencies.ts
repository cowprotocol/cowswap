import { USDC, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TradeCurrencies } from '../types'

export function getDefaultCurrencies(chainId: SupportedChainId | null): TradeCurrencies {
  return {
    inputCurrency: chainId ? WETH[chainId] || null : null,
    outputCurrency: chainId ? USDC[chainId] || null : null,
  }
}
