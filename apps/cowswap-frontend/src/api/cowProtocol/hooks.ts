import { ORDER_BOOK_API_UPDATE_INTERVAL } from '@cowprotocol/common-const'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useSWROrdersRequest } from 'modules/orders/hooks/useSWROrdersRequest'

import { getOrders } from './api'

const emptyOrders: EnrichedOrder[] = []

export function useOrdersFromOrderBook(): EnrichedOrder[] {
  const { chainId } = useWalletInfo()

  const requestParams = useSWROrdersRequest()

  // Fetch orders for the current environment
  const { data: currentEnvOrders } = useSWR(
    requestParams && chainId ? ['orders', requestParams, chainId] : null,
    ([, params, _chainId]) => getOrders(params, { chainId: _chainId }),
    { refreshInterval: ORDER_BOOK_API_UPDATE_INTERVAL, fallbackData: emptyOrders },
  )

  return currentEnvOrders
}
