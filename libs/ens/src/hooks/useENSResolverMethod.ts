import { useMemo } from 'react'

import { isZero } from '@cowprotocol/common-utils'

import useSWR from 'swr'

import { useENSResolver } from './useENSResolver'
import { useENSResolverContract } from './useENSResolverContract'

export function useENSResolverMethod(
  method: 'addr' | 'name' | 'contenthash',
  ensNodeArgument: string | undefined
): { data: string | undefined; isLoading: boolean } {
  const { data: resolverAddress, isLoading: resolverAddressLoading } = useENSResolver(ensNodeArgument)

  const resolverContract = useENSResolverContract(
    resolverAddress && !isZero(resolverAddress) ? resolverAddress : undefined
  )

  const { data, isLoading } = useSWR(['useENSResolverMethod' + method, resolverContract, ensNodeArgument], async () => {
    if (!resolverContract || !ensNodeArgument) return undefined

    return resolverContract.callStatic[method](ensNodeArgument)
  })

  return useMemo(() => {
    return {
      data,
      isLoading: resolverAddressLoading || isLoading,
    }
  }, [data, resolverAddressLoading, isLoading])
}
