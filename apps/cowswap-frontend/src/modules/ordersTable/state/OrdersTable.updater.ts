import { useSetAtom } from 'jotai/index'
import { ReactNode, useEffect, useMemo } from 'react'

import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { Order } from 'legacy/state/orders/actions'

import { updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useNavigate } from 'common/hooks/useNavigate'

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

function getOrdersInputTokens(allOrders: Order[]): string[] {
  const setOfTokens = allOrders.reduce((acc, order) => {
    acc.add(order.inputToken.address.toLowerCase())

    return acc
  }, new Set<string>())

  return Array.from(setOfTokens)
}

interface OrdersTableStateUpdaterProps extends OrdersTableParams {
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  syncWithUrl?: boolean
}

// todo will fix in the next pr

export function OrdersTableStateUpdater({
  orders: allOrders,
  // orderType,
  searchTerm = '',
  historyStatusFilter,
  // displayOrdersOnlyForSafeApp = false,
  syncWithUrl = true,
}: OrdersTableStateUpdaterProps): ReactNode {
  const { chainId } = useWalletInfo()
  const navigate = useNavigate()
  const location = useLocation()
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const setOrdersTableState = useSetAtom(ordersTableStateAtom)

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

  const orderActions = useOrderActions(allOrders)

  useEffect(() => {
    setOrdersTableState({
      currentTabId,
      tabs,
      orders,
      filteredOrders,
      displayOrdersOnlyForSafeApp,
      currentPageNumber,
      balancesAndAllowances,
      orderActions,
      orderType,
      hasHydratedOrders,
    })
  }, [
    setOrdersTableState,
    tabs,
    orders,
    filteredOrders,
    currentTabId,
    displayOrdersOnlyForSafeApp,
    currentPageNumber,
    balancesAndAllowances,
    orderActions,
    orderType,
    hasHydratedOrders,
  ])

  // Set page params initially once
  useEffect(() => {
    // todo - need to divide this logic from updater
    syncWithUrl &&
      navigate(
        buildOrdersTableUrl(location, {
          pageNumber: currentPageNumber,
          tabId: currentTabId,
        }),
        { replace: true },
      )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useValidatePageUrlParams(orders.length, currentTabId, currentPageNumber)

  // Clear selection when changing tabs
  useEffect(() => {
    updateOrdersToCancel([])
  }, [currentTabId, updateOrdersToCancel])

  return null
}
