import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { parseEvmLikeChain } from './parseEvmLikeChain'

export function isSupportedChainId(chainId: string | number | undefined): chainId is SupportedChainId {
  if (chainId === undefined) return false

  try {
    const parsed = parseEvmLikeChain(chainId)
    return isSupportedChainId(parsed)
  } catch {
    return false
  }
}
