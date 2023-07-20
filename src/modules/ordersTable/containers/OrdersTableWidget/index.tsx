import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'

import { GP_VAULT_RELAYER } from 'legacy/constants'
import { Order } from 'legacy/state/orders/actions'

import { pendingOrdersPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'
import { useGetSpotPrice } from 'modules/orders/state/spotPricesAtom'
import { OPEN_TAB, ORDERS_TABLE_TABS } from 'modules/ordersTable/const/tabs'
import { MultipleCancellationMenu } from 'modules/ordersTable/containers/MultipleCancellationMenu'
import { OrdersReceiptModal } from 'modules/ordersTable/containers/OrdersReceiptModal'
import { useSelectReceiptOrder } from 'modules/ordersTable/containers/OrdersReceiptModal/hooks'
import { OrderActions } from 'modules/ordersTable/pure/OrdersTableContainer/types'
import { buildOrdersTableUrl, parseOrdersTableUrl } from 'modules/ordersTable/utils/buildOrdersTableUrl'
import { useBalancesAndAllowances } from 'modules/tokens'
import { useWalletDetails, useWalletInfo } from 'modules/wallet'

import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { OrdersTableList, useOrdersTableList } from './hooks/useOrdersTableList'
import { useValidatePageUrlParams } from './hooks/useValidatePageUrlParams'

import { OrdersTableContainer, TabOrderTypes } from '../../pure/OrdersTableContainer'
import { getParsedOrderFromItem, OrderTableItem, tableItemsToOrders } from '../../utils/orderTableGroupUtils'

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

export interface OrdersTableWidgetProps {
  orders: Order[]
  orderType: TabOrderTypes
}

export function OrdersTableWidget({ orders: allOrders, orderType }: OrdersTableWidgetProps) {
  const { chainId, account } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()
  const cancelOrder = useCancelOrder()
  const ordersList = useOrdersTableList(allOrders)
  const { allowsOffchainSigning } = useWalletDetails()
  const pendingOrdersPrices = useAtomValue(pendingOrdersPricesAtom)
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const getSpotPrice = useGetSpotPrice()
  const selectReceiptOrder = useSelectReceiptOrder()

  const spender = useMemo(() => (chainId ? GP_VAULT_RELAYER[chainId] : undefined), [chainId])

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

  // Get tokens from pending orders (only if the OPEN orders tab is opened)
  const tokens = useMemo(() => {
    const pendingOrders = isOpenOrdersTab ? ordersList.pending : []

    return pendingOrders.map((item) => getParsedOrderFromItem(item).inputToken)
  }, [isOpenOrdersTab, ordersList.pending])

  // Get effective balance
  const balancesAndAllowances = useBalancesAndAllowances({ account, spender, tokens })

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

  const orderActions: OrderActions = {
    getShowCancellationModal,
    selectReceiptOrder,
    toggleOrderForCancellation,
    toggleOrdersForCancellation,
  }

  // Set page params initially once
  useEffect(() => {
    navigate(buildOrdersTableUrl(location, { pageNumber: currentPageNumber, tabId: currentTabId }), { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useValidatePageUrlParams(orders.length, currentTabId, currentPageNumber)

  return (
    <>
      <ContentWrapper>
        <OrdersTableContainer
          chainId={chainId}
          tabs={tabs}
          orders={orders}
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
        >
          {isOpenOrdersTab && orders.length && <MultipleCancellationMenu pendingOrders={tableItemsToOrders(orders)} />}
        </OrdersTableContainer>
      </ContentWrapper>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
    </>
  )
}
