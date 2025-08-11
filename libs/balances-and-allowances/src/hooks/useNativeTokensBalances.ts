import { useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { getMulticallContract, useSingleContractMultipleData } from '@cowprotocol/multicall'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { getIsBlockNumberRelevant } from '../utils/getIsBlockNumberRelevant'

type NativeBalances = { [account: string]: BigNumber | undefined }

export function useNativeTokensBalances(accounts: string[] | undefined): NativeBalances | undefined {
  const provider = useWalletProvider()
  const contract = provider ? getMulticallContract(provider) : undefined
  const params = useMemo(() => accounts?.map((account) => [account]), [accounts])

  const { data } = useSingleContractMultipleData<[BigNumber]>(contract, 'getEthBalance', params)
  const results = data?.results
  const blockNumber = data?.blockNumber
  const prevBlockNumber = usePrevious(blockNumber)

  // Skip multicall results from outdated block if there is a result from newer one
  const isNewBlockNumber = getIsBlockNumberRelevant({ prevBlockNumber, blockNumber })

  return useMemo(() => {
    if (!results || !accounts || !isNewBlockNumber) return undefined

    return results.reduce<NativeBalances>((acc, result, index) => {
      acc[accounts[index]] = result?.[0]

      return acc
    }, {})
  }, [results, accounts, isNewBlockNumber])
}
