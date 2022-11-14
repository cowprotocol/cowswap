import styled from 'styled-components/macro'
import { useCallback, useState } from 'react'
import { Trans } from '@lingui/macro'

const Tabs = styled.div`
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 2px solid ${({ theme }) => theme.border2};
`

const TabButton = styled.button<{ active?: boolean }>`
  background: ${({ theme, active }) => (active ? theme.bg2 : theme.bg1)};
  color: ${({ theme, active }) => (active ? theme.text2 : theme.text1)};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  font-size: 14px;
  padding: 12px 24px;
  border: 0;
  outline: none;
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.text2};
    background: ${({ theme }) => theme.bg2};
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
