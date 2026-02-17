import { ReactNode, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useAffiliateTraderStats } from 'modules/affiliate/hooks/useAffiliateTraderStats'
import { usePayoutHistory } from 'modules/affiliate/hooks/usePayoutHistory'
import { useTraderActivity } from 'modules/affiliate/hooks/useTraderActivity'
import { PayoutHistoryTable } from 'modules/affiliate/pure/PayoutHistoryTable'
import { TraderActivityTable } from 'modules/affiliate/pure/TraderActivityTable'

import * as tabsEl from 'common/pure/Tabs'

type RewardsHistoryTab = 'activity' | 'payouts'

export function AffiliateTraderHistory(): ReactNode {
  const [historyTab, setHistoryTab] = useState<RewardsHistoryTab>('activity')
  const { account } = useWalletInfo()
  const { data: traderStats } = useAffiliateTraderStats(account)
  const { rows: traderActivityRows, loading: traderActivityLoading } = useTraderActivity({
    account,
    boundReferrerCode: traderStats?.bound_referrer_code,
    linkedSince: traderStats?.linked_since,
    rewardsEnd: traderStats?.rewards_end,
  })
  const { rows: payoutHistoryRows, loading: payoutHistoryLoading } = usePayoutHistory({
    account,
    role: 'trader',
  })

  return (
    <>
      <tabsEl.Tabs data-testid="my-rewards-history-tabs">
        <tabsEl.Tab $active={historyTab === 'activity'} onClick={() => setHistoryTab('activity')}>
          <Trans>Rewards activity</Trans>
        </tabsEl.Tab>
        <tabsEl.Tab $active={historyTab === 'payouts'} onClick={() => setHistoryTab('payouts')}>
          <Trans>Payout history</Trans>
        </tabsEl.Tab>
      </tabsEl.Tabs>
      {historyTab === 'activity' ? (
        <TraderActivityTable rows={traderActivityRows} showLoader={traderActivityLoading} />
      ) : (
        <PayoutHistoryTable rows={payoutHistoryRows} showLoader={payoutHistoryLoading} />
      )}
    </>
  )
}
