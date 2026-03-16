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

      // Only include the unfillable tab if there are unfillable orders
      if (tab.id === OrderTabId.unfillable) {
        return ordersList[tab.id].length > 0
      }

      // Only include the signing tab if there are signing orders
      if (tab.id === OrderTabId.signing) {
        return ordersList[tab.id].length > 0
      }

      return false
    }).map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: ordersList[tab.id].length }
    })
  }, [currentTabId, ordersList, account, isProviderNetworkUnsupported])
}
