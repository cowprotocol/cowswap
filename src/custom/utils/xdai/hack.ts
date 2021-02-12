// this file essentially provides all the overrides employed in uniswap-xdai-sdk fork
// + logic for chainId switch to/from xDAI
import { ETHER, ChainId } from '@uniswap/sdk'

let currentChainId: ChainId | undefined

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
    ETHER.name = 'xDai'
    // @ts-expect-error
    ETHER.symbol = 'XDAI'

    return
  } else {
    // @ts-expect-error
    ETHER.name = 'Ether'
    // @ts-expect-error
    ETHER.symbol = 'ETH'
  }
}
