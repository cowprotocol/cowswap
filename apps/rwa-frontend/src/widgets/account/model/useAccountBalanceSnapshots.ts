'use client'

import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { queryClientAtom } from 'jotai-tanstack-query'

import { getBalancesQueryKey, chainsBalancesQueryAtomFamily } from './balanceSnapshotAtoms'

import { type ChainBalancesSnapshot, combineChainBalances } from '../lib/chainBalances'
import { getSupportedChainIds } from '../lib/tradeLeg'

import type { RwaTokenSummary } from '@/entities/asset'

export interface AccountBalanceSnapshots<T extends RwaTokenSummary = RwaTokenSummary> extends ChainBalancesSnapshot<T> {
  /** Reloads the balances of every chain, even fresh ones */
  refresh(): void
}

/** One balances snapshot per chain, cached for a minute, instead of the live stream of `useAccountBalances` */
export function useAccountBalanceSnapshots<T extends RwaTokenSummary>(
  owner: string,
  tokens: T[],
): AccountBalanceSnapshots<T> {
  const chainIds = useMemo(() => getSupportedChainIds(tokens), [tokens])
  const queryClient = useAtomValue(queryClientAtom)
  const results = useAtomValue(chainsBalancesQueryAtomFamily({ owner, chainIds }))

  // Each balances query loads a missing token list first, so this also retries a failed one
  const refresh = useCallback(() => {
    void queryClient.refetchQueries({ queryKey: getBalancesQueryKey(owner) })
  }, [owner, queryClient])

  return useMemo(
    () => ({ ...combineChainBalances(tokens, chainIds, results), refresh }),
    [chainIds, refresh, results, tokens],
  )
}
