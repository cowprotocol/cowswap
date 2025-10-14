import type { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import type { TokenInfo } from '@uniswap/token-lists'

import { useBridgeProviderBuyTokens } from './useBridgeProviderBuyTokens'

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
    provider,
  } = crossChainOrder
  const { data: sourceTokens } = useTokenList(sourceChainId)

  const { data: destinationChainTokens } = useBridgeProviderBuyTokens(provider, destinationChainId)

  const sourceToken = sourceTokens && sourceTokens[inputTokenAddress.toLowerCase()]
  const intermediateToken = sourceTokens && sourceTokens[order.buyToken.toLowerCase()]
  const destinationToken =
    destinationChainTokens && outputTokenAddress ? destinationChainTokens[outputTokenAddress.toLowerCase()] : undefined

  return { sourceToken, intermediateToken, destinationToken }
}
