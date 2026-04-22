import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ReactNode, useEffect, useMemo } from 'react'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { isAdditionalTargetChain, Nullish, TargetChainId } from '@cowprotocol/cow-sdk'

import useSWR, { SWRConfiguration } from 'swr'

import { fetchAdditionalChainTokenList } from '../../services/fetchTokenList'
import { upsertAdditionalChainListsAtom } from '../../state/additionalChainTokenLists/additionalChainTokenListsActionsAtom'
import {
  additionalChainTokenListsUpdatingAtom,
  getAdditionalChainTokenListSources,
} from '../../state/additionalChainTokenLists/additionalChainTokenListsStateAtom'
import { ListState } from '../../types'
import { getFulfilledResults, getIsTimeToUpdate, TOKENS_LISTS_UPDATER_INTERVAL } from '../TokensListsUpdater/helpers'

const LAST_UPDATE_TIME_DEFAULT = 0

const { atom: lastUpdateTimeAtom, updateAtom: updateLastUpdateTimeAtom } = atomWithPartialUpdate(
  atomWithStorage<Partial<Record<TargetChainId, number>>>(
    'additionalChainTokens:lastUpdateTimeAtom:v0',
    {},
    getJotaiMergerStorage(),
    {
      getOnInit: true,
    },
  ),
)

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

interface AdditionalChainTokensListsUpdaterProps {
  targetChainId: Nullish<TargetChainId>
}

/**
 * Fetches and caches token lists for additional target chains (non-EVM, e.g. Solana).
 * Shares the same 6-hour caching interval as TokensListsUpdater.
 * Only runs when targetChainId is an AdditionalTargetChainId (non-EVM).
 */
export function AdditionalChainTokensListsUpdater({
  targetChainId,
}: AdditionalChainTokensListsUpdaterProps): ReactNode {
  const lastUpdateTimeState = useAtomValue(lastUpdateTimeAtom)
  const updateLastUpdateTime = useSetAtom(updateLastUpdateTimeAtom)
  const setAdditionalChainTokenListsUpdating = useSetAtom(additionalChainTokenListsUpdatingAtom)
  const upsertAdditionalChainLists = useSetAtom(upsertAdditionalChainListsAtom)

  const isAdditionalChain = targetChainId && isAdditionalTargetChain(targetChainId)

  const listSources = useMemo(() => {
    if (!isAdditionalChain || targetChainId === undefined) return []
    return getAdditionalChainTokenListSources(targetChainId)
  }, [isAdditionalChain, targetChainId])

  useEffect(() => {
    if (!isAdditionalChain || targetChainId === undefined) return
    updateLastUpdateTime({ [targetChainId]: 0 })
  }, [targetChainId, isAdditionalChain, updateLastUpdateTime])

  const { data: listsStates, isLoading } = useSWR<ListState[] | null>(
    isAdditionalChain && listSources.length > 0
      ? ['AdditionalChainTokensListsUpdater', listSources, targetChainId, lastUpdateTimeState]
      : null,
    () => {
      if (!targetChainId) return null
      const lastUpdate = lastUpdateTimeState[targetChainId] ?? LAST_UPDATE_TIME_DEFAULT
      if (!getIsTimeToUpdate(lastUpdate)) return null

      return Promise.allSettled(listSources.map(fetchAdditionalChainTokenList)).then(getFulfilledResults)
    },
    swrOptions,
  )

  useEffect(() => {
    setAdditionalChainTokenListsUpdating(isLoading)

    if (isLoading || !listsStates || !targetChainId) return

    updateLastUpdateTime({ [targetChainId]: Date.now() })
    upsertAdditionalChainLists(targetChainId, listsStates)
  }, [
    listsStates,
    isLoading,
    targetChainId,
    upsertAdditionalChainLists,
    setAdditionalChainTokenListsUpdating,
    updateLastUpdateTime,
  ])

  return null
}
