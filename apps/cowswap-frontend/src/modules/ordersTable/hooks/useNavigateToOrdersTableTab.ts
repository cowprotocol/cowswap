import { useCallback } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { useGetBuildOrdersTableUrl } from './useGetBuildOrdersTableUrl'

import { OrderTabId } from '../const/tabs'

export function useNavigateToOrdersTableTab(): (tabId: OrderTabId) => void {
  const navigate = useNavigate()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  return useCallback(
    (tabId: OrderTabId) => {
      navigate(buildOrdersTableUrl({ tabId, pageNumber: 1 }))
    },
    [buildOrdersTableUrl, navigate],
  )
}
