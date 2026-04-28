import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'

import { useENSAddress } from './useENSAddress'
import { useENSName } from './useENSName'

import type { Address } from 'viem'

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
export function useENS(nameOrAddress?: string | null): {
  loading: boolean
  address: string | null
  name: string | null
} {
  const validatedAddress = isAddress(nameOrAddress)
  const address = validatedAddress ? (validatedAddress as Address) : undefined
  const reverseLookup = useENSName(address)
  const lookup = useENSAddress(nameOrAddress)

  return useMemo(
    () => ({
      loading: reverseLookup.loading || lookup.loading,
      address: address || lookup.address,
      name: reverseLookup.ENSName ? reverseLookup.ENSName : !address && lookup.address ? nameOrAddress || null : null,
    }),
    [address, lookup.address, lookup.loading, nameOrAddress, reverseLookup.ENSName, reverseLookup.loading],
  )
}
