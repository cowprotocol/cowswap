import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'

import { optimisticAllowancesAtom } from 'entities/optimisticAllowance/optimisticAllowancesAtom'
import ms from 'ms.macro'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useTokenContract } from 'common/hooks/useContract'

import { getOptimisticAllowanceKey } from '../../entities/optimisticAllowance/getOptimisticAllowanceKey'

const OPTIMISTIC_ALLOWANCE_TTL = ms`30s`

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
  const [optimisticAllowances, setOptimisticAllowances] = useAtom(optimisticAllowancesAtom)

  const targetOwner = owner ?? account
  const targetSpender = spender ?? tradeSpender

  const optimisticAllowanceKey = useMemo(() => {
    if (!tokenAddress || !targetOwner || !targetSpender) return null
    return getOptimisticAllowanceKey({ chainId, tokenAddress, owner: targetOwner, spender: targetSpender })
  }, [chainId, tokenAddress, targetOwner, targetSpender])

  const optimisticAllowance = optimisticAllowanceKey ? optimisticAllowances[optimisticAllowanceKey] : undefined

  // Important! Do not add erc20Contract to SWR deps, otherwise it will do unwanted node RPC calls!
  const swrResponse = useSWR(
    erc20Contract && targetOwner && targetSpender
      ? [targetOwner, targetSpender, chainId, tokenAddress, 'useTokenAllowance']
      : null,
    ([targetOwner, targetSpender]) => {
      if (!erc20Contract) return undefined

      return erc20Contract.allowance(targetOwner, targetSpender).then((result) => result.toBigInt())
    },
    SWR_OPTIONS,
  )

  // Reset state on network changes
  useEffect(() => {
    setOptimisticAllowances({})
  }, [chainId, setOptimisticAllowances])

  // Clean up expired optimistic allowances
  useEffect(() => {
    const now = Date.now()
    const expiredKeys = Object.keys(optimisticAllowances).filter(
      (key) => now - optimisticAllowances[key].timestamp > OPTIMISTIC_ALLOWANCE_TTL,
    )

    if (expiredKeys.length > 0) {
      setOptimisticAllowances((state) => {
        const newState = { ...state }
        expiredKeys.forEach((key) => delete newState[key])
        return newState
      })
    }
  }, [optimisticAllowances, setOptimisticAllowances, swrResponse.data])

  return useMemo(
    () => ({
      ...swrResponse,
      data: optimisticAllowance?.amount ?? swrResponse.data,
    }),
    [optimisticAllowance?.amount, swrResponse],
  )
}
