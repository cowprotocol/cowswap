import { useMemo } from 'react'

import { Interface, Result } from '@ethersproject/abi'
import { useWeb3React } from '@web3-react/core'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { multiCall, MultiCallOptions } from '../multiCall'

export function useMultipleContractSingleData<T = Result>(
  addresses: string[],
  contractInterface: Interface,
  methodName: string,
  params: unknown[] | undefined,
  multicallOptions: MultiCallOptions = {},
  swrConfig?: SWRConfiguration
): SWRResponse<(T | undefined)[] | null> {
  const { provider } = useWeb3React()

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
    ['useMultipleContractSingleData', provider, calls, multicallOptions],
    () => {
      if (!calls || calls.length === 0 || !provider) return null

      return multiCall(provider, calls, multicallOptions).then((results) => {
        return results.map((result) => {
          try {
            return contractInterface.decodeFunctionResult(methodName, result.returnData) as T
          } catch (error) {
            return undefined
          }
        })
      })
    },
    swrConfig
  )
}
