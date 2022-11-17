import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { Link } from 'react-router-dom'

export const LIMIT_ORDERS_TAB_KEY = 'tab'

const Tabs = styled.div`
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 2px solid ${({ theme }) => theme.border2};
`

const TabButton = styled(Link)<{ active?: boolean }>`
  display: inline-block;
  background: ${({ theme, active }) => (active ? theme.bg2 : theme.bg1)};
  color: ${({ theme, active }) => (active ? theme.text2 : theme.text1)};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  text-decoration: none;
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
  id: string
  title: string
  count: number
  isActive?: boolean
}

export interface OrdersTabsProps {
  tabs: OrderTab[]
}

export function OrdersTabs({ tabs }: OrdersTabsProps) {
  const activeTabIndex = Math.max(
    tabs.findIndex((i) => i.isActive),
    0
  )

  const tabUrl = (pathname: string, search: string, tab: OrderTab) => {
    const query = new URLSearchParams(search)
    query.delete(LIMIT_ORDERS_TAB_KEY)
    query.append(LIMIT_ORDERS_TAB_KEY, tab.id)

    return pathname + '?' + query
  }

  return (
    <Tabs>
      {tabs.map((tab, index) => (
        <TabButton
          key={index}
          active={index === activeTabIndex}
          to={(location) => tabUrl(location.pathname, location.search, tab)}
        >
          <Trans>{tab.title}</Trans> <span>({tab.count})</span>
        </TabButton>
      ))}
    </Tabs>
  )
}
