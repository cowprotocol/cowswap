import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { usePayoutHistory } from 'modules/affiliate/hooks/usePayoutHistory'
import { PayoutHistoryTable } from 'modules/affiliate/pure/PayoutHistoryTable'
import { CardTitle } from 'modules/affiliate/pure/shared'

export function AffiliatePartnerPayoutHistory(): ReactNode {
  const { account } = useWalletInfo()
  const { rows: payoutHistoryRows, loading: payoutHistoryLoading } = usePayoutHistory({
    account,
    role: 'affiliate',
  })

  return (
    <PayoutHistoryTable
      rows={payoutHistoryRows}
      header={
        <CardTitle>
          <Trans>Payout history</Trans>
        </CardTitle>
      }
      showLoader={payoutHistoryLoading}
    />
  )
}
