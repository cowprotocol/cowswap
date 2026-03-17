import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { isProviderNetworkUnsupportedAtom } from 'entities/common/isProviderNetworkUnsupported.atom'

import { OrderTabId, tabParamAtom } from 'common/state/routesState'

import { ordersTableStateAtom } from '../ordersTable.atoms'
import { ORDERS_TABLE_TABS } from '../tabs/ordersTableTabs.constants'

export const ordersTableTabsAtom = atom((get) => {
  const { account } = get(walletInfoAtom)
  const isProviderNetworkUnsupported = get(isProviderNetworkUnsupportedAtom)

  if (!account || isProviderNetworkUnsupported) {
    return []
  }

  const { ordersList } = get(ordersTableStateAtom)
  const currentTabId = get(tabParamAtom)

  return ORDERS_TABLE_TABS.filter((tab) => {
    // Always show OPEN and HISTORY tabs
    if (tab.id === OrderTabId.OPEN || tab.id === OrderTabId.HISTORY) {
      return true
    }

    // Only include the unfillable tab if there are unfillable orders
    if (tab.id === OrderTabId.UNFILLABLE) {
      return ordersList[tab.id].length > 0
    }

    // Only include the signing tab if there are signing orders
    if (tab.id === OrderTabId.SIGNING) {
      return ordersList[tab.id].length > 0
    }

    return false
  }).map((tab) => {
    return { ...tab, isActive: tab.id === currentTabId, count: ordersList[tab.id].length }
  })
})
