import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ReactNode, useEffect, useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { atomWithPartialUpdate, isInjectedWidget } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { ChainInfo, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import * as Sentry from '@sentry/browser'
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

const NETWORKS_WITHOUT_RESTRICTIONS: SupportedChainId[] = [SupportedChainId.SEPOLIA]

interface TokensListsUpdaterProps {
  chainId: SupportedChainId
  isGeoBlockEnabled: boolean
  enableLpTokensByDefault: boolean
  isYieldEnabled: boolean
  bridgeNetworkInfo: ChainInfo[] | undefined
}

/**
 * Geoblock query related errors to be ignored
 *
 * Those can happen when the domain we use to detect user's location is inaccessible, usually due to adblockers
 * Errors not meeting these filters will still be logged as usual
 */
const GEOBLOCK_ERRORS_TO_IGNORE = /(failed to fetch)|(load failed)/i

/**
 * Temporary hidden under feature flag xStocks list URL
 */
const XSTOCKS_LIST_URL =
  'https://raw.githubusercontent.com/backed-fi/cowswap-xstocks-tokenlist/refs/heads/main/tokenlist.json'

// TODO: Break down this large function into smaller functions
export function TokensListsUpdater({
  chainId: currentChainId,
  isGeoBlockEnabled,
  enableLpTokensByDefault,
  isYieldEnabled,
  bridgeNetworkInfo,
}: TokensListsUpdaterProps): ReactNode {
  const { chainId } = useAtomValue(environmentAtom)
  const setEnvironment = useSetAtom(updateEnvironmentAtom)
  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const lastUpdateTimeState = useAtomValue(lastUpdateTimeAtom)
  const updateLastUpdateTime = useSetAtom(updateLastUpdateTimeAtom)
  const { isXStocksListEnabled } = useFeatureFlags()

  const setTokenListsUpdating = useSetAtom(tokenListsUpdatingAtom)
  const upsertLists = useSetAtom(upsertListsAtom)

  const filteredTokenLists = useMemo(() => {
    if (isXStocksListEnabled !== true) {
      return allTokensLists.filter((list) => list.source.toLowerCase() !== XSTOCKS_LIST_URL.toLowerCase())
    }
    return allTokensLists
  }, [allTokensLists, isXStocksListEnabled])

  useEffect(() => {
    setEnvironment({ chainId: currentChainId, enableLpTokensByDefault, isYieldEnabled, bridgeNetworkInfo })
  }, [setEnvironment, currentChainId, enableLpTokensByDefault, isYieldEnabled, bridgeNetworkInfo])

  // Reset last update time when feature flag changes to force immediate refetch
  useEffect(() => {
    updateLastUpdateTime({ [chainId]: 0 })
  }, [chainId, isXStocksListEnabled, updateLastUpdateTime])

  // Fetch tokens lists once in 6 hours
  const { data: listsStates, isLoading } = useSWR<ListState[] | null>(
    ['TokensListsUpdater', filteredTokenLists, chainId, lastUpdateTimeState, isXStocksListEnabled],
    () => {
      if (!getIsTimeToUpdate(lastUpdateTimeState[chainId] || LAST_UPDATE_TIME_DEFAULT)) return null

      return Promise.allSettled(filteredTokenLists.map(fetchTokenList)).then(getFulfilledResults)
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

  // Check if a user is from US and use Uniswap list, because of the SEC regulations
  useEffect(() => {
    if (!isGeoBlockEnabled || isInjectedWidget()) return

    if (NETWORKS_WITHOUT_RESTRICTIONS.includes(chainId)) {
      setEnvironment({ useCuratedListOnly: false })
      return
    }

    fetch('https://api.country.is')
      .then((res) => res.json())
      .then(({ country }) => {
        const isUsUser = country === 'US'

        if (isUsUser) {
          setEnvironment({ useCuratedListOnly: true })
          updateLastUpdateTime({ [chainId]: 0 })
        }
      })
      .catch((error) => {
        if (GEOBLOCK_ERRORS_TO_IGNORE.test(error?.toString())) return

        const sentryError = Object.assign(error, {
          name: 'GeoBlockingError',
        })

        Sentry.captureException(sentryError, {
          tags: {
            errorType: 'GeoBlockingError',
          },
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, isGeoBlockEnabled])

  return <UserAddedTokensUpdater />
}
