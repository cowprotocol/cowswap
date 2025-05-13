import { useCallback } from 'react'

import { useNavigate } from 'react-router'
import { usePathPrefix } from 'state/network'
import { isAnAddressAccount, isAnOrderId, isATxHash, isEns } from 'utils'

export function pathAccordingTo(query: string): string {
  let path = 'search'
  if (isAnAddressAccount(query)) {
    path = 'address'
  } else if (isAnOrderId(query)) {
    path = 'orders'
  } else if (isATxHash(query)) {
    path = 'tx'
  }

  return path
}

export function useSearchSubmit(): (query: string) => void {
  const navigate = useNavigate()
  const prefixNetwork = usePathPrefix()

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
