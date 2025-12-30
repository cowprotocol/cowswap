import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ListState, normalizeListSource, restrictedListsAtom, useToggleList } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  getConsentFromCache,
  rwaConsentCacheAtom,
  RwaConsentKey,
  useGeoStatus,
  useRwaConsentModalState,
} from 'modules/rwa'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

/**
 * Hook that wraps toggle list functionality with consent checking.
 * When trying to enable a restricted list without consent, opens the consent modal.
 */
export function useConsentAwareToggleList(): (list: ListState, enabled: boolean) => void {
  const { account } = useWalletInfo()
  const geoStatus = useGeoStatus()
  const restrictedLists = useAtomValue(restrictedListsAtom)
  const consentCache = useAtomValue(rwaConsentCacheAtom)
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()
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
      // only check consent when trying to enable (not disable)
      if (enabled) {
        // already enabled, just toggle off
        baseToggleList(list, enabled)
        return
      }

      // Trying to enable - check if consent is required
      if (!geoStatus.country && restrictedLists.isLoaded) {
        const normalizedSource = normalizeListSource(list.source)
        const consentHash = restrictedLists.consentHashPerList[normalizedSource]

        if (consentHash) {
          // list is restricted - check if consent exists
          let hasConsent = false
          if (account) {
            const consentKey: RwaConsentKey = { wallet: account, ipfsHash: consentHash }
            const existingConsent = getConsentFromCache(consentCache, consentKey)
            hasConsent = !!existingConsent?.acceptedAt
          }

          if (!hasConsent) {
            // need consent - open modal
            openRwaConsentModal({
              consentHash,
              onImportSuccess: () => {
                // after consent, toggle the list on
                baseToggleList(list, enabled)
              },
            })
            return
          }
        }
      }

      // no consent required or consent already given
      baseToggleList(list, enabled)
    },
    [baseToggleList, geoStatus.country, restrictedLists, account, consentCache, openRwaConsentModal],
  )
}
