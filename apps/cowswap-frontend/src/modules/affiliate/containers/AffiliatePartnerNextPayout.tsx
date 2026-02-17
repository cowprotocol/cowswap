import { ReactElement } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAffiliatePartnerInfo } from 'modules/affiliate/hooks/useAffiliatePartnerInfo'
import { useAffiliatePartnerStats } from 'modules/affiliate/hooks/useAffiliatePartnerStats'
import { formatUsdcCompact } from 'modules/affiliate/lib/affiliateProgramUtils'
import { NextPayoutCard } from 'modules/affiliate/pure/NextPayoutCard'

export function AffiliatePartnerNextPayout(): ReactElement {
  const { account } = useWalletInfo()

  const { data: info, isLoading: codeLoading } = useAffiliatePartnerInfo(account)
  const { data: stats, isLoading: statsLoading } = useAffiliatePartnerStats(account, info?.code)

  return (
    <NextPayoutCard
      showLoader={codeLoading || statsLoading}
      payout={stats ? formatUsdcCompact(stats.next_payout) : formatUsdcCompact(0)}
    />
  )
}
