// this file essentially provides all the overrides employed in uniswap-xdai-sdk fork
// + logic for chainId switch to/from xDAI
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '../nativeAndWrappedTokens'

const CURRENCY_SYMBOLS_ETH = { native: 'Ether', wrapped: 'WETH' }

export function getChainCurrencySymbols(chainId?: SupportedChainId): { native: string; wrapped: string } {
  if (!chainId) return CURRENCY_SYMBOLS_ETH

  const native = NATIVE_CURRENCIES[chainId]?.symbol
  const wrapped = WRAPPED_NATIVE_CURRENCIES[chainId]?.symbol

  if (!native || !wrapped) {
    return CURRENCY_SYMBOLS_ETH
  }

  return { native, wrapped }
}
