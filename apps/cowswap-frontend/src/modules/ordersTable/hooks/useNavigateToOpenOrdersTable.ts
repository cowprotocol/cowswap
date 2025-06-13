import { useCallback } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { useGetBuildOrdersTableUrl } from './useGetBuildOrdersTableUrl'

import { OPEN_TAB } from '../const/tabs'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useNavigateToOpenOrdersTable() {
  const navigate = useNavigate()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  return useCallback(() => {
    navigate(buildOrdersTableUrl({ tabId: OPEN_TAB.id, pageNumber: 1 }))
  }, [buildOrdersTableUrl, navigate])
}
