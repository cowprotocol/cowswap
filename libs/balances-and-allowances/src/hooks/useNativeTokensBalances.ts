import { Multicall3 } from '@cowprotocol/abis'
import { getMulticallContract, multicall } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'

import useSWR, { SWRResponse } from 'swr'

type NativeBalances = { [account: string]: BigNumber | undefined }

export function useNativeTokensBalances(accounts: string[] | undefined): SWRResponse<NativeBalances | undefined> {
  const { provider } = useWeb3React()

  return useSWR<NativeBalances | undefined>(['useNativeTokensBalances', accounts], async () => {
    if (!provider || !accounts) return undefined

    const contract = getMulticallContract(provider)

    const calls: Multicall3.CallStruct[] = accounts.map((account) => {
      return {
        target: contract.address,
        callData: contract.interface.encodeFunctionData('getEthBalance', [account]),
      }
    })

    return multicall(provider, calls).then((results) => {
      return results.reduce<NativeBalances>((acc, result, index) => {
        const account = accounts[index]

        acc[account] = contract.interface.decodeFunctionResult('getEthBalance', result.returnData)[0] as BigNumber

        return acc
      }, {})
    })
  })
}
