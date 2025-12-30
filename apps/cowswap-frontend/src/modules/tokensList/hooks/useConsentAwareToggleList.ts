import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { getSourceAsKey, ListState, restrictedListsAtom, useToggleList } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  getConsentFromCache,
  rwaConsentCacheAtom,
  RwaConsentKey,
  useGeoStatus,
  useRwaConsentModalState,
} from 'modules/rwa'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

// wrap toggle list functionality with consent checking
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
        baseToggleList(list, enabled)
        return
      }

      // trying to enable - check if consent is required
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
            // wallet connected but no consent - open modal
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
