import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAffiliateTraderStats } from '../hooks/useAffiliateTraderStats'
import { NextPayoutCard } from '../pure/NextPayoutCard'

export function AffiliateTraderNextPayout(): ReactNode {
  const { account } = useWalletInfo()
  const { data: stats, isLoading } = useAffiliateTraderStats(account)

  return <NextPayoutCard showLoader={isLoading} payout={stats?.next_payout} />
}
