import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { Link } from 'react-router-dom'
import { transparentize } from 'polished'

export const LIMIT_ORDERS_TAB_KEY = 'tab'

export const buildLimitOrdersTabUrl = (pathname: string, search: string, tabId: string) => {
  const query = new URLSearchParams(search)
  query.delete(LIMIT_ORDERS_TAB_KEY)
  query.append(LIMIT_ORDERS_TAB_KEY, tabId)

  return pathname + '?' + query
}

const Tabs = styled.div`
  display: inline-block;
  border-radius: 9px;
  overflow: hidden;
  margin: 0;
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
`

const TabButton = styled(Link)<{ active?: boolean }>`
  display: inline-block;
  background: ${({ theme, active }) => (active ? transparentize(0.88, theme.text3) : 'transparent')};
  color: ${({ theme, active }) => (active ? theme.text1 : transparentize(0.2, theme.text1))};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  text-decoration: none;
  font-size: 13px;
  padding: 10px 24px;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: background 0.15s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
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

  return (
    <Tabs>
      {tabs.map((tab, index) => (
        <TabButton
          key={index}
          active={index === activeTabIndex}
          to={(location) => buildLimitOrdersTabUrl(location.pathname, location.search, tab.id)}
        >
          <Trans>{tab.title}</Trans> <span>({tab.count})</span>
        </TabButton>
      ))}
    </Tabs>
  )
}
