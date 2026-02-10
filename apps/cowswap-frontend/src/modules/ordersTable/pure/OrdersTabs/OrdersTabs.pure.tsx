import { ReactNode, ChangeEvent } from 'react'

import alertCircle from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useNavigate } from 'common/hooks/useNavigate'

import * as styledEl from './OrdersTabs.styled'

import { useGetBuildOrdersTableUrl } from '../../hooks/url/useGetBuildOrdersTableUrl'
import { OrderTab, OrderTabId } from '../../state/tabs/ordersTableTabs.constants'

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

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const tabId = event.target.value as OrderTabId
    navigate(buildOrdersTableUrl({ tabId, pageNumber: 1 }))
  }

  return (
    <>
      <styledEl.SelectContainer>
        <styledEl.Select value={tabs[activeTabIndex]?.id || tabs[0]?.id} onChange={handleSelectChange}>
          {tabs.map((tab) => {
            const isUnfillable = tab.id === 'unfillable'
            const isSigning = tab.id === 'signing'
            return (
              <option key={tab.id} value={tab.id}>
                {isUnfillable && '⚠️ '}
                {isSigning && '⏳ '}
                {i18n._(tab.title)} {account && `(${tab.count})`}
              </option>
            )
          })}
        </styledEl.Select>
      </styledEl.SelectContainer>

      <styledEl.Tabs>
        {tabs.map((tab, index) => {
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
              {isUnfillable && <SVG src={alertCircle} description={t`warning`} />}
              {isSigning && <SVG src={orderPresignaturePending} description={t`signing`} />}
              {i18n._(tab.title)} {account && <span>({tab.count})</span>}
            </styledEl.TabButton>
          )
        })}
      </styledEl.Tabs>
    </>
  )
}
