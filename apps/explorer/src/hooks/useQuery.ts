import { useCallback, useMemo } from 'react'

import { useLocation } from 'react-router'
import { useNavigate } from 'react-router-dom'

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

      navigate({ search: query.toString() }, { replace: true })
    },
    [navigate, query]
  )
}
