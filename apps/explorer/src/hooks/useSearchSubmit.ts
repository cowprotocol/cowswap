import { useCallback } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useNavigate } from 'react-router'
import { useNavigationPathPrefix, useNetworkId } from 'state/network'
import { isAnAddressAccount, isAnOrderId, isATxHash, isEns, isTwapEventId, isTwapSupportedChain } from 'utils'

export function pathAccordingTo(query: string, isTwapEnabled = false): string {
  if (isAnAddressAccount(query)) {
    return 'address'
  }
  if (isAnOrderId(query)) {
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
  const isTwapEnabled = isTwapEoaEnabled === true && isTwapSupportedChain(networkId)

  return useCallback(
    (query: string) => {
      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      const path = pathAccordingTo(query, isTwapEnabled)
      const pathPrefix = prefixNetwork ? `${prefixNetwork}/${path}` : `${path}`

      if (path === 'address' && isEns(query)) {
        navigate(`/${path}/${query}`)
      } else if (path === 'twap') {
        navigate(`/${pathPrefix}/${query}`, { state: { twapGlobalSearch: true } })
      } else {
        query && query.length > 0 && navigate(`/${pathPrefix}/${query}`)
      }
    },
    [isTwapEnabled, navigate, prefixNetwork],
  )
}
