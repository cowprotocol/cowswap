import { useCallback } from 'react'

import { useLocation } from 'react-router'

import { buildOrdersTableUrl } from '../utils/buildOrdersTableUrl'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGetBuildOrdersTableUrl() {
  const location = useLocation()

  return useCallback(
    (pageInfo: Parameters<typeof buildOrdersTableUrl>[1]) => buildOrdersTableUrl(location, pageInfo),
    [location],
  )
}
