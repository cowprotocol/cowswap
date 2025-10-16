import { atom, useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useTokenContract } from 'common/hooks/useContract'

interface LastApproveParams {
  blockNumber: number
  tokenAddress: string
}

const lastApproveTxBlockNumberAtom = atom<Record<string, number>>({})

const LAST_APPROVE_TX_TIME_THRESHOLD = ms`1s`

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
  const [lastApproveTx, setLastApproveTx] = useAtom(lastApproveTxBlockNumberAtom)

  const targetOwner = owner ?? account
  const targetSpender = spender ?? tradeSpender
  const lastApproveBlockNumber = tokenAddress ? lastApproveTx[tokenAddress.toLowerCase()] : undefined

  // Reset lastApproveTxBlockNumberAtom on network changes
  useEffect(() => {
    setLastApproveTx({})
  }, [chainId, setLastApproveTx])

  // Important! Do not add erc20Contract to SWR deps, otherwise it will do unwanted node RPC calls!
  return useSWR(
    erc20Contract && targetOwner && targetSpender
      ? [targetOwner, targetSpender, chainId, lastApproveBlockNumber, tokenAddress, 'useTokenAllowance']
      : null,
    ([targetOwner, targetSpender]) => {
      if (!erc20Contract) return undefined

      return erc20Contract.allowance(targetOwner, targetSpender).then((result) => result.toBigInt())
    },
    SWR_OPTIONS,
  )
}

export function useUpdateLastApproveTxBlockNumber(): (params: LastApproveParams) => void {
  const setState = useSetAtom(lastApproveTxBlockNumberAtom)

  return useCallback(
    (params: LastApproveParams) => {
      // Wait 1 second before updating value to give some time to node to update the state
      setTimeout(() => {
        setState((state) => ({
          ...state,
          [params.tokenAddress.toLowerCase()]: params.blockNumber,
        }))
      }, LAST_APPROVE_TX_TIME_THRESHOLD)
    },
    [setState],
  )
}
