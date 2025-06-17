import { CrossChainOrder } from '@cowprotocol/cow-sdk'
import type { TokenInfo } from '@uniswap/token-lists'

import { useTokenList } from '../../../hooks/useTokenList'

export interface CrossChainTokens<T = TokenInfo | undefined> {
  sourceToken: T
  intermediateToken: T
  destinationToken: T
}

export function useCrossChainTokens(crossChainOrder: CrossChainOrder): CrossChainTokens {
  const {
    bridgingParams: { sourceChainId, destinationChainId, inputTokenAddress, outputTokenAddress },
    order,
  } = crossChainOrder
  const { data: sourceTokens } = useTokenList(sourceChainId)
  const { data: destinationTokens } = useTokenList(destinationChainId)

  const sourceToken = sourceTokens && sourceTokens[inputTokenAddress.toLowerCase()]
  const intermediateToken = destinationTokens && destinationTokens[order.buyToken.toLowerCase()]
  const destinationToken = Boolean(destinationTokens && outputTokenAddress)
    ? destinationTokens[outputTokenAddress.toLowerCase()]
    : undefined

  return { sourceToken, intermediateToken, destinationToken }
}
