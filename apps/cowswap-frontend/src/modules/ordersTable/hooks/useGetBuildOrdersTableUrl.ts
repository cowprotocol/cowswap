import { useCallback } from 'react'

import { useLocation } from 'react-router-dom'

import { buildOrdersTableUrl } from '../utils/buildOrdersTableUrl'

export function useGetBuildOrdersTableUrl() {
  const location = useLocation()

  return useCallback(
    (pageInfo: Parameters<typeof buildOrdersTableUrl>[1]) => buildOrdersTableUrl(location, pageInfo),
    [location]
  )
}
