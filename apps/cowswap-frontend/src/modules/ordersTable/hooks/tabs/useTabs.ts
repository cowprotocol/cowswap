import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { OrdersTableList, TabParams } from '../../state/ordersTable.types'
import { ORDERS_TABLE_TABS, OrderTabId } from '../../state/tabs/ordersTableTabs.constants'

export function useTabs(ordersList: OrdersTableList, currentTabId: OrderTabId): TabParams[] {
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  return useMemo(() => {
    // If no account, return empty array (no tabs shown)
    if (!account || isProviderNetworkUnsupported) {
      return []
    }

    return ORDERS_TABLE_TABS.filter((tab) => {
      // Always show OPEN and HISTORY tabs
      if (tab.id === OrderTabId.open || tab.id === OrderTabId.history) {
        return true
      }

      // Show the unfillable tab if it has orders or is the currently active tab.
      // Keeping it visible when active prevents a visual glitch where the tab
      // disappears momentarily while async state propagates (e.g. after order
      // placement, the order list may take a render cycle to update).
      if (tab.id === OrderTabId.unfillable) {
        return ordersList[tab.id].length > 0 || currentTabId === tab.id
      }

      // Same logic for the signing tab
      if (tab.id === OrderTabId.signing) {
        return ordersList[tab.id].length > 0 || currentTabId === tab.id
      }

      return false
    }).map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: ordersList[tab.id].length }
    })
  }, [currentTabId, ordersList, account, isProviderNetworkUnsupported])
}
