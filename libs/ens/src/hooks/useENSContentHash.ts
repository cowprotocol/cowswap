import { useMemo } from 'react'

import { safeNamehash } from '@cowprotocol/common-utils'

import { useENSResolverMethod } from './useENSResolverMethod'

/**
 * Does a lookup for an ENS name to find its contenthash.
 */
export function useENSContentHash(ensName?: string | null): { loading: boolean; contenthash: string | null } {
  const ensNodeArgument = useMemo(() => (ensName === null ? undefined : safeNamehash(ensName)), [ensName])

  const { data: contenthash, isLoading: hashLoading } = useENSResolverMethod('contenthash', ensNodeArgument)

  return useMemo(
    () => ({
      contenthash: contenthash ?? null,
      loading: hashLoading,
    }),
    [hashLoading, contenthash]
  )
}
