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

function parseBalances(balances: Record<string, string>): BalancesState['values'] {
  return Object.entries(balances).reduce<BalancesState['values']>((acc, [address, balance]) => {
    if (balance && balance !== '0') {
      try {
        acc[address.toLowerCase()] = BigNumber.from(balance)
      } catch {
        // Skip invalid balances
      }
    }
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

      const parsed = parseBalances(balances)
      if (Object.keys(parsed).length === 0) return

      setBalances((state) => ({
        ...state,
        chainId,
        fromCache: false,
        values: { ...state.values, ...parsed },
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
    [account, chainId, setBalances, setBalancesUpdate],
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

  const { isConnected, isLoading } = useSseBalances({
    account,
    chainId,
    enabled: !!account,
    tokensListsUrls,
    customTokens: tokenAddresses,
    onAllBalances,
    onBalanceUpdate,
    onError,
  })

  // Sync connection state
  useEffect(() => {
    setIsSseFailed(!isConnected && !isLoading)
  }, [isConnected, isLoading, setIsSseFailed])

  // Sync loading state
  useEffect(() => {
    setBalances((state) => ({ ...state, isLoading, chainId }))
  }, [isLoading, chainId, setBalances])

  return null
}
