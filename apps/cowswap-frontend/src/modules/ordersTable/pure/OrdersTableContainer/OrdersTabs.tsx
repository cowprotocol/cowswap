import alertCircle from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { OrderTab } from '../../const/tabs'
import { useGetBuildOrdersTableUrl } from '../../hooks/useGetBuildOrdersTableUrl'

const Tabs = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 4px;
  margin: 0;
`

const TabButton = styled(Link)<{ active: string; isUnfillable?: boolean; isSigning?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ active, isUnfillable, isSigning }) =>
    active === 'true'
      ? isUnfillable
        ? `var(${UI.COLOR_DANGER_BG})`
        : isSigning
          ? `var(${UI.COLOR_ALERT_BG})`
          : `var(${UI.COLOR_TEXT_OPACITY_10})`
      : 'transparent'};
  color: ${({ active, isUnfillable, isSigning }) =>
    isUnfillable
      ? `var(${UI.COLOR_DANGER})`
      : isSigning
        ? `var(${UI.COLOR_ALERT_TEXT})`
        : active === 'true'
          ? `var(${UI.COLOR_TEXT_PAPER})`
          : 'inherit'};
  font-weight: ${({ active }) => (active === 'true' ? '600' : '400')};
  border-radius: 14px;
  text-decoration: none;
  font-size: 13px;
  padding: 10px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${Media.upToMedium()} {
    text-align: center;
  }

  &:hover {
    background: ${({ active, isUnfillable, isSigning }) =>
      active === 'true'
        ? isUnfillable
          ? `var(${UI.COLOR_DANGER_BG})`
          : isSigning
            ? `var(${UI.COLOR_ALERT_BG})`
            : `var(${UI.COLOR_TEXT_OPACITY_10})`
        : `var(${UI.COLOR_TEXT_OPACITY_10})`};
    color: ${({ isUnfillable, isSigning }) =>
      isUnfillable ? `var(${UI.COLOR_DANGER})` : isSigning ? `var(${UI.COLOR_ALERT_TEXT})` : 'inherit'};
  }

  > svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  > svg > path {
    fill: currentColor;
  }
`

export interface OrdersTabsProps {
  tabs: OrderTab[]
}

export function OrdersTabs({ tabs }: OrdersTabsProps) {
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const activeTabIndex = Math.max(
    tabs.findIndex((i) => i.isActive),
    0,
  )

  return (
    <Tabs>
      {tabs.map((tab, index) => {
        const isUnfillable = tab.id === 'unfillable'
        const isSigning = tab.id === 'signing'
        return (
          <TabButton
            key={index}
            active={(index === activeTabIndex).toString()}
            isUnfillable={isUnfillable}
            isSigning={isSigning}
            to={buildOrdersTableUrl({ tabId: tab.id, pageNumber: 1 })}
          >
            {isUnfillable && <SVG src={alertCircle} description="warning" />}
            {isSigning && <SVG src={orderPresignaturePending} description="signing" />}
            <Trans>{tab.title}</Trans> <span>({tab.count})</span>
          </TabButton>
        )
      })}
    </Tabs>
  )
}
