import { atom } from 'jotai'

import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { loadChainBalances } from './loadChainBalances'

import { limitConcurrency } from '../lib/limitConcurrency'

import { tokenListQueryAtom } from '@/entities/asset'
import { RWA_QUERY_KEY_ROOT } from '@/shared/api'

interface ChainBalancesParams {
  owner: string
  chainId: number
}

interface ChainsBalancesParams {
  owner: string
  chainIds: number[]
}

const BALANCES_STALE_TIME_MS = 60_000
// Browsers open at most 6 HTTP/1.1 connections per host and each SSE stream holds one until it closes
const MAX_BALANCES_WATCHER_CONNECTIONS = 6

const withWatcherConnection = limitConcurrency(MAX_BALANCES_WATCHER_CONNECTIONS)

export function getBalancesQueryKey(owner: string): readonly unknown[] {
  return [RWA_QUERY_KEY_ROOT, 'balances', getAddressKey(owner)]
}

/** Loaded on mount once stale, never polled: `refetchQueries` with `getBalancesQueryKey` refreshes them */
export const chainBalancesQueryAtomFamily = atomFamily(
  ({ owner, chainId }: ChainBalancesParams) =>
    atomWithQuery((get) => {
      const tokenList = get(tokenListQueryAtom).data

      return {
        queryKey: [...getBalancesQueryKey(owner), chainId],
        queryFn: ({ signal }) => {
          if (!tokenList) throw new Error('The RWA token list is not loaded')

          return withWatcherConnection(() => loadChainBalances(chainId, owner, tokenList, signal))
        },
        enabled: Boolean(tokenList),
        staleTime: BALANCES_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      }
    }),
  (a, b) => areAddressesEqual(a.owner, b.owner) && a.chainId === b.chainId,
)

/** Results in `chainIds` order */
export const chainsBalancesQueryAtomFamily = atomFamily(
  ({ owner, chainIds }: ChainsBalancesParams) =>
    atom((get) => chainIds.map((chainId) => get(chainBalancesQueryAtomFamily({ owner, chainId })))),
  (a, b) => areAddressesEqual(a.owner, b.owner) && a.chainIds.join() === b.chainIds.join(),
)
