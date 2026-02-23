import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLocation } from 'react-router'

import { formatRefCode } from '../lib/affiliateProgramUtils'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function useAffiliateTraderRefUrlSideEffect(): void {
  const { isAffiliateProgramEnabled } = useFeatureFlags()
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)
  const location = useLocation()
  const analytics = useCowAnalytics()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const refCodeParam = searchParams.get('ref')
    const refCode = formatRefCode(refCodeParam)

    if (!refCode || !refCodeParam || !isAffiliateProgramEnabled) return

    toggleAffiliateModal()

    analytics.sendEvent({
      category: 'affiliate',
      action: 'referral_url_opened',
      label: refCode,
    })
  }, [analytics, isAffiliateProgramEnabled, location.search, toggleAffiliateModal])
}
