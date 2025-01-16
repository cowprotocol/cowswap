import { USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction } from '@uniswap/sdk-core'

import { getCowProtocolNativePrice } from '../apis/getCowProtocolNativePrice'

export function usdcPriceLoader(chainId: SupportedChainId): () => Promise<Fraction | null> {
  return () => getCowProtocolNativePrice(USDC[chainId])
}
