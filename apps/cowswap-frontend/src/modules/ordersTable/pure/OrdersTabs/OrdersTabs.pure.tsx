import { ReactNode } from 'react'

import { FormOption, Select } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { useNavigate } from 'common/hooks/useNavigate'

import * as styledEl from './OrdersTabs.styled'

import { useGetBuildOrdersTableUrl } from '../../hooks/url/useGetBuildOrdersTableUrl'
import { ORDERS_TABLE_TABS, OrderTab, OrderTabId } from '../../state/tabs/ordersTableTabs.constants'

export interface OrdersTabsProps {
  tabs: OrderTab[]
}

export function OrdersTabs({ tabs }: OrdersTabsProps): ReactNode {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const navigate = useNavigate()
  const activeTabIndex = Math.max(
    tabs.findIndex((i) => i.isActive),
    0,
  )

  const handleSelectChange = (tabId: OrderTabId): void => {
    navigate(buildOrdersTableUrl({ tabId, pageNumber: 1 }))
  }

  const ttabs = ORDERS_TABLE_TABS

  const tabOptions = ttabs.map((tab) => ({
    label: `${i18n._(tab.title)} ${account && `(${tab.count})`}`,
    value: tab.id,
  })) as FormOption<OrderTabId>[]

  return (
    <>
      <styledEl.SelectContainer>
        <Select
          variant="border"
          title={t`Orders`}
          name="orders-tabs"
          value={tabs[activeTabIndex]?.id || tabs[0]?.id}
          options={tabOptions}
          onChange={handleSelectChange}
        />
      </styledEl.SelectContainer>

      <styledEl.Tabs>
        {ttabs.map((tab, index) => {
          const isUnfillable = tab.id === 'unfillable'
          const isSigning = tab.id === 'signing'

          return (
            <styledEl.TabButton
              key={index}
              active={(index === activeTabIndex).toString()}
              $isUnfillable={isUnfillable}
              $isSigning={isSigning}
              $isDisabled={!account}
              to={buildOrdersTableUrl({ tabId: tab.id, pageNumber: 1 })}
            >
              {tab.icon} {i18n._(tab.title)} {account && <span>({tab.count})</span>}
            </styledEl.TabButton>
          )
        })}
      </styledEl.Tabs>
    </>
  )
}
