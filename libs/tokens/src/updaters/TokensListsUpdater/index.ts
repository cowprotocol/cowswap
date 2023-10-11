import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import useSWR, { SWRConfiguration } from 'swr'
import ms from 'ms.macro'
import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { allListsSourcesAtom, tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { fetchTokenList } from '../../services/fetchTokenList'
import { environmentAtom } from '../../state/environmentAtom'
import { getFulfilledResults, getIsTimeToUpdate, LAST_UPDATE_TIME_KEY } from './helpers'
import { ListState } from '../../types'
import { upsertListsAtom } from '../../state/tokenLists/tokenListsActionsAtom'

const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

export function TokensListsUpdater({ chainId: currentChainId }: { chainId: SupportedChainId }) {
  const [{ chainId }, setEnvironment] = useAtom(environmentAtom)
  const allTokensLists = useAtomValue(allListsSourcesAtom)

  const setTokenListsUpdating = useSetAtom(tokenListsUpdatingAtom)
  const upsertLists = useSetAtom(upsertListsAtom)

  useEffect(() => {
    setEnvironment({ chainId: currentChainId })
  }, [setEnvironment, currentChainId])

  // Fetch tokens lists once in 6 hours
  const { data: listsStates, isLoading } = useSWR<ListState[] | null>(
    ['TokensListsUpdater', allTokensLists, chainId],
    () => {
      if (!getIsTimeToUpdate(chainId)) return null

      return Promise.allSettled(allTokensLists.map(fetchTokenList)).then(getFulfilledResults)
    },
    swrOptions
  )

  // Fulfill tokens lists with tokens from fetched lists
  useEffect(() => {
    setTokenListsUpdating(isLoading)

    if (isLoading || !listsStates) return

    localStorage.setItem(LAST_UPDATE_TIME_KEY(chainId), Date.now().toString())

    upsertLists(chainId, listsStates)
  }, [listsStates, isLoading, chainId, upsertLists, setTokenListsUpdating])

  return null
}
