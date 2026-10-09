import { atom } from 'jotai'

import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { atomFamily } from 'jotai-family'
import { atomWithQuery, queryClientAtom } from 'jotai-tanstack-query'

import { loadChainBalances } from './loadChainBalances'
import { withWatcherConnection } from './watcherConnections'

import { tokenListQueryOptions } from '@/entities/asset'
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

export function getBalancesQueryKey(owner: string): readonly unknown[] {
  return [RWA_QUERY_KEY_ROOT, 'balances', getAddressKey(owner)]
}

/** Loaded on mount once stale, never polled: `refetchQueries` with `getBalancesQueryKey` refreshes them */
export const chainBalancesQueryAtomFamily = atomFamily(
  ({ owner, chainId }: ChainBalancesParams) =>
    atomWithQuery((get) => {
      const queryClient = get(queryClientAtom)

      return {
        queryKey: [...getBalancesQueryKey(owner), chainId],
        // Options that depend on the token list make jotai-tanstack-query resubscribe when it loads, and the
        // observer gap cancels the in-flight load (its signal is consumed), opening a second watcher session
        queryFn: async ({ signal }) => {
          const tokenList = await queryClient.ensureQueryData(tokenListQueryOptions())

          return withWatcherConnection(() => loadChainBalances(chainId, owner, tokenList, signal))
        },
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
