import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { OrderTab } from '../../const/tabs'
import { useGetBuildOrdersTableUrl } from '../../hooks/useGetBuildOrdersTableUrl'

const Tabs = styled.div`
  display: inline-block;
  border-radius: 9px;
  overflow: hidden;
  margin: 0;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: max-content;
  `};
`

const TabButton = styled(Link)<{ active: string }>`
  display: inline-block;
  background: ${({ active }) => (active === 'true' ? `var(${UI.COLOR_TEXT_OPACITY_10})` : 'transparent')};
  color: ${({ active }) => (active === 'true' ? `var(${UI.COLOR_TEXT_PAPER})` : 'inherit')};
  font-weight: ${({ active }) => (active === 'true' ? '600' : '400')};
  text-decoration: none;
  font-size: 13px;
  padding: 10px 24px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    text-align: center;
  `};

  &:hover {
    background: ${({ active }) =>
      active === 'true' ? `var(${UI.COLOR_TEXT_OPACITY_10})` : `var(${UI.COLOR_TEXT_OPACITY_10})`};
    color: inherit;
  }
`

export interface OrdersTabsProps {
  tabs: OrderTab[]
}

export function OrdersTabs({ tabs }: OrdersTabsProps) {
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
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
          to={buildOrdersTableUrl({ tabId: tab.id, pageNumber: 1 })}
        >
          <Trans>{tab.title}</Trans> <span>({tab.count})</span>
        </TabButton>
      ))}
    </Tabs>
  )
}
