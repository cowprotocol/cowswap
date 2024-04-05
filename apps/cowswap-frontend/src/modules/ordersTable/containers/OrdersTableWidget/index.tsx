import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { useTokensAllowances, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { pendingOrdersPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'
import { useGetSpotPrice } from 'modules/orders/state/spotPricesAtom'
import { PendingPermitUpdater, useGetOrdersPermitStatus } from 'modules/permit'

import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useGetOrdersToCheckPendingPermit } from './hooks/useGetOrdersToCheckPendingPermit'
import { OrdersTableList, useOrdersTableList } from './hooks/useOrdersTableList'
import { useOrdersTableTokenApprove } from './hooks/useOrdersTableTokenApprove'
import { useValidatePageUrlParams } from './hooks/useValidatePageUrlParams'

import { BalancesAndAllowances } from '../../../tokens'
import { OPEN_TAB, ORDERS_TABLE_TABS } from '../../const/tabs'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrderActions } from '../../pure/OrdersTableContainer/types'
import { TabOrderTypes } from '../../types'
import { buildOrdersTableUrl } from '../../utils/buildOrdersTableUrl'
import { OrderTableItem, tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { parseOrdersTableUrl } from '../../utils/parseOrdersTableUrl'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'
import { useGetAlternativeOrderModalContextCallback, useSelectReceiptOrder } from '../OrdersReceiptModal/hooks'

function getOrdersListByIndex(ordersList: OrdersTableList, id: string): OrderTableItem[] {
  return id === OPEN_TAB.id ? ordersList.pending : ordersList.history
}

function toggleOrderInCancellationList(state: CancellableOrder[], order: CancellableOrder): CancellableOrder[] {
  const isOrderIncluded = state.find((item) => item.id === order.id)

  if (isOrderIncluded) {
    return state.filter((item) => item.id !== order.id)
  }

  return [...state, order]
}

const ContentWrapper = styled.div`
  width: 100%;
`

interface OrdersTableWidgetProps {
  displayOrdersOnlyForSafeApp: boolean
  orders: Order[]
  orderType: TabOrderTypes
}

export function OrdersTableWidget({
  orders: allOrders,
  orderType,
  displayOrdersOnlyForSafeApp,
}: OrdersTableWidgetProps) {
  const { chainId, account } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()
  const cancelOrder = useCancelOrder()
  const ordersList = useOrdersTableList(allOrders, orderType)
  const { allowsOffchainSigning } = useWalletDetails()
  const pendingOrdersPrices = useAtomValue(pendingOrdersPricesAtom)
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const getSpotPrice = useGetSpotPrice()
  const selectReceiptOrder = useSelectReceiptOrder()
  const isSafeViaWc = useIsSafeViaWc()
  const ordersPermitStatus = useGetOrdersPermitStatus()
  const injectedWidgetParams = useInjectedWidgetParams()

  const { currentTabId, currentPageNumber } = useMemo(() => {
    const params = parseOrdersTableUrl(location.search)

    return {
      currentTabId: params.tabId || OPEN_TAB.id,
      currentPageNumber: params.pageNumber || 1,
    }
  }, [location.search])

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, currentTabId)
  }, [ordersList, currentTabId])

  const tabs = useMemo(() => {
    return ORDERS_TABLE_TABS.map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [currentTabId, ordersList])

  const isOpenOrdersTab = useMemo(() => OPEN_TAB.id === currentTabId, [currentTabId])

  const balancesState = useTokensBalances()
  const allowancesState = useTokensAllowances()

  const balancesAndAllowances: BalancesAndAllowances = useMemo(() => {
    const { isLoading: balancesLoading, values: balances } = balancesState
    const { isLoading: allowancesLoading, values: allowances } = allowancesState
    return {
      isLoading: balancesLoading || allowancesLoading,
      balances,
      allowances,
    }
  }, [balancesState, allowancesState])

  const { pendingActivity } = useCategorizeRecentActivity()

  const toggleOrdersForCancellation = useCallback(
    (orders: ParsedOrder[]) => {
      updateOrdersToCancel(orders)
    },
    [updateOrdersToCancel]
  )

  const toggleOrderForCancellation = useCallback(
    (order: ParsedOrder) => {
      updateOrdersToCancel(toggleOrderInCancellationList(ordersToCancel, order))
    },
    [ordersToCancel, updateOrdersToCancel]
  )

  const getShowCancellationModal = useCallback(
    (order: ParsedOrder) => {
      const rawOrder = allOrders.find((item) => item.id === order.id)

      return rawOrder ? cancelOrder(rawOrder) : null
    },
    [allOrders, cancelOrder]
  )

  const getAlternativeOrderModalContext = useGetAlternativeOrderModalContextCallback()

  const approveOrderToken = useOrdersTableTokenApprove()

  const orderActions: OrderActions = {
    getShowCancellationModal,
    getAlternativeOrderModalContext,
    selectReceiptOrder,
    toggleOrderForCancellation,
    toggleOrdersForCancellation,
    approveOrderToken,
  }

  // Set page params initially once
  useEffect(() => {
    navigate(buildOrdersTableUrl(location, { pageNumber: currentPageNumber, tabId: currentTabId }), { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useValidatePageUrlParams(orders.length, currentTabId, currentPageNumber)

  const ordersToCheckPendingPermit = useGetOrdersToCheckPendingPermit(ordersList, chainId, balancesAndAllowances)

  return (
    <>
      <PendingPermitUpdater orders={ordersToCheckPendingPermit} />
      <ContentWrapper>
        <OrdersTableContainer
          chainId={chainId}
          tabs={tabs}
          orders={orders}
          displayOrdersOnlyForSafeApp={displayOrdersOnlyForSafeApp}
          isSafeViaWc={isSafeViaWc}
          isOpenOrdersTab={isOpenOrdersTab}
          currentPageNumber={currentPageNumber}
          pendingOrdersPrices={pendingOrdersPrices}
          balancesAndAllowances={balancesAndAllowances}
          isWalletConnected={!!account}
          orderActions={orderActions}
          getSpotPrice={getSpotPrice}
          selectedOrders={ordersToCancel}
          allowsOffchainSigning={allowsOffchainSigning}
          orderType={orderType}
          pendingActivities={pendingActivity}
          ordersPermitStatus={ordersPermitStatus}
          injectedWidgetParams={injectedWidgetParams}
        >
          {isOpenOrdersTab && orders.length && <MultipleCancellationMenu pendingOrders={tableItemsToOrders(orders)} />}
        </OrdersTableContainer>
      </ContentWrapper>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
    </>
  )
}
