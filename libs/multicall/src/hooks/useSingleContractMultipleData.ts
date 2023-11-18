import { useMemo } from 'react'

import type { Result } from '@ethersproject/abi'
import type { BaseContract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { multicall, MulticallOptions } from '../multicall'

export function useSingleContractMultipleData<T = Result>(
  contract: BaseContract | undefined,
  methodName: string,
  params: unknown[][] | undefined,
  options: MulticallOptions = {},
  swrConfig?: SWRConfiguration
): SWRResponse<(T | undefined)[] | null> {
  const { provider } = useWeb3React()

  const calls = useMemo(() => {
    if (!contract || !params) return null

    return params.map((param) => {
      return {
        target: contract.address,
        callData: contract.interface.encodeFunctionData(methodName, param),
      }
    })
  }, [contract, methodName, params])

  return useSWR<(T | undefined)[] | null>(
    ['useSingleContractMultipleData', provider, calls, options],
    async () => {
      if (!contract || !calls || calls.length === 0 || !provider) return null

      return multicall(provider, calls, options).then((results) => {
        return results.map((result) => {
          try {
            return contract.interface.decodeFunctionResult(methodName, result.returnData) as T
          } catch (error) {
            return undefined
          }
        })
      })
    },
    swrConfig
  )
}
