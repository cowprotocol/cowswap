import { useMemo } from 'react'

import { Interface, Result } from '@ethersproject/abi'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useMultiCallRpcProvider } from './useMultiCallRpcProvider'

import { multiCall, MultiCallOptions } from '../multicall'

export function useMultipleContractSingleData<T = Result>(
  addresses: string[],
  contractInterface: Interface,
  methodName: string,
  params: unknown[] | undefined,
  multicallOptions: MultiCallOptions = {},
  swrConfig?: SWRConfiguration,
  cacheKey?: string,
): SWRResponse<(T | undefined)[] | null> {
  const provider = useMultiCallRpcProvider()

  const callData = useMemo(() => {
    if (!params) return null

    return contractInterface.encodeFunctionData(methodName, params)
  }, [contractInterface, methodName, params])

  const calls = useMemo(() => {
    if (!callData) return null

    return addresses.map((address) => {
      return {
        target: address,
        callData,
      }
    })
  }, [addresses, callData])

  const chainId = provider?.network?.chainId

  return useSWR<(T | undefined)[] | null>(
    !calls?.length || !provider
      ? null
      : [multicallOptions, methodName, chainId, calls.length, cacheKey, 'useMultipleContractSingleData'],
    async ([multicallOptions, methodName]: [MultiCallOptions, string]) => {
      if (!provider || !calls?.length) return null

      return multiCall(provider, calls, multicallOptions).then((results) => {
        return results.map((result) => {
          try {
            return contractInterface.decodeFunctionResult(methodName, result.returnData) as T
          } catch {
            return undefined
          }
        })
      })
    },
    swrConfig,
  )
}
