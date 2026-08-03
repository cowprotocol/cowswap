import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import { allowancesAtom, useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

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
  const solanaAllowance = useSolanaDelegationAllowance(tokenAddress)

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

      return erc20Contract.allowance(targetOwner, targetSpender)
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
      data: solanaAllowance ?? optimisticAllowance?.amount ?? swrResponse.data,
    }),
    [solanaAllowance, optimisticAllowance?.amount, swrResponse],
  )
}

/**
 * Solana has no ERC-20 `allowance` call; the SPL delegation persisted into `allowancesAtom` is the
 * equivalent. Reading it here lets the approve gating (`useApproveState`, `useNeedsApproval`) work on
 * Solana. Returns `undefined` on non-Solana chains so the EVM allowance path is used unchanged.
 *
 * A token that isn't delegated to the settlement authority is stored as `undefined` (the display's
 * "not delegated" marker). For the approve gating that means "no allowance", so it is coalesced to `0`
 * here — otherwise `getApprovalState` would read it as `UNKNOWN` and hide the Approve button.
 */
function useSolanaDelegationAllowance(tokenAddress: string | undefined): bigint | undefined {
  const { chainId } = useWalletInfo()
  const persistedAllowancesByChain = useAtomValue(allowancesAtom)

  return useMemo(() => {
    if (!isSolanaChain(chainId) || !tokenAddress) return undefined

    return persistedAllowancesByChain[chainId]?.[getAddressKey(tokenAddress)] ?? 0n
  }, [persistedAllowancesByChain, chainId, tokenAddress])
}
