import { useCallback, useMemo } from 'react'

import { useLocation, useNavigate } from 'react-router'

export function useQuery(): URLSearchParams {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
}

/**
 * Syntactic sugar to build search queries
 *
 * @param params object with key:value strings for the search query
 */
export function buildSearchQuery(params: { [key in string]: string }): URLSearchParams {
  return new URLSearchParams(params)
}

export function useUpdateQueryString(): (key: string, value: string) => void {
  const query = useQuery()
  const navigate = useNavigate()

  return useCallback(
    (key: string, value: string) => {
      query.set(key, value)

      navigate({ search: query.toString() })
    },
    [navigate, query],
  )
}
