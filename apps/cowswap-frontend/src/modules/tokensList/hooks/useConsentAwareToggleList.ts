import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getSourceAsKey, ListState, restrictedListsAtom, useToggleList } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getConsentFromCache, rwaConsentCacheAtom, RwaConsentKey, useGeoStatus } from 'modules/rwa'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

/**
 * Wrap toggle list functionality with consent checking.
 * When consent is required, sets listToToggle in widget state
 * which triggers the consent modal inside the token selector.
 */
export function useConsentAwareToggleList(): (list: ListState, enabled: boolean) => void {
  const { account } = useWalletInfo()
  const { isRwaGeoblockEnabled } = useFeatureFlags()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)
  const updateWidgetState = useUpdateSelectTokenWidgetState()
  const cowAnalytics = useCowAnalytics()

  const baseToggleList = useToggleList((enable, source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: `${enable ? 'Enable' : 'Disable'} List`,
      label: source,
    })
  })

  return useCallback(
    (list: ListState, enabled: boolean) => {
      // skip consent check if ff is disabled
      if (!isRwaGeoblockEnabled) {
        baseToggleList(list, enabled)
        return
      }

      // always allow disabling a list without consent
      if (!enabled) {
        baseToggleList(list, enabled)
        return
      }

      // trying to enable - check if consent is required
      // only require consent when country is unknown (blocked countries are handled by hiding the list)
      if (!geoStatus.country && restrictedLists.isLoaded) {
        const sourceKey = getSourceAsKey(list.source)
        const consentHash = restrictedLists.consentHashPerList[sourceKey]

        if (consentHash) {
          // list is restricted - if no wallet, allow toggle (consent check deferred to trade time)
          if (!account) {
            baseToggleList(list, enabled)
            return
          }

          // wallet connected - check if consent exists
          const consentKey: RwaConsentKey = { wallet: account, ipfsHash: consentHash }
          const existingConsent = getConsentFromCache(consentCache, consentKey)

          if (!existingConsent?.acceptedAt) {
            // wallet connected but no consent - set pending state (data only, no callbacks)
            // the token selector's postFlow will show the consent modal
            updateWidgetState({ listToToggle: { list, consentHash } })
            return
          }
        }
      }

      // no consent required or consent already given
      baseToggleList(list, enabled)
    },
    [
      baseToggleList,
      isRwaGeoblockEnabled,
      geoStatus.country,
      restrictedLists,
      account,
      consentCache,
      updateWidgetState,
    ],
  )
}
