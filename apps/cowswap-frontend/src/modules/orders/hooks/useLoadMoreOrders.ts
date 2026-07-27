import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH, MAXIMUM_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

import { TabOrderTypes } from 'entities/routes/routes.atom'

import { eoaTwapOrdersQueryAtom } from 'modules/twap/state/eoaTwapOrdersQueryAtom'

import { useApiOrdersState } from './useApiOrders'

import { ordersLimitAtom } from '../state/ordersLimitAtom'

interface UseLoadMoreOrdersReturn {
  limit: number
  isLoading: boolean
  hasMoreOrders: boolean
  loadMore: () => void
}

export function useLoadMoreOrders(orderType: TabOrderTypes): UseLoadMoreOrdersReturn {
  const isAdvancedOrders = orderType === TabOrderTypes.ADVANCED
  const eoaTwapOrdersQuery = useAtomValue(eoaTwapOrdersQueryAtom)
  const [limit, setLimit] = useAtom(ordersLimitAtom)
  const { orders: apiOrders, isLoading: apiOrdersLoading } = useApiOrdersState()
  const isLoading = isAdvancedOrders
    ? eoaTwapOrdersQuery.isFetching && eoaTwapOrdersQuery.isPlaceholderData
    : apiOrdersLoading

  const loadMore = useCallback((): void => {
    setLimit((prev) =>
      prev >= MAXIMUM_ORDERS_TO_FETCH ? prev : Math.min(prev + AMOUNT_OF_ORDERS_TO_FETCH, MAXIMUM_ORDERS_TO_FETCH),
    )
  }, [setLimit])

  const hasMore = isAdvancedOrders ? limit < (eoaTwapOrdersQuery.data?.totalCount ?? 0) : apiOrders.length >= limit
  const hasMoreOrders = isLoading || (limit < MAXIMUM_ORDERS_TO_FETCH && hasMore)

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
