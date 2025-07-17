import { atom, useAtomValue, useSetAtom } from 'jotai'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useTokenContract } from 'common/hooks/useContract'

import { useTradeSpenderAddress } from './useTradeSpenderAddress'

const lastApproveTxBlockNumberAtom = atom(0)

const SWR_OPTIONS: SWRConfiguration = {
  ...SWR_NO_REFRESH_OPTIONS,
  revalidateIfStale: false,
  refreshInterval: ms`10s`,
}

export function useTokenAllowance(
  token: Token | undefined,
  owner?: string,
  spender?: string,
): SWRResponse<bigint | undefined> {
  const tokenAddress = token?.address

  const { chainId, account } = useWalletInfo()
  const { contract: erc20Contract } = useTokenContract(tokenAddress)
  const tradeSpender = useTradeSpenderAddress()
  const lastApproveTxBlockNumber = useAtomValue(lastApproveTxBlockNumberAtom)

  const targetOwner = owner ?? account
  const targetSpender = spender ?? tradeSpender

  return useSWR(
    erc20Contract && targetOwner && targetSpender
      ? [erc20Contract, targetOwner, targetSpender, chainId, lastApproveTxBlockNumber, 'useTokenAllowance']
      : null,
    ([erc20Contract, targetOwner, targetSpender]) => {
      return erc20Contract.allowance(targetOwner, targetSpender).then((result) => result.toBigInt())
    },
    SWR_OPTIONS,
  )
}

export function useUpdateLastApproveTxBlockNumber(): (value: number) => void {
  return useSetAtom(lastApproveTxBlockNumberAtom)
}
