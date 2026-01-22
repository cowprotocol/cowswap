import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { ORDERS_LIMIT_INCREMENT } from '@cowprotocol/common-const'

import { useApiOrders } from './useApiOrders'

import { ordersLimitAtom } from '../state/ordersLimitAtom'

interface UseLoadMoreOrdersReturn {
  limit: number
  isLoading: boolean
  hasMoreOrders: boolean
  loadMore: () => void
}

export function useLoadMoreOrders(): UseLoadMoreOrdersReturn {
  // const { account, chainId } = useWalletInfo()
  const { limit, isLoading } = useAtomValue(ordersLimitAtom)
  const setOrdersLimit = useSetAtom(ordersLimitAtom)
  const orders = useApiOrders()

  useEffect(() => {
    // TODO: For some reason, orders come back as [] before each update...
    setOrdersLimit((prev) => ({ ...prev, isLoading: false }))
  }, [orders, setOrdersLimit])

  // TODO: Move to atom:
  // Reset limit when account or chainId changes
  // useEffect(() => {
  //   setOrdersLimit(DEFAULT_ORDERS_LIMIT_STATE)
  // }, [account, chainId, setOrdersLimit])

  const loadMore = (): void => {
    setOrdersLimit((prev) => ({ limit: prev.limit + ORDERS_LIMIT_INCREMENT, isLoading: true }))
  }

  const hasMoreOrders = isLoading || (orders && orders.length >= limit - ORDERS_LIMIT_INCREMENT)

  console.log(orders.length, limit, 'hasMoreOrders =', hasMoreOrders)

  return {
    limit,
    isLoading,
    hasMoreOrders,
    loadMore,
  }
}
