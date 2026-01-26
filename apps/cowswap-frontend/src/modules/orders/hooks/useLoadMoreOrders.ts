import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

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
  const [{ limit, isLoading }, setOrdersLimit] = useAtom(ordersLimitAtom)
  const orders = useApiOrders()

  useEffect(() => {
    setOrdersLimit((prev) => ({ ...prev, isLoading: false }))
  }, [orders, setOrdersLimit])

  const loadMore = useCallback((): void => {
    setOrdersLimit((prev) => ({ limit: prev.limit + AMOUNT_OF_ORDERS_TO_FETCH, isLoading: true }))
  }, [setOrdersLimit])

  const hasMoreOrders = isLoading || orders.length >= limit

  return useMemo(
    () => ({
      limit,
      isLoading,
      hasMoreOrders,
      loadMore,
    }),
    [limit, isLoading, hasMoreOrders, loadMore],
  )
}
