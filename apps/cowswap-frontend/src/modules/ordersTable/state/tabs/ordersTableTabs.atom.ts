import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { ordersTableStateAtom } from '../ordersTable.atoms'
import { tabParamAtom } from '../params/ordersTableParams.atoms'
import { OrderTabId, ORDERS_TABLE_TABS } from '../tabs/ordersTableTabs.constants'

export const ordersTableTabsAtom = atom((get) => {
  const { account } = get(walletInfoAtom)
  // const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkUnsupported = false

  if (!account || isProviderNetworkUnsupported) {
    return []
  }

  const { ordersList } = get(ordersTableStateAtom)
  const currentTabId = get(tabParamAtom)

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
})
