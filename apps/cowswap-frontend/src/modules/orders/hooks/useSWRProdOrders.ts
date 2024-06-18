import { useMemo } from 'react'

import { ORDER_BOOK_API_UPDATE_INTERVAL } from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { getOrders } from 'api/cowProtocol'

import { useApiOrders } from './useApiOrders'
import { useSWROrdersRequest } from './useSWROrdersRequest'

const EMPTY_ORDERS: EnrichedOrder[] = []

// Fetch PROD orders only when current env is not prod
// We need them for TWAP, because WatchTower creates orders only on Prod
export function useSWRProdOrders(): EnrichedOrder[] {
  const { chainId } = useWalletInfo()
  const requestParams = useSWROrdersRequest()
  const apiOrders = useApiOrders()

  const { data: loadedProdOrders = EMPTY_ORDERS } = useSWR<EnrichedOrder[]>(
    ['prod-orders', requestParams, chainId],
    () => {
      if (!chainId || !requestParams || !isBarnBackendEnv) return EMPTY_ORDERS

      return getOrders(requestParams, { chainId, env: 'prod' })
    },
    { refreshInterval: ORDER_BOOK_API_UPDATE_INTERVAL }
  )

  return useMemo(() => {
    return isBarnBackendEnv ? loadedProdOrders : apiOrders
  }, [apiOrders, loadedProdOrders])
}
