import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { ORDERS_LIMIT_INCREMENT } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useApiOrders } from './useApiOrders'

import { DEFAULT_ORDERS_LIMIT_STATE, ordersLimitAtom } from '../state/ordersLimitAtom'

interface UseLoadMoreOrdersReturn {
  limit: number
  isLoading: boolean
  hasMoreOrders: boolean
  loadMore: () => void
}

/**
 * Hook to manage "Load More" functionality for orders.
 * Increments the orders limit by 100 each time loadMore() is called.
 * Automatically resets limit when account/chainId changes.
 *
 * Uses orders from apiOrdersAtom (set by OrdersFromApiUpdater) to determine
 * if there are more orders to load, avoiding circular dependencies and hook order issues.
 */
export function useLoadMoreOrders(): UseLoadMoreOrdersReturn {
  const { account, chainId } = useWalletInfo()
  const { limit, isLoading } = useAtomValue(ordersLimitAtom)
  const setOrdersLimit = useSetAtom(ordersLimitAtom)
  // Use orders from apiOrdersAtom instead of useOrdersTableState to avoid hook order issues
  const orders = useApiOrders()

  useEffect(() => {
    console.log('FINISH loadMore')
    setOrdersLimit((prev) => ({ ...prev, isLoading: false }))
  }, [orders, setOrdersLimit])

  // Reset limit when account or chainId changes
  useEffect(() => {
    setOrdersLimit(DEFAULT_ORDERS_LIMIT_STATE)
  }, [account, chainId, setOrdersLimit])

  const loadMore = (): void => {
    console.log('loadMore', limit)
    setOrdersLimit((prev) => ({ limit: prev.limit + ORDERS_LIMIT_INCREMENT, isLoading: true }))
  }

  const hasMoreOrders = useMemo(() => {
    return orders && (orders.length >= limit || (!isLoading && orders.length > 0))
  }, [orders, limit, isLoading])

  console.log({ limit, hasMoreOrders, orders })

  return {
    limit,
    isLoading,
    hasMoreOrders,
    loadMore,
  }
}
