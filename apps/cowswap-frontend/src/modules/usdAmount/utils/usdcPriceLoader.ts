import { USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction } from '@uniswap/sdk-core'

import { getCowProtocolNativePrice } from '../apis/getCowProtocolNativePrice'

export function usdcPriceLoader(chainId: SupportedChainId): () => Promise<Fraction | null> {
  let usdcPricePromise: Promise<Fraction | null> | null = null

  return async () => {
    // Cache the result to avoid fetching it multiple times
    if (!usdcPricePromise) {
      usdcPricePromise = getCowProtocolNativePrice(USDC[chainId])
    }

    return usdcPricePromise
  }
}
