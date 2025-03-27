import { useMemo } from 'react'

import { getMulticallContract, useSingleContractMultipleData } from '@cowprotocol/multicall'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { BigNumber } from '@ethersproject/bignumber'

type NativeBalances = { [account: string]: BigNumber | undefined }

export function useNativeTokensBalances(accounts: string[] | undefined): NativeBalances | undefined {
  const { chainId } = useWalletInfo()
  const provider = useWalletProvider()
  const contract = provider ? getMulticallContract(provider) : undefined
  const params = useMemo(() => accounts?.map((account) => [account]), [accounts])

  const { data: results } = useSingleContractMultipleData<[BigNumber]>(chainId, contract, 'getEthBalance', params)

  return useMemo(() => {
    if (!results || !accounts) return undefined

    return results.reduce<NativeBalances>((acc, result, index) => {
      acc[accounts[index]] = result?.[0]

      return acc
    }, {})
  }, [results, accounts])
}
