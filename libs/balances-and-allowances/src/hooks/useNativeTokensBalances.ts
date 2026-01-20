import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getMulticallContract, useSingleContractMultipleData } from '@cowprotocol/multicall'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { useIsBlockNumberRelevant } from './useIsBlockNumberRelevant'

type NativeBalances = { [account: string]: BigNumber | undefined }

export function useNativeTokensBalances(
  chainId: SupportedChainId,
  accounts: string[] | undefined,
): NativeBalances | undefined {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const contract = provider ? getMulticallContract(provider) : undefined
  const params = useMemo(() => accounts?.map((account) => [account]), [accounts])

  const { data } = useSingleContractMultipleData<[BigNumber]>(contract, 'getEthBalance', params)
  const results = data?.results
  const blockNumber = data?.blockNumber

  // Skip multicall results from outdated block if there is a result from newer one
  const isNewBlockNumber = useIsBlockNumberRelevant(chainId, blockNumber)

  return useMemo(() => {
    if (!results || !accounts || !isNewBlockNumber) return undefined

    return results.reduce<NativeBalances>((acc, result, index) => {
      acc[accounts[index]] = result?.[0]

      return acc
    }, {})
  }, [results, accounts, isNewBlockNumber])
}
