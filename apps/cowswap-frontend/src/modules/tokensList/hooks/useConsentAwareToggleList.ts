import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isRwaTokenListSource, ListState, useToggleList } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getConsentFromCache, RWA_CONSENT_HASH, rwaConsentCacheAtom, RwaConsentKey, useGeoStatus } from 'modules/rwa'

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

      // A known country is decided by the trade-time check in `useRwaTokenStatus`, so consent is only
      // worth asking for while the country is unknown.
      if (!geoStatus.country && isRwaTokenListSource(list.source)) {
        // no wallet: allow toggle, the consent check is deferred to trade time
        if (!account) {
          baseToggleList(list, enabled)
          return
        }

        const consentKey: RwaConsentKey = { wallet: account, ipfsHash: RWA_CONSENT_HASH }
        const existingConsent = getConsentFromCache(consentCache, consentKey)

        if (!existingConsent?.acceptedAt) {
          // set pending state (data only, no callbacks): the token selector's postFlow shows the consent modal
          updateWidgetState({ listToToggle: { list, consentHash: RWA_CONSENT_HASH } })
          return
        }
      }

      // no consent required or consent already given
      baseToggleList(list, enabled)
    },
    [baseToggleList, isRwaGeoblockEnabled, geoStatus.country, account, consentCache, updateWidgetState],
  )
}
