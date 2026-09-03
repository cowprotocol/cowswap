import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { QueryPage, TwapPartOrder } from '@cowprotocol/sdk-composable'

import useSWR, { SWRResponse } from 'swr'

import { programmaticOrdersApi } from '../programmaticOrdersApi.service'
import { TWAP_REFRESH_INTERVAL } from '../twap.constants'

interface UseTwapPartOrdersParams {
  eventId: string
  chainId: SupportedChainId
  limit: number
  offset: number
  enabled: boolean
}

export function useTwapPartOrders({
  eventId,
  chainId,
  limit,
  offset,
  enabled,
}: UseTwapPartOrdersParams): SWRResponse<QueryPage<TwapPartOrder>> {
  return useSWR(
    enabled ? ['twap-part-orders', eventId, chainId, limit, offset] : null,
    () => programmaticOrdersApi.getTwapPartOrders({ eventId, chainId }, { limit, offset, direction: 'asc' }),
    {
      keepPreviousData: true,
      refreshInterval: offset === 0 ? TWAP_REFRESH_INTERVAL : 0,
    },
  )
}
