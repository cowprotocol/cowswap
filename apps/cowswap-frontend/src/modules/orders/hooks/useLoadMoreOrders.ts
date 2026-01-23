import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { useApiOrders } from './useApiOrders'

import { ordersLimitAtom } from '../state/ordersLimitAtom'

interface UseLoadMoreOrdersReturn {
  limit: number
  isLoading: boolean
  hasMoreOrders: boolean
  loadMore: () => void
}

export function useLoadMoreOrders(): UseLoadMoreOrdersReturn {
  const { limit, isLoading } = useAtomValue(ordersLimitAtom)
  const setOrdersLimit = useSetAtom(ordersLimitAtom)
  const orders = useApiOrders()

  useEffect(() => {
    setOrdersLimit((prev) => ({ ...prev, isLoading: false }))
  }, [orders, setOrdersLimit])

  const loadMore = (): void => {
    setOrdersLimit((prev) => ({ limit: prev.limit + AMOUNT_OF_ORDERS_TO_FETCH, isLoading: true }))
  }

  const hasMoreOrders = isLoading || (orders && orders.length > 0 && orders.length >= limit - AMOUNT_OF_ORDERS_TO_FETCH)

  return {
    limit,
    isLoading,
    hasMoreOrders,
    loadMore,
  }
}
