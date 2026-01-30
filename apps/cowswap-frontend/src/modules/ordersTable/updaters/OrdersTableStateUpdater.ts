import { useSetAtom } from 'jotai/index'
import { ReactNode, useEffect, useMemo } from 'react'

import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { Order } from 'legacy/state/orders/actions'

import { updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useNavigate } from 'common/hooks/useNavigate'

import { OrderTabId } from '../const/tabs'
import { useOrdersTableList } from '../containers/OrdersTableWidget/hooks/useOrdersTableList'
import { useValidatePageUrlParams } from '../containers/OrdersTableWidget/hooks/useValidatePageUrlParams'
import { useCurrentTab } from '../hooks/useCurrentTab'
import { HistoryStatusFilter, useFilteredOrders } from '../hooks/useFilteredOrders'
import { useOrderActions } from '../hooks/useOrderActions'
import { useOrdersHydrationState } from '../hooks/useOrdersHydrationState'
import { useTabs } from '../hooks/useTabs'
import { ordersTableStateAtom } from '../state/ordersTableStateAtom'
import { OrdersTableParams } from '../types'
import { buildOrdersTableUrl } from '../utils/buildOrdersTableUrl'

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

/*
TODO:
- Tabs and filters should be combined here.
- The atom should subscribe to history changes and based on that and current filters, update the table orders (which are
  just the Redux orders, filtered).
- This means params like `isTwapTable` and `orderType` (which are correlated BTW) or the hooks useCurrentTab and useTabs
  are not needed.
- We also need a loading / indeterminate state (e.g. if URL tab is signing, we don't know if we have to redirect the user
  to a different tab until orders load).
- Why are we persisting every single order in localStorage?
*/

// todo will fix in the next pr

export function OrdersTableStateUpdater({
  orders: allOrders,
  orderType,
  searchTerm = '',
  historyStatusFilter,
  isTwapTable = false,
  displayOrdersOnlyForSafeApp = false,
  syncWithUrl = true,
}: OrdersTableStateUpdaterProps): ReactNode {
  const { chainId } = useWalletInfo()
  const navigate = useNavigate()
  const location = useLocation()
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const setOrdersTableState = useSetAtom(ordersTableStateAtom)

  const ordersTokens = useMemo(() => getOrdersInputTokens(allOrders), [allOrders])

  // TODO: Do we need this for all orders or only the ones on the current page?
  const balancesAndAllowances = useBalancesAndAllowances(ordersTokens)

  // TODO: Combine ordersList with filteredOrders params + pagination params to avoid processing orders that are not
  // going to be displayed in the current page.
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
      isTwapTable,
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
    isTwapTable,
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
