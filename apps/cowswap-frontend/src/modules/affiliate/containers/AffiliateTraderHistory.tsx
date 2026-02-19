import { ChangeEvent, ReactNode, useState } from 'react'

import { Font, Media, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useAffiliateTraderStats } from 'modules/affiliate/hooks/useAffiliateTraderStats'
import { usePayoutHistory } from 'modules/affiliate/hooks/usePayoutHistory'
import { useTraderActivity } from 'modules/affiliate/hooks/useTraderActivity'
import { PayoutHistoryTable } from 'modules/affiliate/pure/PayoutHistoryTable'
import { TraderActivityTable } from 'modules/affiliate/pure/TraderActivityTable'
import * as ordersTabsEl from 'modules/ordersTable/pure/OrdersTabs/OrdersTabs.styled'

enum RewardsHistoryTabId {
  activity = 'activity',
  payouts = 'payouts',
}

interface RewardsHistoryTab {
  id: RewardsHistoryTabId
  title: MessageDescriptor
}

const REWARDS_HISTORY_TABS: RewardsHistoryTab[] = [
  {
    id: RewardsHistoryTabId.activity,
    title: msg`Rewards activity`,
  },
  {
    id: RewardsHistoryTabId.payouts,
    title: msg`Payout history`,
  },
]

export function AffiliateTraderHistory(): ReactNode {
  const { i18n } = useLingui()
  const [historyTab, setHistoryTab] = useState<RewardsHistoryTabId>(RewardsHistoryTabId.activity)
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
  const activeTabIndex = Math.max(
    REWARDS_HISTORY_TABS.findIndex((tab) => tab.id === historyTab),
    0,
  )

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setHistoryTab(event.target.value as RewardsHistoryTabId)
  }

  return (
    <>
      <ordersTabsEl.SelectContainer data-testid="my-rewards-history-tabs">
        <ordersTabsEl.Select value={historyTab} onChange={handleSelectChange}>
          {REWARDS_HISTORY_TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {i18n._(tab.title)}
            </option>
          ))}
        </ordersTabsEl.Select>
      </ordersTabsEl.SelectContainer>
      <TabButtonsContainer>
        <ordersTabsEl.Tabs>
          {REWARDS_HISTORY_TABS.map((tab, index) => (
            <TabButton
              key={tab.id}
              active={(index === activeTabIndex).toString()}
              onClick={() => setHistoryTab(tab.id)}
              type="button"
            >
              {i18n._(tab.title)}
            </TabButton>
          ))}
        </ordersTabsEl.Tabs>
      </TabButtonsContainer>
      {historyTab === RewardsHistoryTabId.activity ? (
        <TraderActivityTable rows={traderActivityRows} showLoader={traderActivityLoading} />
      ) : (
        <PayoutHistoryTable rows={payoutHistoryRows} showLoader={payoutHistoryLoading} />
      )}
    </>
  )
}

const TabButton = styled.button<{ active: string }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: ${({ active }) => (active === 'true' ? `var(${UI.COLOR_TEXT_OPACITY_10})` : 'transparent')};
  color: ${({ active }) =>
    active === 'true' ? `var(${UI.COLOR_TEXT_OPACITY_70})` : `var(${UI.COLOR_TEXT_OPACITY_60})`};
  font-weight: ${({ active }) => (active === 'true' ? '600' : '400')};
  font-family: ${Font.family};
  border-radius: 18px;
  text-decoration: none;
  font-size: 16px;
  line-height: 1.2;
  padding: 8px 12px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;
  white-space: nowrap;

  ${Media.upToMedium()} {
    text-align: center;
  }

  &:hover {
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    color: inherit;
  }
`

const TabButtonsContainer = styled.div`
  // margin-left: -12px;
`
