import { useCallback } from 'react'

import { useNavigate } from 'react-router-dom'

import { useGetBuildOrdersTableUrl } from './useGetBuildOrdersTableUrl'

import { OPEN_TAB } from '../const/tabs'

export function useNavigateToOpenOrdersTable() {
  const navigate = useNavigate()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  return useCallback(() => {
    navigate(buildOrdersTableUrl({ tabId: OPEN_TAB.id, pageNumber: 1 }))
  }, [buildOrdersTableUrl, navigate])
}
