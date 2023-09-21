import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { namehash } from '@ethersproject/hash'

import { useENSAddress } from './useENSAddress'
import { useENSResolverMethod } from './useENSResolverMethod'

/**
 * Does a reverse lookup for an address to find its ENS name.
 * Note this is not the same as looking up an ENS name to find an address.
 */
export function useENSName(address?: string): { ENSName: string | null; loading: boolean } {
  const ensNodeArgument = useMemo(() => {
    if (!address || !isAddress(address)) return undefined

    return namehash(`${address.toLowerCase().substr(2)}.addr.reverse`)
  }, [address])

  const { data: name, isLoading: nameLoading } = useENSResolverMethod('name', ensNodeArgument)

  /* ENS does not enforce that an address owns a .eth domain before setting it as a reverse proxy
     and recommends that you perform a match on the forward resolution
     see: https://docs.ens.domains/dapp-developer-guide/resolving-names#reverse-resolution
  */
  const fwdAddr = useENSAddress(name)
  const checkedName = address === fwdAddr?.address ? name : null

  return useMemo(
    () => ({
      ENSName: checkedName ?? null,
      loading: nameLoading,
    }),
    [checkedName, nameLoading]
  )
}
