import { useCallback } from 'react'

import { Erc20Abi } from '@cowprotocol/abis'
import type { HookDappContext } from '@cowprotocol/hook-dapp-lib'

import { BigNumber } from 'ethers'
import useSWR from 'swr'
import { Abi, Address, PublicClient, zeroAddress } from 'viem'

export const useReadTokenContract = ({
  tokenAddress,
  context,
  publicClient,
}: {
  tokenAddress: Address | undefined
  context: HookDappContext
  publicClient: PublicClient | undefined
}) => {
  const tokenAddressLowerCase = tokenAddress?.toLowerCase()

  const _readTokenContract = useCallback(
    async (address: Address) => {
      if (!publicClient || !context?.account) return
      return readTokenContract(address, publicClient, context?.account as Address, context?.balancesDiff)
    },
    [publicClient, context?.account, context?.balancesDiff],
  )

  const {
    data: tokenData,
    isLoading: isLoadingToken,
    error: errorToken,
  } = useSWR(tokenAddressLowerCase, _readTokenContract, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  })

  const tokenSymbol = tokenData?.symbol?.result ? String(tokenData.symbol.result) : ''
  const tokenDecimals = Number(tokenData?.decimals?.result)
  const userBalance = tokenData?.balance?.result

  return {
    tokenSymbol,
    tokenDecimals,
    userBalance,
    isLoadingToken,
    errorToken,
  }
}

export const readTokenContract = async (
  address: Address,
  publicClient: PublicClient,
  account: Address,
  balancesDiff?: HookDappContext['balancesDiff'],
) => {
  const tokenAddressLowerCase = address.toLowerCase() as Address
  const tokenBalanceDiff = balancesDiff?.account?.[tokenAddressLowerCase] || '0'

  const tokenContract = {
    address: tokenAddressLowerCase,
    abi: Erc20Abi as Abi,
  }

  const tokenResults =
    publicClient &&
    (await publicClient.multicall({
      contracts: [
        {
          ...tokenContract,
          functionName: 'symbol',
        },
        {
          ...tokenContract,
          functionName: 'decimals',
        },
        {
          ...tokenContract,
          functionName: 'balanceOf',
          args: [account ?? zeroAddress],
        },
      ],
    }))

  for (const result of tokenResults ?? []) {
    // Unexpected errors with token
    if (result.status === 'failure') throw new Error('Unexpected error')
  }

  if (!account) {
    return {
      symbol: tokenResults?.[0],
      decimals: tokenResults?.[1],
      balance: undefined,
    }
  }
  const contractBalance = tokenResults?.[2]?.result

  const balanceWithContextDiff = BigNumber.from(contractBalance)
    .add(BigNumber.from(tokenBalanceDiff ?? 0))
    .toBigInt()

  const balanceResultWithContextDiff = {
    ...tokenResults?.[2],
    result: balanceWithContextDiff,
  }

  return {
    symbol: tokenResults?.[0],
    decimals: tokenResults?.[1],
    balance: balanceResultWithContextDiff,
  }
}
