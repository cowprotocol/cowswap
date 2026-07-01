import { useCallback } from 'react'

import { OrderTabId } from 'entities/routes/routes.atom'

import { useNavigate } from 'common/hooks/useNavigate'

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
