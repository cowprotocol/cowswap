import type { AddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { QueryPage, TwapOrder } from '@cowprotocol/sdk-composable'

import useSWR, { SWRResponse } from 'swr'

import { programmaticOrdersApi } from '../programmaticOrdersApi.service'
import { TWAP_REFRESH_INTERVAL } from '../twap.constants'

interface UseTwapOrdersParams {
  owner: AddressKey
  chainId: SupportedChainId
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
    enabled ? ['twap-orders', owner, chainId, limit, offset] : null,
    () => programmaticOrdersApi.getTwapOrders({ resolvedOwner: owner, chainId }, { limit, offset, direction: 'desc' }),
    {
      keepPreviousData: true,
      refreshInterval: offset === 0 ? TWAP_REFRESH_INTERVAL : 0,
    },
  )
}
