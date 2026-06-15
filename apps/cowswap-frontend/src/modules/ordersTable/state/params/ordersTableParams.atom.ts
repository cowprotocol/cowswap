import { atom } from 'jotai'

import { clampValue } from '@cowprotocol/common-utils'

import { msg } from '@lingui/core/macro'

import { OrdersTableList } from 'modules/ordersTable/state/ordersTable.types'

import { OrderTabId, pageParamAtom, tabParamAtom } from 'common/state/routesState'

import { OrderTab, ORDERS_TABLE_PAGE_SIZE } from './ordersTableParams.constants'

import { ordersTableStateAtom } from '../ordersTable.atoms'

/*
const isOrdersTableParamsSyncedAtom = atom((get) => {
  const orderType = get(ordersTableOrderTypeAtom)
  const locationOrderType = get(locationOrderTypeAtom)

  return orderType !== null && orderType === locationOrderType
})

// Tab query param scoped to the active orders-table order type (ignores stale URL during route transitions).
export const ordersTableTabParamAtom = atom((get) => {
  if (!get(isOrdersTableParamsSyncedAtom)) return null

  return get(tabParamAtom)
})

// Page query param scoped to the active orders-table order type (ignores stale URL during route transitions).
export const ordersTablePageParamAtom = atom((get) => {
  if (!get(isOrdersTableParamsSyncedAtom)) return null

  return get(pageParamAtom)
})
*/

export interface GetTabIdParams {
  hasHydratedOrders: boolean
  ordersList: OrdersTableList
  tabParam: OrderTabId | null
}

export function getTabsAndCurrentTab({ hasHydratedOrders, ordersList, tabParam }: GetTabIdParams): {
  tabs: OrderTab[]
  tabId: OrderTabId | null
} {
  if (!hasHydratedOrders) return { tabs: [], tabId: null }

  const tabs: OrderTab[] = [
    {
      id: OrderTabId.SIGNING,
      title: msg`Signing`,
      count: ordersList[OrderTabId.SIGNING].length,
    },
    {
      id: OrderTabId.OPEN,
      title: msg`Open`,
      count: ordersList[OrderTabId.OPEN].length,
    },
    {
      id: OrderTabId.UNFILLABLE,
      title: msg`Unfillable`,
      count: ordersList[OrderTabId.UNFILLABLE].length,
    },
    {
      id: OrderTabId.HISTORY,
      title: msg`Orders history`,
      count: ordersList[OrderTabId.HISTORY].length,
    },
  ].filter((tab) => {
    return tab.id === OrderTabId.OPEN || tab.id === OrderTabId.HISTORY || tab.count > 0
  })

  const defaultTabId =
    ordersList[OrderTabId.OPEN].length > 0 || ordersList[OrderTabId.HISTORY].length === 0
      ? OrderTabId.OPEN
      : OrderTabId.HISTORY

  const tabId = tabs.find((tab) => tab.id === tabParam)?.id || defaultTabId
  const currentTab = tabs.find((tab) => tab.id === tabId)

  if (currentTab) currentTab.isActive = true

  return { tabs, tabId }
}

export const ordersTableTabsAndCurrentTabAtom = atom((get) => {
  const { hasHydratedOrders, ordersList } = get(ordersTableStateAtom)
  const tabParam = get(tabParamAtom)

  return getTabsAndCurrentTab({ hasHydratedOrders, ordersList, tabParam })
})

export const ordersTableTabsAtom = atom((get) => {
  return get(ordersTableTabsAndCurrentTabAtom).tabs
})

export const ordersTableTabIdAtom = atom((get) => {
  return get(ordersTableTabsAndCurrentTabAtom).tabId
})

export const ordersTablePageAtom = atom((get) => {
  const { filteredOrders, hasHydratedOrders } = get(ordersTableStateAtom)

  if (!filteredOrders || !hasHydratedOrders) return null

  const pageParam = get(pageParamAtom) || 1
  const pagesCount = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_TABLE_PAGE_SIZE))

  return clampValue(pageParam, 1, pagesCount)
})

export const ordersTableParamsAtom = atom((get) => ({
  tab: get(ordersTableTabIdAtom),
  page: get(ordersTablePageAtom),
}))
