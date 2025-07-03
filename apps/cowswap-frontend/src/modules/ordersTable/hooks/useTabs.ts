import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ORDERS_TABLE_TABS, OrderTabId } from '../const/tabs'
import { OrdersTableList, TabParams } from '../types'

const DEFAULT_STATE: TabParams[] = [{ ...ORDERS_TABLE_TABS[0], count: 0, isActive: true }]

export function useTabs(ordersList: OrdersTableList, currentTabId: OrderTabId): TabParams[] {
  const { account } = useWalletInfo()

  return useMemo(() => {
    // If no account, just return the ALL_ORDERS_TAB with count 0
    if (!account) {
      return DEFAULT_STATE
    }

    return ORDERS_TABLE_TABS.filter((tab) => {
      // Only include the unfillable tab if there are unfillable orders
      if (tab.id === OrderTabId.unfillable) {
        return ordersList[tab.id].length > 0
      }
      // Only include the signing tab if there are signing orders
      if (tab.id === OrderTabId.signing) {
        return ordersList[tab.id].length > 0
      }
      return true
    }).map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: ordersList[tab.id].length }
    })
  }, [currentTabId, ordersList, account])
}
