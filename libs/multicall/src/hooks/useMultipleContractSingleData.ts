import { useMemo } from 'react'

import type { Multicall3 } from '@cowprotocol/abis'
import { Interface, Result } from '@ethersproject/abi'
import type { Web3Provider } from '@ethersproject/providers'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useMultiCallRpcProvider } from './useMultiCallRpcProvider'

import { multiCall, MultiCallOptions } from '../multicall'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useMultipleContractSingleData<T = Result>(
  addresses: string[],
  contractInterface: Interface,
  methodName: string,
  params: unknown[] | undefined,
  multicallOptions: MultiCallOptions = {},
  swrConfig?: SWRConfiguration,
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
      : [
          provider,
          calls,
          multicallOptions,
          methodName,
          contractInterface,
          chainId,
          calls.length,
          'useMultipleContractSingleData',
        ],
    async ([provider, calls, multicallOptions, methodName, contractInterface]: [
      Web3Provider,
      Multicall3.CallStruct[],
      MultiCallOptions,
      string,
      Interface,
    ]) => {
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
