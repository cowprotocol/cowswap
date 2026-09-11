import type { AddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { QueryPage, TwapOrder } from '@cowprotocol/sdk-composable'

import { ORDERS_QUERY_INTERVAL } from 'explorer/const'
import useSWR, { SWRResponse } from 'swr'

import { programmaticOrdersApi } from '../programmaticOrdersApi.service'

interface UseTwapOrdersParams {
  owner: AddressKey
  chainId: SupportedChainId | null | undefined
  limit: number
  offset: number
  enabled: boolean
}

export function useTwapOrders({
  owner,
  chainId,
  limit,
  offset,
  enabled,
}: UseTwapOrdersParams): SWRResponse<QueryPage<TwapOrder>> {
  return useSWR(
    enabled && chainId != null ? (['twap-orders', owner, chainId, limit, offset] as const) : null,
    ([, owner, chainId, limit, offset]) =>
      programmaticOrdersApi.getTwapOrders({ resolvedOwner: owner, chainId }, { limit, offset, direction: 'desc' }),
    {
      keepPreviousData: true,
      refreshInterval: offset === 0 ? ORDERS_QUERY_INTERVAL : 0,
    },
  )
}
