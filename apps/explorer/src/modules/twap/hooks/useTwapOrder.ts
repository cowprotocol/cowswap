import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import useSWR, { SWRResponse } from 'swr'
import { TWAP_SUPPORTED_CHAIN_IDS } from 'utils'

import { programmaticOrdersApi } from '../programmaticOrdersApi.service'
import { TWAP_REFRESH_INTERVAL } from '../twap.constants'

export interface ResolvedTwapOrder {
  chainId: SupportedChainId
  order: TwapOrder
}

interface UseTwapOrderParams {
  eventId: string
  chainId: SupportedChainId
  enabled: boolean
  searchAllChains: boolean
}

export async function findTwapOrder(
  eventId: string,
  selectedChainId: SupportedChainId,
  searchAllChains: boolean,
): Promise<ResolvedTwapOrder | null> {
  const selectedOrder = await programmaticOrdersApi.getTwapOrder({ eventId, chainId: selectedChainId })

  if (selectedOrder) return { chainId: selectedChainId, order: selectedOrder }
  if (!searchAllChains) return null

  const remainingChainIds = TWAP_SUPPORTED_CHAIN_IDS.filter((chainId) => chainId !== selectedChainId)
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
    enabled ? ['twap-order', eventId, chainId, searchAllChains] : null,
    () => findTwapOrder(eventId, chainId, searchAllChains),
    { refreshInterval: TWAP_REFRESH_INTERVAL },
  )
}
