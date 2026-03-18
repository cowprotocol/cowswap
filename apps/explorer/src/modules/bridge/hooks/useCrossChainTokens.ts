import { getAddressKey } from '@cowprotocol/cow-sdk'
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

  const sourceToken = sourceTokens && sourceTokens[getAddressKey(inputTokenAddress)]
  const intermediateToken = sourceTokens && sourceTokens[getAddressKey(order.buyToken)]
  const destinationToken =
    destinationChainTokens && outputTokenAddress ? destinationChainTokens[getAddressKey(outputTokenAddress)] : undefined

  return { sourceToken, intermediateToken, destinationToken }
}
