import { ReactElement } from 'react'

import { TraderStatsResponse } from 'modules/affiliate/lib/affiliateProgramTypes'
import { formatUsdcCompact } from 'modules/affiliate/lib/affiliateProgramUtils'
import { NextPayoutCard } from 'modules/affiliate/pure/shared'

interface AffiliateTraderNextPayoutCardProps {
  loading: boolean
  traderStats?: TraderStatsResponse
}

export function AffiliateTraderNextPayoutCard({
  loading,
  traderStats,
}: AffiliateTraderNextPayoutCardProps): ReactElement {
  const nextPayoutValue = traderStats?.next_payout
  const nextPayoutLabel =
    nextPayoutValue !== null && nextPayoutValue !== undefined
      ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(nextPayoutValue)} USDC`
      : formatUsdcCompact(0)

  return <NextPayoutCard payoutLabel={nextPayoutLabel} showLoader={loading} />
}
