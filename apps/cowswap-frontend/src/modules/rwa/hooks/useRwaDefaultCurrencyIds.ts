import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  getSourceAsKey,
  ONDO_TOKENS_LIST_SOURCE,
  restrictedListsAtom,
  useIsListEnabledForChain,
} from '@cowprotocol/tokens'

import { featureFlagsStatusAtom } from 'common/state/featureFlagsState'

import { useGeoStatus } from './useGeoStatus'

import { getRwaDefaultCurrencyIds, RwaDefaultCurrencyIds } from '../utils/getRwaDefaultCurrencyIds'
import { getRwaListAvailability } from '../utils/getRwaListAvailability'

export interface RwaDefaultCurrencyIdsState {
  isLoading: boolean
  currencyIds: RwaDefaultCurrencyIds | undefined
}

export function useRwaDefaultCurrencyIds(chainId: SupportedChainId | undefined): RwaDefaultCurrencyIdsState {
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const featureFlagsStatus = useAtomValue(featureFlagsStatusAtom)
  const isOndoListEnabled = useIsListEnabledForChain(ONDO_TOKENS_LIST_SOURCE, chainId)
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const geoStatus = useGeoStatus()
  const sourceKey = getSourceAsKey(ONDO_TOKENS_LIST_SOURCE)
  const availability = getRwaListAvailability({
    isEnabled: isOndoListEnabled,
    areFeatureFlagsLoading: featureFlagsStatus === 'loading',
    isGeoBlockEnabled: Boolean(isRwaGeoblockEnabled),
    areRestrictedListsLoaded: restrictedLists.isLoaded,
    restrictedCountries: restrictedLists.blockedCountriesPerList[sourceKey],
    geoCountry: geoStatus.country,
    isGeoLoading: geoStatus.isLoading,
    geoError: geoStatus.error,
  })

  return {
    isLoading: availability === 'loading',
    currencyIds: chainId ? getRwaDefaultCurrencyIds(chainId, availability === 'available') : undefined,
  }
}
