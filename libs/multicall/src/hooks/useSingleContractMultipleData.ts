import { useMemo } from 'react'

import type { Multicall3 } from '@cowprotocol/abis'
import { Result } from '@ethersproject/abi'
import type { BaseContract } from '@ethersproject/contracts'
import type { Web3Provider } from '@ethersproject/providers'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useMultiCallRpcProvider } from './useMultiCallRpcProvider'

import { multiCall, MultiCallOptions } from '../multicall'

export function useSingleContractMultipleData<T = Result, P = unknown>(
  contract: BaseContract | undefined,
  methodName: string,
  params: P[] | undefined,
  options: MultiCallOptions = {},
  swrConfig?: SWRConfiguration,
): SWRResponse<(T | undefined)[] | null> {
  const provider = useMultiCallRpcProvider()

  const chainId = provider?.network?.chainId

  const calls = useMemo(() => {
    if (!contract || !params) return null

    return params.map((param) => {
      return {
        target: contract.address,
        callData: contract.interface.encodeFunctionData(methodName, param as unknown[]),
      }
    })
  }, [contract, methodName, params])

  return useSWR<(T | undefined)[] | null>(
    !contract || !calls || calls.length === 0 || !provider
      ? null
      : [provider, calls, options, methodName, contract, chainId, 'useSingleContractMultipleData'],
    async ([provider, calls, options, methodName, contract]: [
      Web3Provider,
      Multicall3.CallStruct[],
      MultiCallOptions,
      string,
      BaseContract,
    ]) => {
      return multiCall(provider, calls, options).then((results) => {
        return results.map((result) => {
          try {
            return contract.interface.decodeFunctionResult(methodName, result.returnData) as T
          } catch {
            return undefined
          }
        })
      })
    },
    swrConfig,
  )
}
