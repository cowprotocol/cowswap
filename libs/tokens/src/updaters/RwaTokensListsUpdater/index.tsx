import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useMemo } from 'react'

import useSWR, { SWRConfiguration } from 'swr'

import { getMissingRwaLists, MissingRwaList } from './getMissingRwaLists'

import { fetchTokenList } from '../../services/fetchTokenList'
import { upsertListsAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { listsStatesByChainAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'

interface FetchedRwaList {
  chainId: MissingRwaList['chainId']
  listState: ListState
}

const swrOptions: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
}

/**
 * `TokensListsUpdater` only stores the lists of the current chain, while a cross-chain swap can buy an RWA
 * token on a chain the user has never opened. Without that chain's RWA list the token is not known as RWA,
 * and the consent fallback does not apply to it while its restriction is unresolved.
 */
export function RwaTokensListsUpdater(): ReactNode {
  const listsStatesByChain = useAtomValue(listsStatesByChainAtom)
  const upsertLists = useSetAtom(upsertListsAtom)

  const missingLists = useMemo(() => getMissingRwaLists(listsStatesByChain), [listsStatesByChain])

  const { data: fetchedLists } = useSWR<FetchedRwaList[]>(
    missingLists.length ? ['RwaTokensListsUpdater', missingLists] : null,
    () => fetchRwaLists(missingLists),
    swrOptions,
  )

  useEffect(() => {
    if (!fetchedLists?.length) return

    // Sequential: each upsert reads the whole stored state, so concurrent ones would overwrite each other
    void fetchedLists.reduce(
      (previous, { chainId, listState }) => previous.then(() => upsertLists(chainId, [listState])),
      Promise.resolve(),
    )
  }, [fetchedLists, upsertLists])

  return null
}

async function fetchRwaLists(missingLists: MissingRwaList[]): Promise<FetchedRwaList[]> {
  const results = await Promise.allSettled(
    missingLists.map(async ({ chainId, list }) => ({ chainId, listState: await fetchTokenList(list) })),
  )

  const fetched = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))

  // Throwing hands a total failure to SWR's error retry; after a partial one, upserting the fetched lists
  // changes the SWR key, so the still-missing lists are fetched again under the new key
  if (!fetched.length) {
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    throw rejected?.reason
  }

  return fetched
}
