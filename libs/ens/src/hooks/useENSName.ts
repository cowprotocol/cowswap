import { useMemo } from 'react'

import { useEnsName } from 'wagmi'

import type { Address } from 'viem'

/**
 * Does a reverse lookup for an address to find its ENS name.
 * Note this is not the same as looking up an ENS name to find an address.
 */
export function useENSName(address?: Address): { ENSName: string | null; loading: boolean } {
  const request = useEnsName({ address })

  return useMemo(
    () => ({ ENSName: request.data || null, loading: request.isLoading }),
    [request.data, request.isLoading],
  )
}
