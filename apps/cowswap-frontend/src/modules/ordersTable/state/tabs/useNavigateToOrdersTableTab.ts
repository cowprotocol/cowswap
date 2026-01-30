import { useCallback } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { OrderTabId } from './ordersTableTabs.constants'

import { useGetBuildOrdersTableUrl } from '../url/useGetBuildOrdersTableUrl'

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
