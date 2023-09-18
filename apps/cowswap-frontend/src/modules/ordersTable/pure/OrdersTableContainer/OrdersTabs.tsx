import { Trans } from '@lingui/macro'
import { transparentize } from 'polished'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

import { buildOrdersTableUrl } from 'modules/ordersTable/utils/buildOrdersTableUrl'

import { UI } from 'common/constants/theme'

import { OrderTab } from '../../const/tabs'

const Tabs = styled.div`
  display: inline-block;
  border-radius: 9px;
  overflow: hidden;
  margin: 0;
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  `};
`

const TabButton = styled(Link)<{ active: string }>`
  display: inline-block;
  background: ${({ theme, active }) => (active === 'true' ? transparentize(0.88, theme.text3) : 'transparent')};
  color: ${({ theme, active }) => (active === 'true' ? `var(${UI.COLOR_TEXT1})` : transparentize(0.2, theme.text1))};
  font-weight: ${({ active }) => (active === 'true' ? '600' : '400')};
  text-decoration: none;
  font-size: 13px;
  padding: 10px 24px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: background 0.15s ease-in-out, color 0.2s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    text-align: center;
  `};

  &:hover {
    background: var(${UI.COLOR_CONTAINER_BG_01});
    color: var(${UI.COLOR_TEXT1});
  }
`

export interface OrdersTabsProps {
  tabs: OrderTab[]
}

export function OrdersTabs({ tabs }: OrdersTabsProps) {
  const location = useLocation()
  const activeTabIndex = Math.max(
    tabs.findIndex((i) => i.isActive),
    0
  )

  return (
    <Tabs>
      {tabs.map((tab, index) => (
        <TabButton
          key={index}
          active={(index === activeTabIndex).toString()}
          to={buildOrdersTableUrl(location, { tabId: tab.id, pageNumber: 1 })}
        >
          <Trans>{tab.title}</Trans> <span>({tab.count})</span>
        </TabButton>
      ))}
    </Tabs>
  )
}
