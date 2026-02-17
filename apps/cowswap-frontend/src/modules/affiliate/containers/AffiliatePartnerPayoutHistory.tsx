import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { usePayoutHistory } from 'modules/affiliate/hooks/usePayoutHistory'
import { PayoutHistoryTable } from 'modules/affiliate/pure/PayoutHistoryTable'

export function AffiliatePartnerPayoutHistory(): ReactNode {
  const { account } = useWalletInfo()
  const { rows: payoutHistoryRows, loading: payoutHistoryLoading } = usePayoutHistory({
    account,
    role: 'affiliate',
  })

  return <PayoutHistoryTable rows={payoutHistoryRows} showLoader={payoutHistoryLoading} />
}
