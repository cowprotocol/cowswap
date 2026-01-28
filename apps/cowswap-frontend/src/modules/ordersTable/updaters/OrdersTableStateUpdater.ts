import { useAtomValue, useSetAtom } from 'jotai/index'
import { ReactNode, useEffect, useMemo } from 'react'

import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { Order } from 'legacy/state/orders/actions'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useGetSpotPrice, usePendingOrdersPrices } from 'modules/orders'

import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useNavigate } from 'common/hooks/useNavigate'
import { usePendingActivitiesCount } from 'common/hooks/usePendingActivitiesCount'

import { OrderTabId } from '../const/tabs'
import { useOrdersTableList } from '../containers/OrdersTableWidget/hooks/useOrdersTableList'
import { useValidatePageUrlParams } from '../containers/OrdersTableWidget/hooks/useValidatePageUrlParams'
import { useCurrentTab } from '../hooks/useCurrentTab'
import { HistoryStatusFilter, useFilteredOrders } from '../hooks/useFilteredOrders'
import { useOrderActions } from '../hooks/useOrderActions'
import { useOrdersHydrationState } from '../hooks/useOrdersHydrationState'
import { useTabs } from '../hooks/useTabs'
import { ordersTableStateAtom } from '../state/ordersTableStateAtom'
import { OrdersTableParams } from '../ordersTable.types'
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

// todo will fix in the next pr
// eslint-disable-next-line max-lines-per-function
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
  const { allowsOffchainSigning } = useWalletDetails()
  const navigate = useNavigate()
  const location = useLocation()
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const pendingOrdersPrices = usePendingOrdersPrices()
  const setOrdersTableState = useSetAtom(ordersTableStateAtom)
  const selectedOrders = useAtomValue(ordersToCancelAtom)
  const getSpotPrice = useGetSpotPrice()
  const isSafeViaWc = useIsSafeViaWc()
  const injectedWidgetParams = useInjectedWidgetParams()
  const pendingActivitiesCount = usePendingActivitiesCount()

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
      isSafeViaWc,
      currentPageNumber,
      pendingOrdersPrices,
      balancesAndAllowances,
      orderActions,
      getSpotPrice,
      allowsOffchainSigning,
      orderType,
      injectedWidgetParams,
      isTwapTable,
      pendingActivitiesCount,
      selectedOrders,
      hasHydratedOrders,
    })
  }, [
    setOrdersTableState,
    tabs,
    orders,
    filteredOrders,
    currentTabId,
    displayOrdersOnlyForSafeApp,
    isSafeViaWc,
    currentPageNumber,
    pendingOrdersPrices,
    balancesAndAllowances,
    orderActions,
    getSpotPrice,
    allowsOffchainSigning,
    orderType,
    injectedWidgetParams,
    isTwapTable,
    pendingActivitiesCount,
    selectedOrders,
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
