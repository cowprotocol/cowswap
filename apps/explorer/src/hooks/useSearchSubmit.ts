import { useCallback } from 'react'

import { useNavigate } from 'react-router'
import { useNavigationPathPrefix } from 'state/network'
import { isAnAddressAccount, isAnOrderId, isATxHash, isEns } from 'utils'

export function pathAccordingTo(query: string): string {
  if (isAnAddressAccount(query)) {
    return 'address'
  }
  if (isAnOrderId(query)) {
    return 'orders'
  }
  if (isATxHash(query)) {
    return 'tx'
  }

  return 'search'
}

export function useSearchSubmit(): (query: string) => void {
  const navigate = useNavigate()
  const prefixNetwork = useNavigationPathPrefix()

  return useCallback(
    (query: string) => {
      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      const path = pathAccordingTo(query)
      const pathPrefix = prefixNetwork ? `${prefixNetwork}/${path}` : `${path}`

      if (path === 'address' && isEns(query)) {
        navigate(`/${path}/${query}`)
      } else {
        query && query.length > 0 && navigate(`/${pathPrefix}/${query}`)
      }
    },
    [navigate, prefixNetwork],
  )
}
