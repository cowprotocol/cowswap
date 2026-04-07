import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLocation } from 'react-router'

import { formatRefCode } from '../lib/affiliateProgramUtils'
import { affiliateTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { logAffiliate } from '../utils/logger'

export function useAffiliateTraderRefUrlSideEffect(): void {
  const { isAffiliateProgramEnabled } = useFeatureFlags()
  const setAffiliateModalOpen = useSetAtom(affiliateTraderModalAtom)
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
    setAffiliateModalOpen(true)

    analytics.sendEvent({
      category: 'affiliate',
      action: 'referral_url_opened',
      label: refCode,
    })
  }, [analytics, isAffiliateProgramEnabled, location.search, setAffiliateModalOpen])
}
