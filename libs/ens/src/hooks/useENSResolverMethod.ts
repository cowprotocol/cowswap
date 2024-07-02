import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
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

  const { data, isLoading } = useSWR(
    resolverContract && ensNodeArgument ? ['useENSResolverMethod', method, resolverContract, ensNodeArgument] : null,
    async ([, _method, contract, arg]) => contract.callStatic[_method](arg),
    SWR_NO_REFRESH_OPTIONS
  )

  return useMemo(() => {
    return {
      data,
      isLoading: resolverAddressLoading || isLoading,
    }
  }, [data, resolverAddressLoading, isLoading])
}
