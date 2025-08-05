import { useMemo } from 'react'

import type { Multicall3 } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Interface, Result } from '@ethersproject/abi'
import type { Web3Provider } from '@ethersproject/providers'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useMultiCallRpcProvider } from './useMultiCallRpcProvider'

import { multiCall, MultiCallOptions } from '../multicall'

export function useMultipleContractSingleData<T = Result>(
  chainId: SupportedChainId,
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

  return useSWR<(T | undefined)[] | null>(
    !calls?.length || !provider
      ? null
      : [
          chainId,
          provider,
          calls,
          multicallOptions,
          methodName,
          contractInterface,
          calls.length,
          cacheKey,
          'useMultipleContractSingleData',
        ],
    async ([chainId, provider, calls, multicallOptions, methodName, contractInterface, callsCount, cacheKey]: [
      SupportedChainId,
      Web3Provider,
      Multicall3.CallStruct[],
      MultiCallOptions,
      string,
      Interface,
      number,
      string,
    ]) => {
      const providerChainId = (await provider.getNetwork()).chainId

      if (providerChainId !== chainId) return null

      console.debug('[Multicall] MultipleContractSingleData', {
        chainId,
        cacheKey,
        methodName,
        callsCount,
        provider,
      })

      return multiCall(provider, calls, multicallOptions)
        .then((results) => {
          return results.map((result) => {
            try {
              return contractInterface.decodeFunctionResult(methodName, result.returnData) as T
            } catch {
              return undefined
            }
          })
        })
        .catch((error) => {
          console.error('Could not make a multicall (SingleData)', error)
          return Promise.reject(error)
        })
    },
    swrConfig,
  )
}
