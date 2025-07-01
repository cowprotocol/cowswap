import { useCallback } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { useGetBuildOrdersTableUrl } from './useGetBuildOrdersTableUrl'

import { OrderTabId } from '../const/tabs'

export function useNavigateToOpenOrdersTable(): () => void {
  const navigate = useNavigate()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  return useCallback(() => {
    navigate(buildOrdersTableUrl({ tabId: OrderTabId.open, pageNumber: 1 }))
  }, [buildOrdersTableUrl, navigate])
}
