import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAffiliatePartnerInfo } from '../hooks/useAffiliatePartnerInfo'
import { useAffiliatePartnerStats } from '../hooks/useAffiliatePartnerStats'
import { NextPayoutCard } from '../pure/NextPayoutCard'

export function AffiliatePartnerNextPayout(): ReactNode {
  const { account } = useWalletInfo()

  const { data: info, isLoading: codeLoading } = useAffiliatePartnerInfo(account)
  const { data: stats, isLoading: statsLoading } = useAffiliatePartnerStats(account, info?.code)

  return <NextPayoutCard showLoader={codeLoading || statsLoading} payout={stats?.next_payout} />
}
