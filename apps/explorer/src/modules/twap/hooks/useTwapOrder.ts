import { ALL_SUPPORTED_CHAIN_IDS, isEvmChain, type SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { ORDERS_QUERY_INTERVAL } from 'explorer/const'
import useSWR, { SWRResponse } from 'swr'

import { programmaticOrdersApi } from '../programmaticOrdersApi.service'

export interface ResolvedTwapOrder {
  chainId: SupportedChainId
  order: TwapOrder
}

interface UseTwapOrderParams {
  eventId: string
  chainId: SupportedChainId | null | undefined
  enabled: boolean | undefined
  searchAllChains: boolean
}

export async function findTwapOrder(
  eventId: string,
  selectedChainId: SupportedChainId,
  searchAllChains: boolean,
): Promise<ResolvedTwapOrder | null> {
  const selectedOrder = isEvmChain(selectedChainId)
    ? await programmaticOrdersApi.getTwapOrder({ eventId, chainId: selectedChainId })
    : null

  if (selectedOrder) return { chainId: selectedChainId, order: selectedOrder }
  if (!searchAllChains) return null

  // The programmatic orders API accepts EVM chains only.
  const remainingChainIds = ALL_SUPPORTED_CHAIN_IDS.filter(
    (chainId) => chainId !== selectedChainId && isEvmChain(chainId),
  )
  const results = await Promise.all(
    remainingChainIds.map(async (chainId): Promise<ResolvedTwapOrder | null> => {
      const order = await programmaticOrdersApi.getTwapOrder({ eventId, chainId })
      return order ? { chainId, order } : null
    }),
  )

  return results.find((result): result is ResolvedTwapOrder => result !== null) ?? null
}

export function useTwapOrder({
  eventId,
  chainId,
  enabled,
  searchAllChains,
}: UseTwapOrderParams): SWRResponse<ResolvedTwapOrder | null> {
  return useSWR(
    enabled && chainId != null ? (['twap-order', eventId, chainId, searchAllChains] as const) : null,
    ([, eventId, chainId, searchAllChains]) => findTwapOrder(eventId, chainId, searchAllChains),
    { refreshInterval: ORDERS_QUERY_INTERVAL },
  )
}
