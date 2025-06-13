// this file essentially provides all the overrides employed in uniswap-xdai-sdk fork
// + logic for chainId switch to/from xDAI
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { XDAI_SYMBOL } from '../tokens'

const CURRENCY_SYMBOLS_ETH = { native: 'Ether', wrapped: 'WETH' }

const ChainCurrencySymbolsMap: Record<SupportedChainId, { native: string; wrapped: string }> = {
  [SupportedChainId.MAINNET]: CURRENCY_SYMBOLS_ETH,
  [SupportedChainId.BASE]: CURRENCY_SYMBOLS_ETH,
  [SupportedChainId.ARBITRUM_ONE]: CURRENCY_SYMBOLS_ETH,
  [SupportedChainId.GNOSIS_CHAIN]: { native: XDAI_SYMBOL, wrapped: 'wxDAI' },
  [SupportedChainId.POLYGON]: { native: 'POL', wrapped: 'WPOL' },
  [SupportedChainId.AVALANCHE]: { native: 'AVAX', wrapped: 'WAVAX' },
  [SupportedChainId.SEPOLIA]: CURRENCY_SYMBOLS_ETH,
}

export function getChainCurrencySymbols(chainId?: SupportedChainId): { native: string; wrapped: string } {
  if (!chainId) return ChainCurrencySymbolsMap[SupportedChainId.MAINNET]

  return ChainCurrencySymbolsMap[chainId]
}
