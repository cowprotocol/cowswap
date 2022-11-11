import styled from 'styled-components/macro'
import { useCallback, useState } from 'react'
import { Trans } from '@lingui/macro'

const Tabs = styled.div`
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
`

const TabButton = styled.button<{ active?: boolean }>`
  background: ${({ theme, active }) => (active ? theme.bg6 : theme.bg1)};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  font-size: 14px;
  padding: 12px 24px;
  border: 0;
  outline: none;
  cursor: pointer;

  :hover {
    background: ${({ theme }) => theme.bg6};
  }
`

export interface OrderTab {
  title: string
  count: number
  isActive?: boolean
}

export interface OrdersTabsProps {
  tabs: OrderTab[]
  onTabChange(tab: OrderTab, index: number): void
}

export function OrdersTabs({ tabs, onTabChange }: OrdersTabsProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(
    Math.max(
      tabs.findIndex((i) => i.isActive),
      0
    )
  )

  const changeTab = useCallback(
    (tab: OrderTab, index: number) => {
      setActiveTabIndex(index)
      onTabChange(tab, index)
    },
    [setActiveTabIndex, onTabChange]
  )

  return (
    <Tabs>
      {tabs.map((tab, index) => (
        <TabButton key={index} active={index === activeTabIndex} onClick={() => changeTab(tab, index)}>
          <Trans>{tab.title}</Trans> <span>({tab.count})</span>
        </TabButton>
      ))}
    </Tabs>
  )
}
