import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAffiliateTraderStats } from 'modules/affiliate/hooks/useAffiliateTraderStats'
import { formatUsdcCompact } from 'modules/affiliate/lib/affiliateProgramUtils'
import { NextPayoutCard } from 'modules/affiliate/pure/NextPayoutCard'

export function AffiliateTraderNextPayout(): ReactNode {
  const { account } = useWalletInfo()
  const { data: stats, isLoading } = useAffiliateTraderStats(account)

  return (
    <NextPayoutCard
      showLoader={isLoading}
      payout={stats ? formatUsdcCompact(stats.next_payout) : formatUsdcCompact(0)}
    />
  )
}
