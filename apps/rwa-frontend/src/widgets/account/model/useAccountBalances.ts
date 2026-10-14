'use client'

import { type Atom, atom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { chainsBalancesQueryAtomFamily } from './balanceSnapshotAtoms'
import { watchChainBalances } from './watchChainBalances'
import { holdWatcherConnection, splitWatchedChains } from './watcherConnections'

import { type ChainBalancesResult, combineChainBalances, type Position } from '../lib/chainBalances'
import { getSupportedChainIds } from '../lib/tradeLeg'

import type { BalancesMap } from '@/shared/api'

import { type RwaTokenSummary, tokenListQueryAtom } from '@/entities/asset'

export interface AccountBalances<T extends RwaTokenSummary = RwaTokenSummary> {
  /** Non-zero balances only, `null` until every chain has sent its first snapshot or failed */
  positions: Position<T>[] | null
  error: Error | null
  /** Chains whose balances are missing from `positions` */
  failedChainIds: number[]
}

const NO_CHAIN_RESULTS: Atom<ChainBalancesResult[]> = atom([])

/**
 * Streams the owner's balances of all the RWA tokens, and returns the ones of `tokens`.
 * Chains past the connection limit are loaded once instead, see `splitWatchedChains`
 */
export function useAccountBalances<T extends RwaTokenSummary>(
  owner: string | undefined,
  tokens: T[],
): AccountBalances<T> {
  const { data: tokenList, error: tokenListError } = useAtomValue(tokenListQueryAtom)
  const chainIds = useMemo(() => getSupportedChainIds(tokens), [tokens])
  const { streamed, snapshot } = useMemo(() => splitWatchedChains(chainIds), [chainIds])
  const snapshotResults = useAtomValue(
    owner && snapshot.length ? chainsBalancesQueryAtomFamily({ owner, chainIds: snapshot }) : NO_CHAIN_RESULTS,
  )
  const [balances, setBalances] = useState<Partial<Record<number, BalancesMap>>>({})
  const [errors, setErrors] = useState<Partial<Record<number, Error>>>({})

  useEffect(() => {
    setBalances({})
    setErrors({})

    if (!owner || !tokenList) return

    const stops = streamed.map((chainId) =>
      holdWatcherConnection(() =>
        watchChainBalances(chainId, owner, tokenList, {
          onBalances: (update) => {
            setBalances((current) => ({ ...current, [chainId]: { ...current[chainId], ...update } }))
            setErrors((current) => (current[chainId] ? withoutKey(current, chainId) : current))
          },
          onError: (error) => setErrors((current) => ({ ...current, [chainId]: error })),
        }),
      ),
    )

    return () => stops.forEach((stop) => stop())
  }, [owner, tokenList, streamed])

  return useMemo((): AccountBalances<T> => {
    const streamedResults = streamed.map(
      (chainId): ChainBalancesResult => ({
        data: balances[chainId],
        error: errors[chainId] ?? null,
        isFetching: false,
        dataUpdatedAt: 0,
      }),
    )
    const { positions, error, failedChainIds } = combineChainBalances(
      tokens,
      [...streamed, ...snapshot],
      [...streamedResults, ...snapshotResults],
    )

    // A chain error alone doesn't fail the whole load while other chains are still loading
    return { positions, error: tokenListError ?? (positions ? error : null), failedChainIds }
  }, [balances, errors, snapshot, snapshotResults, streamed, tokenListError, tokens])
}

function withoutKey<T>(record: Partial<Record<number, T>>, key: number): Partial<Record<number, T>> {
  const next = { ...record }
  delete next[key]

  return next
}
