import {
  ALL_SUPPORTED_CHAINS_MAP,
  areAddressesEqual,
  getAddressKey,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk'
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
    destinationChainTokens && outputTokenAddress
      ? resolveDestinationToken(destinationChainId, destinationChainTokens, outputTokenAddress)
      : undefined

  return { sourceToken, intermediateToken, destinationToken }
}

function resolveDestinationToken(
  destinationChainId: SupportedChainId,
  destinationChainTokens: Record<string, TokenInfo>,
  outputTokenAddress: string,
): TokenInfo | undefined {
  const address = getAddressKey(outputTokenAddress)
  const token = destinationChainTokens[address]
  const wrapped = WRAPPED_NATIVE_CURRENCIES[destinationChainId]
  const destinationChain = ALL_SUPPORTED_CHAINS_MAP[destinationChainId]

  // Bungee has problems with WETH/ETH
  // So we need to map them
  if (!token && wrapped && areAddressesEqual(wrapped.address, address)) {
    return destinationChain.nativeCurrency as TokenInfo
  }

  return token
}
