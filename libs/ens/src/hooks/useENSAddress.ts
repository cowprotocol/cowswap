import { useMemo } from 'react'

import { useEnsAddress } from 'wagmi'

import { normalize } from '../utils/normalize'

/**
 * Does a lookup for an ENS name to find its address.
 */
export function useENSAddress(ensName?: string | null): { loading: boolean; address: string | null } {
  const request = useEnsAddress({ name: normalize(ensName || undefined) })

  return useMemo(
    () => ({ loading: request.isLoading, address: request.data || null }),
    [request.isLoading, request.data],
  )
}
