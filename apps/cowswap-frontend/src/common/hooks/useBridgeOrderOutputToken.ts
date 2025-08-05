import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { CrossChainOrder } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import type { Order } from 'legacy/state/orders/actions'

/**
 * Derives a bridge output token considering swap order source (localStorage or API)
 */
export function useBridgeOrderOutputToken(
  order: Order | undefined,
  crossChainOrder: Nullish<CrossChainOrder>,
): TokenWithLogo | undefined {
  const localOrderOutputToken = order?.outputToken
  /**
   * When order was added to the store while posting order, its outputToken will be a token from destination chain
   * But when we clear localStorage, the order.outputToken will actually be an intermediate token
   * So, when order is not from localStorage cache we should take token from crossChainOrder
   */
  const isLocalOrderCached = !!order && order.inputToken.chainId !== order.outputToken.chainId

  const outputTokenAddress = crossChainOrder?.bridgingParams.outputTokenAddress
  const destinationChainId = isLocalOrderCached
    ? order.outputToken.chainId
    : crossChainOrder?.bridgingParams.destinationChainId

  const tokens = useBridgeSupportedTokens(
    isLocalOrderCached || !destinationChainId ? undefined : { buyChainId: destinationChainId },
  ).data

  return useMemo(() => {
    if (isLocalOrderCached) return localOrderOutputToken as TokenWithLogo

    if (!tokens?.length || !outputTokenAddress) {
      // Fallback to localOrderOutputToken when crossChainOrder data is still loading
      // This prevents swapAndBridgeOverview from being undefined in fresh sessions
      return localOrderOutputToken as TokenWithLogo
    }

    const tokenAddressLower = outputTokenAddress.toLowerCase()
    const token = tokens.find((token) => token.address.toLowerCase() === tokenAddressLower)

    // This is actually a hack
    // For some reason Bungee replaces ETH with WETH, so we cannot find WETH in tokens
    // Here we fallback to localOrderOutputToken to show at least something
    return token ?? (localOrderOutputToken as TokenWithLogo)
  }, [isLocalOrderCached, localOrderOutputToken, tokens, outputTokenAddress])
}
