// this file essentially provides all the overrides employed in uniswap-xdai-sdk fork
// + logic for chainId switch to/from xDAI
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { XDAI_SYMBOL } from '../tokens'

const CURRENCY_SYMBOLS_XDAI = { native: XDAI_SYMBOL, wrapped: 'wxDAI' }
const CURRENCY_SYMBOLS_ETH = { native: 'Ether', wrapped: 'WETH' }

export function getChainCurrencySymbols(chainId?: SupportedChainId): { native: string; wrapped: string } {
  if (!chainId) return CURRENCY_SYMBOLS_ETH

  if (chainId === SupportedChainId.GNOSIS_CHAIN) {
    return CURRENCY_SYMBOLS_XDAI
  }

  return CURRENCY_SYMBOLS_ETH
}
