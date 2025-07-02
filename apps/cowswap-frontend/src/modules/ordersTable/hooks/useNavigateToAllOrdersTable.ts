import { useCallback } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { useGetBuildOrdersTableUrl } from './useGetBuildOrdersTableUrl'

import { OrderTabId } from '../const/tabs'

/**
 * Hook to navigate to the ALL ORDERS tab in the orders table
 * Used by both limit orders and TWAP orders after placement
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useNavigateToAllOrdersTable() {
  const navigate = useNavigate()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  return useCallback(() => {
    navigate(buildOrdersTableUrl({ tabId: OrderTabId.all, pageNumber: 1 }))
  }, [buildOrdersTableUrl, navigate])
}
