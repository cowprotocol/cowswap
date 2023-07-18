import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { GP_ORDER_UPDATE_INTERVAL } from 'legacy/constants'

import { useSWROrdersRequest } from 'modules/orders/hooks/useSWROrdersRequest'
import { useWalletInfo } from 'modules/wallet'

import { getOrders } from './api'

export function useGpOrders(): EnrichedOrder[] {
  const { chainId } = useWalletInfo()

  const requestParams = useSWROrdersRequest()

  // Fetch orders for the current environment
  const { data: currentEnvOrders } = useSWR<EnrichedOrder[]>(
    ['orders', requestParams, chainId],
    () => {
      if (!chainId || !requestParams) return []

      return getOrders(requestParams, { chainId })
    },
    { refreshInterval: GP_ORDER_UPDATE_INTERVAL }
  )

  return currentEnvOrders || []
}
