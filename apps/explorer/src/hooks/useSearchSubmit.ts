import { useCallback } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isTwapEventId } from '@cowprotocol/common-utils'

import { useNavigate } from 'react-router'
import { useNavigationPathPrefix, useNetworkId } from 'state/network'
import { Network } from 'types'
import { isAnAddressAccount, isAnOrderId, isATxHash, isEns } from 'utils'

export function pathAccordingTo(query: string, networkId?: Network | null, isTwapEnabled = false): string {
  if (isAnAddressAccount(query)) {
    return 'address'
  }
  // Before the tx-hash check on purpose: a Solana uid is the same length as an EVM tx hash.
  if (isAnOrderId(query, networkId)) {
    return 'orders'
  }
  if (isATxHash(query)) {
    return 'tx'
  }
  if (isTwapEnabled && isTwapEventId(query)) {
    return 'twap'
  }

  return 'search'
}

export function useSearchSubmit(): (query: string) => void {
  const navigate = useNavigate()
  const prefixNetwork = useNavigationPathPrefix()
  const networkId = useNetworkId()
  const { isTwapEoaEnabled } = useFeatureFlags()

  return useCallback(
    (query: string) => {
      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      const path = pathAccordingTo(query, networkId, isTwapEoaEnabled)
      const pathPrefix = prefixNetwork ? `${prefixNetwork}/${path}` : `${path}`

      if (path === 'address' && isEns(query)) {
        navigate(`/${path}/${query}`)
      } else if (path === 'twap') {
        navigate(`/${pathPrefix}/${query}`, { state: { twapGlobalSearch: true } })
      } else {
        query && query.length > 0 && navigate(`/${pathPrefix}/${query}`)
      }
    },
    [isTwapEoaEnabled, navigate, prefixNetwork, networkId],
  )
}
