import { useEffect, useState } from 'react'

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
  const { data: currentEnvOrders, isLoading } = useSWR(
    requestParams && chainId ? ['orders', requestParams, chainId] : null,
    ([, params, _chainId]) => getOrders(params, { chainId: _chainId }),
    { refreshInterval: ORDER_BOOK_API_UPDATE_INTERVAL, fallbackData: emptyOrders },
  )

  const [prevEnvOrdersState, setPrevEnvOrdersState] = useState<{
    orders: EnrichedOrder[]
    key: string
  }>({ orders: emptyOrders, key: '' })

  const owner = requestParams?.owner
  const currentKey = `${chainId}::${owner ?? ''}`

  useEffect(() => {
    // Reset prevEnvOrders if chain or account change.
    setPrevEnvOrdersState({ orders: emptyOrders, key: '' })
  }, [chainId, owner])

  useEffect(() => {
    if (!isLoading) setPrevEnvOrdersState({ orders: currentEnvOrders, key: currentKey })
  }, [currentEnvOrders, isLoading, currentKey])

  // Because we now keep expanding the limit param to be able to load older orders, we want to keep displaying the
  // previous smaller batch while the new larger one is being fetched:
  return isLoading && prevEnvOrdersState.key === currentKey ? prevEnvOrdersState.orders : currentEnvOrders
}
