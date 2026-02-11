import { useSetAtom } from 'jotai/index'
import { ReactNode, useEffect, useMemo } from 'react'

import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'

import { updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'

import { ordersTableStateAtom } from './ordersTable.atoms'
import { OrdersTableParams } from './ordersTable.types'
import { OrderTabId } from './tabs/ordersTableTabs.constants'

import { useCurrentTab } from '../hooks/tabs/useCurrentTab'
import { useTabs } from '../hooks/tabs/useTabs'
import { useValidatePageUrlParams } from '../hooks/url/useValidatePageUrlParams'
import { HistoryStatusFilter, useFilteredOrders } from '../hooks/useFilteredOrders'
import { useOrderActions } from '../hooks/useOrderActions'
import { useOrdersHydrationState } from '../hooks/useOrdersHydrationState'
import { useOrdersTableList } from '../hooks/useOrdersTableList'
import { buildOrdersTableUrl } from '../utils/url/buildOrdersTableUrl'
import { useOrdersTableFilters, usePartiallyUpdateOrdersTableFiltersAtom } from 'modules/ordersTable/hooks/useOrdersTableFilters'

function getOrdersInputTokens(allOrders: Order[]): string[] {
  const setOfTokens = allOrders.reduce((acc, order) => {
    acc.add(order.inputToken.address.toLowerCase())

    return acc
  }, new Set<string>())

  return Array.from(setOfTokens)
}

export function OrdersTableStateUpdater({
  orders: allOrders,
}: OrdersTableParams): ReactNode {
  const { chainId } = useWalletInfo()
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const setOrdersTableState = useSetAtom(ordersTableStateAtom)

  const partiallyUpdateOrdersTableFilters = usePartiallyUpdateOrdersTableFiltersAtom()
  const { orderType, searchTerm, historyStatusFilter } = useOrdersTableFilters() || {}

  const ordersTokens = useMemo(() => getOrdersInputTokens(allOrders), [allOrders])

  const balancesAndAllowances = useBalancesAndAllowances(ordersTokens)
  const ordersList = useOrdersTableList(allOrders, orderType, chainId, balancesAndAllowances)

  const { currentTabId, currentPageNumber } = useCurrentTab(ordersList)

  const orders = ordersList[currentTabId]
  const filteredOrders = useFilteredOrders(orders, {
    searchTerm,
    // The status filter select is only visible in the story tab:
    historyStatusFilter: currentTabId === OrderTabId.history ? historyStatusFilter : HistoryStatusFilter.ALL,
  })
  const hasHydratedOrders = useOrdersHydrationState({ chainId, orders: allOrders })
  const tabs = useTabs(ordersList, currentTabId)

  useEffect(() => {
    partiallyUpdateOrdersTableFilters({ currentTabId })
  }, [currentTabId])

  useEffect(() => {
    partiallyUpdateOrdersTableFilters({ currentPageNumber })
  }, [currentPageNumber])

  useEffect(() => {
    partiallyUpdateOrdersTableFilters({ tabs })
  }, [tabs])

  const orderActions = useOrderActions(allOrders)

  /*
  useEffect(() => {
    setOrdersTableState({
      orders,
      filteredOrders,
      balancesAndAllowances,
      orderActions,
      hasHydratedOrders,
    })
  }, [
    setOrdersTableState,
    orders,
    filteredOrders,
    balancesAndAllowances,
    orderActions,
    hasHydratedOrders,
  ])
    */

  // TODO: Implement as atom side-effect...
  // Clear selection when changing tabs
  useEffect(() => {
    updateOrdersToCancel([])
  }, [currentTabId, updateOrdersToCancel])

  return null
}
