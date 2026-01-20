import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

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

export function useLoadMoreOrders(): UseLoadMoreOrdersReturn {
  const { account, chainId } = useWalletInfo()
  const { limit, isLoading } = useAtomValue(ordersLimitAtom)
  const setOrdersLimit = useSetAtom(ordersLimitAtom)
  const orders = useApiOrders()

  useEffect(() => {
    setOrdersLimit((prev) => ({ ...prev, isLoading: false }))
  }, [orders, setOrdersLimit])

  // Reset limit when account or chainId changes
  useEffect(() => {
    setOrdersLimit(DEFAULT_ORDERS_LIMIT_STATE)
  }, [account, chainId, setOrdersLimit])

  const loadMore = (): void => {
    setOrdersLimit((prev) => ({ limit: prev.limit + ORDERS_LIMIT_INCREMENT, isLoading: true }))
  }

  const hasMoreOrders = orders && orders.length >= limit - ORDERS_LIMIT_INCREMENT

  return {
    limit,
    isLoading,
    hasMoreOrders,
    loadMore,
  }
}
