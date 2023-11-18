import { useMemo } from 'react'

import { getMulticallContract, useSingleContractMultipleData } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'

type NativeBalances = { [account: string]: BigNumber | undefined }

export function useNativeTokensBalances(accounts: string[] | undefined): NativeBalances | undefined {
  const { provider } = useWeb3React()
  const contract = provider ? getMulticallContract(provider) : undefined
  const params = useMemo(() => accounts?.map((account) => [account]), [accounts])

  const { data: results } = useSingleContractMultipleData<[BigNumber]>(contract, 'getEthBalance', params)

  return useMemo(() => {
    if (!results || !accounts) return undefined

    return results.reduce<NativeBalances>((acc, result, index) => {
      acc[accounts[index]] = result?.[0]

      return acc
    }, {})
  }, [results, accounts])
}
