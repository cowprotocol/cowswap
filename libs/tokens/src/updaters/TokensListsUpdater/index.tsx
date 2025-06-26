import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect } from 'react'

import { atomWithPartialUpdate, isInjectedWidget } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { ChainInfo, SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import * as Sentry from '@sentry/browser'
import useSWR, { SWRConfiguration } from 'swr'

import { TOKENS_LISTS_UPDATER_INTERVAL, getFulfilledResults, getIsTimeToUpdate } from './helpers'

import { fetchTokenList } from '../../services/fetchTokenList'
import { environmentAtom, updateEnvironmentAtom } from '../../state/environmentAtom'
import { upsertListsAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { allListsSourcesAtom, tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'
import { UserAddedTokensUpdater } from '../UserAddedTokensUpdater'

const LAST_UPDATE_TIME_DEFAULT = 0

const { atom: lastUpdateTimeAtom, updateAtom: updateLastUpdateTimeAtom } = atomWithPartialUpdate(
  atomWithStorage<PersistentStateByChain<number>>(
    'tokens:lastUpdateTimeAtom:v4',
    mapSupportedNetworks(LAST_UPDATE_TIME_DEFAULT),
    getJotaiMergerStorage(),
  ),
)

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

const NETWORKS_WITHOUT_RESTRICTIONS = [SupportedChainId.SEPOLIA]

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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function TokensListsUpdater({
  chainId: currentChainId,
  isGeoBlockEnabled,
  enableLpTokensByDefault,
  isYieldEnabled,
  bridgeNetworkInfo,
}: TokensListsUpdaterProps) {
  const { chainId } = useAtomValue(environmentAtom)
  const setEnvironment = useSetAtom(updateEnvironmentAtom)
  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const lastUpdateTimeState = useAtomValue(lastUpdateTimeAtom)
  const updateLastUpdateTime = useSetAtom(updateLastUpdateTimeAtom)

  const setTokenListsUpdating = useSetAtom(tokenListsUpdatingAtom)
  const upsertLists = useSetAtom(upsertListsAtom)

  useEffect(() => {
    setEnvironment({ chainId: currentChainId, enableLpTokensByDefault, isYieldEnabled, bridgeNetworkInfo })
  }, [setEnvironment, currentChainId, enableLpTokensByDefault, isYieldEnabled, bridgeNetworkInfo])

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
