import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLocation } from 'react-router'

import { AffiliateEntrySource } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import { openTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { logAffiliate } from '../utils/logger'

export function useAffiliateTraderRefUrlSideEffect(): void {
  const { isAffiliateProgramEnabled } = useFeatureFlags()
  const openAffiliateModal = useSetAtom(openTraderModalAtom)
  const location = useLocation()
  const analytics = useCowAnalytics()

  useEffect(() => {
    const routerSearchParams = new URLSearchParams(location.search || '')
    const windowSearchParams = new URLSearchParams(window.location.search || '')
    const refCodeParam = windowSearchParams.get('ref') ?? routerSearchParams.get('ref')
    const refCode = formatRefCode(refCodeParam)

    if (refCodeParam && !refCode) {
      logAffiliate('Invalid ref code in URL', { refCodeParam })
    }

    if (!refCode || !refCodeParam || !isAffiliateProgramEnabled) return

    logAffiliate('Ref code found in URL, opening affiliate modal', { refCode })
    openAffiliateModal(AffiliateEntrySource.DEEP_LINK)

    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_referral_url_detected',
      entrySource: AffiliateEntrySource.DEEP_LINK,
    })
  }, [analytics, isAffiliateProgramEnabled, location.search, openAffiliateModal])
}
