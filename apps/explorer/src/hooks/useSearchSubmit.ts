import { useCallback } from 'react'

import { useNavigate } from 'react-router'
import { useNavigationPathPrefix, useNetworkId } from 'state/network'
import { Network } from 'types'
import { isAnAddressAccount, isAnOrderId, isATxHash, isEns } from 'utils'

export function pathAccordingTo(query: string, networkId?: Network | null): string {
  if (isAnAddressAccount(query)) {
    return 'address'
  }
  // Before the tx-hash check on purpose: a Solana order uid and an EVM transaction hash are the
  // same length, so on Solana the order has to win or every uid routes to the transaction page.
  if (isAnOrderId(query, networkId)) {
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
  const networkId = useNetworkId()

  return useCallback(
    (query: string) => {
      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      const path = pathAccordingTo(query, networkId)
      const pathPrefix = prefixNetwork ? `${prefixNetwork}/${path}` : `${path}`

      if (path === 'address' && isEns(query)) {
        navigate(`/${path}/${query}`)
      } else {
        query && query.length > 0 && navigate(`/${pathPrefix}/${query}`)
      }
    },
    [navigate, prefixNetwork, networkId],
  )
}
