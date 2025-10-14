import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

const CURRENCY_SYMBOLS_ETH = { native: 'Ether', wrapped: 'WETH' }

export function getChainCurrencySymbols(chainId: SupportedChainId): { native: string; wrapped: string } {
  const native = NATIVE_CURRENCIES[chainId]?.symbol
  const wrapped = WRAPPED_NATIVE_CURRENCIES[chainId]?.symbol

  if (!native || !wrapped) {
    return CURRENCY_SYMBOLS_ETH
  }

  return { native, wrapped }
}
