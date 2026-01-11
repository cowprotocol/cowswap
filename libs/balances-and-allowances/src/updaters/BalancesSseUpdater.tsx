import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import { useSseBalances } from '../hooks/useSseBalances'
import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'
import { useSetIsSseFailed } from '../state/isSseFailedAtom'

export interface BalancesSseUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
  tokensListsUrls: string[]
}

const ZERO = BigNumber.from(0)

function parseBalances(balances: Record<string, string>): BalancesState['values'] {
  return Object.entries(balances).reduce<BalancesState['values']>((acc, [address, balance]) => {
    if (balance) {
      try {
        acc[address.toLowerCase()] = BigNumber.from(balance)
      } catch {
        // Skip invalid balances
      }
    }
    return acc
  }, {})
}

/**
 * Initialize all token addresses with 0 balance
 * This is needed because SSE only returns non-zero balances
 */
function initializeZeroBalances(tokenAddresses: string[]): BalancesState['values'] {
  return tokenAddresses.reduce<BalancesState['values']>((acc, address) => {
    acc[address.toLowerCase()] = ZERO
    return acc
  }, {})
}

export function BalancesSseUpdater({
  account,
  chainId,
  tokenAddresses,
  tokensListsUrls,
}: BalancesSseUpdaterProps): null {
  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)
  const setIsSseFailed = useSetIsSseFailed()

  const onAllBalances = useCallback(
    (balances: Record<string, string>) => {
      if (!account) return

      // Initialize all known tokens with 0 balance first
      // SSE only returns non-zero balances, so tokens not in the response have 0 balance
      const zeroBalances = initializeZeroBalances(tokenAddresses)
      const parsed = parseBalances(balances)

      setBalances((state) => ({
        ...state,
        chainId,
        fromCache: false,
        // First apply zero balances, then overwrite with actual balances
        values: { ...state.values, ...zeroBalances, ...parsed },
        isLoading: false,
      }))

      setBalancesUpdate((state) => ({
        ...state,
        [chainId]: {
          ...state[chainId],
          [account.toLowerCase()]: Date.now(),
        },
      }))
    },
    [account, chainId, tokenAddresses, setBalances, setBalancesUpdate],
  )

  const onBalanceUpdate = useCallback(
    (address: string, balance: string) => {
      if (!balance) return

      try {
        setBalances((state) => ({
          ...state,
          values: {
            ...state.values,
            [address]: BigNumber.from(balance),
          },
        }))
      } catch {
        // Skip invalid balance
      }
    },
    [setBalances],
  )

  const onError = useCallback(() => {
    setIsSseFailed(true)
  }, [setIsSseFailed])

  const { isLoading, error } = useSseBalances({
    account,
    chainId,
    enabled: !!account,
    tokensListsUrls,
    customTokens: tokenAddresses,
    onAllBalances,
    onBalanceUpdate,
    onError,
  })

  // Only mark SSE as failed when there's an actual error, not on initial state
  useEffect(() => {
    if (error) {
      setIsSseFailed(true)
    }
  }, [error, setIsSseFailed])

  // Sync loading state
  useEffect(() => {
    setBalances((state) => ({ ...state, isLoading, chainId }))
  }, [isLoading, chainId, setBalances])

  return null
}
