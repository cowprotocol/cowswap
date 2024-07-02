import { useMemo } from 'react'

import { safeNamehash } from '@cowprotocol/common-utils'

import { useENSResolverMethod } from './useENSResolverMethod'

/**
 * Does a lookup for an ENS name to find its address.
 */
export function useENSAddress(ensName?: string | null): { loading: boolean; address: string | null } {
  const ensNodeArgument = useMemo(() => (ensName === null ? undefined : safeNamehash(ensName)), [ensName])

  const { data: addr, isLoading: addrLoading } = useENSResolverMethod('addr', ensNodeArgument)

  return useMemo(
    () => ({
      address: addr ?? null,
      loading: addrLoading,
    }),
    [addr, addrLoading]
  )
}
