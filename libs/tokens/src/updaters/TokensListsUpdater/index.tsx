import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ReactNode, useEffect } from 'react'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { ChainInfo, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import useSWR, { SWRConfiguration } from 'swr'

import { getFulfilledResults, getIsTimeToUpdate, TOKENS_LISTS_UPDATER_INTERVAL } from './helpers'

import { fetchTokenList } from '../../services/fetchTokenList'
import { environmentAtom, updateEnvironmentAtom } from '../../state/environmentAtom'
import { upsertListsAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { allListsSourcesAtom, tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'
import { UserAddedTokensUpdater } from '../UserAddedTokensUpdater'

const LAST_UPDATE_TIME_DEFAULT = 0

const { atom: lastUpdateTimeAtom, updateAtom: updateLastUpdateTimeAtom } = atomWithPartialUpdate(
  atomWithStorage<PersistentStateByChain<number>>(
    'tokens:lastUpdateTimeAtom:v6',
    mapSupportedNetworks(LAST_UPDATE_TIME_DEFAULT),
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

interface TokensListsUpdaterProps {
  chainId: SupportedChainId
  enableLpTokensByDefault: boolean
  isYieldEnabled: boolean
  excludeRwaLists: boolean
  bridgeNetworkInfo: ChainInfo[] | undefined
}

// TODO: Break down this large function into smaller functions
export function TokensListsUpdater({
  chainId: currentChainId,
  enableLpTokensByDefault,
  isYieldEnabled,
  excludeRwaLists,
  bridgeNetworkInfo,
}: TokensListsUpdaterProps): ReactNode {
  const { chainId } = useAtomValue(environmentAtom)
  const setEnvironment = useSetAtom(updateEnvironmentAtom)
  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const lastUpdateTimeState = useAtomValue(lastUpdateTimeAtom)
  const updateLastUpdateTime = useSetAtom(updateLastUpdateTimeAtom)

  const setTokenListsUpdating = useSetAtom(tokenListsUpdatingAtom)
  const upsertLists = useSetAtom(upsertListsAtom)

  useEffect(() => {
    setEnvironment({
      chainId: currentChainId,
      enableLpTokensByDefault,
      isYieldEnabled,
      excludeRwaLists,
      bridgeNetworkInfo,
    })
  }, [setEnvironment, currentChainId, enableLpTokensByDefault, isYieldEnabled, excludeRwaLists, bridgeNetworkInfo])

  useEffect(() => {
    updateLastUpdateTime({ [chainId]: 0 })
  }, [chainId, updateLastUpdateTime])

  // Fetch tokens lists once in 6 hours
  const { data: listsStates, isLoading } = useSWR<ListState[] | null>(
    ['TokensListsUpdater', allTokensLists, chainId, lastUpdateTimeState],
    () => {
      if (!getIsTimeToUpdate(lastUpdateTimeState[chainId] || LAST_UPDATE_TIME_DEFAULT)) return null

      return Promise.allSettled(allTokensLists.map(fetchTokenList)).then(getFulfilledResults)
    },
    swrOptions,
  )

  // Fulfill tokens lists with tokens from fetched lists
  useEffect(() => {
    setTokenListsUpdating(isLoading)

    if (isLoading || !listsStates) return

    updateLastUpdateTime({ [chainId]: Date.now() })

    upsertLists(chainId, listsStates)
  }, [listsStates, isLoading, chainId, upsertLists, setTokenListsUpdating, updateLastUpdateTime])

  return <UserAddedTokensUpdater />
}
