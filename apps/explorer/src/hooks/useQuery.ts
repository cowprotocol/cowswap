import { useLocation } from 'react-router'
import { useCallback, useMemo } from 'react'
import { checkDateOrValidBatchTime, sanitizeInput } from 'utils'
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

export function useQueryTradeParams(): {
  sellAmount: string
  price: string
  validFrom: string | null
  validUntil: string | null
} {
  const query = useQuery()

  return {
    sellAmount: sanitizeInput(query.get('sell')),
    price: sanitizeInput(query.get('price')),
    validFrom: checkDateOrValidBatchTime(query.get('from')),
    validUntil: checkDateOrValidBatchTime(query.get('expires')),
  }
}

export function useUpdateQueryString(): (key: string, value: string) => void {
  const query = useQuery()
  const navigate = useNavigate()

  return useCallback(
    (key: string, value: string) => {
      query.set(key, value)
      // TODO: MGR
      navigate({ search: query.toString() }, { replace: true })
    },
    [navigate, query]
  )
}
