import { useMemo } from 'react'

import { useDebounce } from '@cowswap/common-hooks'
import { safeNamehash, isZero } from '@cowswap/common-utils'
import { useENSResolverMethod } from './useENSResolverMethod'

/**
 * Does a lookup for an ENS name to find its address.
 */
export function useENSAddress(ensName?: string | null): { loading: boolean; address: string | null } {
  const debouncedName = useDebounce(ensName, 200)
  const ensNodeArgument = useMemo(
    () => (debouncedName === null ? undefined : safeNamehash(debouncedName)),
    [debouncedName]
  )

  const { data: addr, isLoading: addrLoading } = useENSResolverMethod('addr', ensNodeArgument)

  const changed = debouncedName !== ensName

  return useMemo(
    () => ({
      address: changed ? null : addr ?? null,
      loading: changed || addrLoading,
    }),
    [addr, changed, addrLoading]
  )
}
