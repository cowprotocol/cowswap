// this file essentially provides all the overrides employed in uniswap-xdai-sdk fork
// + logic for chainId switch to/from xDAI
import { SupportedChainId as ChainId } from 'constants/chains'
import { ExtendedEther as ETHER } from 'constants/tokens'

let currentChainId: ChainId | undefined

const XDAI_SYMBOL = 'xDai'
const CURRENCY_SYMBOLS_XDAI = { native: XDAI_SYMBOL, wrapped: 'wxDAI' }
const CURRENCY_SYMBOLS_ETH = { native: 'Ether', wrapped: 'WETH' }

// Hack to fix the name of the Chain token (hardcoded in uniswap)
export const switchParamsByNetwork = (chainId?: ChainId) => {
  if (currentChainId === chainId) return

  console.log('[util:xdai] Changing library internal parameters for chainId', chainId)

  currentChainId = chainId

  if (chainId === ChainId.XDAI) {
    // ETHER is used in a bunch of places
    // Including internaly by the lib
    // easier to change name+symbol
    // this way you seeXDAI in Token selector when on xDAI
    // @ts-expect-error
    ETHER.onChain(chainId).name = XDAI_SYMBOL
    // @ts-expect-error
    ETHER.onChain(chainId).symbol = XDAI_SYMBOL

    return
  } else {
    // @ts-expect-error
    ETHER.onChain(chainId).name = 'Ether'
    // @ts-expect-error
    ETHER.onChain(chainId).symbol = 'ETH'
  }
}

export function getChainCurrencySymbols(chainId?: ChainId): { native: string; wrapped: string } {
  if (!chainId) return CURRENCY_SYMBOLS_ETH
  return ETHER.onChain(chainId).symbol === XDAI_SYMBOL ? CURRENCY_SYMBOLS_XDAI : CURRENCY_SYMBOLS_ETH
}
