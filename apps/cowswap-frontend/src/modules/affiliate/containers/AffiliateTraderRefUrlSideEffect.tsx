import { useSetAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { formatRefCode } from '../lib/affiliateProgramUtils'
import { openTraderReferralCodeModalAtom } from '../state/affiliateTraderWriteAtoms'

export function AffiliateTraderRefUrlSideEffect(): ReactNode {
  const { isAffiliateProgramEnabled } = useFeatureFlags()
  const openModal = useSetAtom(openTraderReferralCodeModalAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const analytics = useCowAnalytics()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const refCodeParam = searchParams.get('ref')
    const refCode = formatRefCode(refCodeParam)

    if (!refCode || !refCodeParam || !isAffiliateProgramEnabled) return

    const nextParams = new URLSearchParams(location.search)
    nextParams.delete('ref')
    const nextSearch = nextParams.toString()

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
        hash: location.hash,
      },
      { replace: true },
    )
    openModal(refCode)

    analytics.sendEvent({
      category: 'affiliate',
      action: 'referral_url_opened',
      label: refCode,
    })
  }, [analytics, isAffiliateProgramEnabled, location.hash, location.pathname, location.search, navigate, openModal])

  return null
}
