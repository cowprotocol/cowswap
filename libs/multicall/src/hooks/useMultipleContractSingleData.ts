import { useMemo } from 'react'

import type { Multicall3 } from '@cowprotocol/abis'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Interface, Result } from '@ethersproject/abi'
import type { Web3Provider } from '@ethersproject/providers'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { multiCall, MultiCallOptions } from '../multicall'

export function useMultipleContractSingleData<T = Result>(
  addresses: string[],
  contractInterface: Interface,
  methodName: string,
  params: unknown[] | undefined,
  multicallOptions: MultiCallOptions = {},
  swrConfig?: SWRConfiguration,
): SWRResponse<(T | undefined)[] | null> {
  const provider = useWalletProvider()

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
    !calls?.length || !provider ? null : [provider, calls, multicallOptions, 'useMultipleContractSingleData'],
    async ([provider, calls, multicallOptions]: [Web3Provider, Multicall3.CallStruct[], MultiCallOptions]) => {
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
