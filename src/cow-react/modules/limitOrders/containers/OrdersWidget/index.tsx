import { Orders } from '../../pure/Orders'
import { LimitOrdersList, ParsedOrder, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OrdersReceiptModal } from '@cow/modules/limitOrders/containers/OrdersReceiptModal'
import { useBalancesAndAllowances } from '@cow/modules/tokens'
import { GP_VAULT_RELAYER } from 'constants/index'
import { buildLimitOrdersUrl, parseLimitOrdersPageParams } from '@cow/modules/limitOrders/utils/buildLimitOrdersUrl'
import { LIMIT_ORDERS_TABS, OPEN_TAB } from '@cow/modules/limitOrders/const/limitOrdersTabs'
import { useValidatePageUrlParams } from './hooks/useValidatePageUrlParams'
import { useCancelOrder } from '@cow/common/hooks/useCancelOrder'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { pendingOrdersPricesAtom } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import { useWalletInfo } from '@cow/modules/wallet'
import { useGetSpotPrice } from '@cow/modules/orders/state/spotPricesAtom'
import { useSelectReceiptOrder } from '@cow/modules/limitOrders/containers/OrdersReceiptModal/hooks'
import { LimitOrderActions } from '@cow/modules/limitOrders/pure/Orders/types'
import { Order } from 'state/orders/actions'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import styled from 'styled-components/macro'
import { MultipleCancellationMenu } from '@cow/modules/limitOrders/containers/OrdersWidget/MultipleCancellationMenu'
import { useInputTokensFromOrders } from '@cow/modules/orders'

function getOrdersListByIndex(ordersList: LimitOrdersList, id: string): ParsedOrder[] {
  return id === OPEN_TAB.id ? ordersList.pending : ordersList.history
}

function toggleOrderInCancellationList(state: Order[], order: Order): Order[] {
  const isOrderIncluded = state.find((item) => item.id === order.id)

  if (isOrderIncluded) {
    return state.filter((item) => item.id !== order.id)
  }

  return [...state, order]
}

const ContentWrapper = styled.div`
  width: 100%;
`

export function OrdersWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const ordersList = useLimitOrdersList()
  const { chainId, account } = useWalletInfo()
  const getShowCancellationModal = useCancelOrder()
  const pendingOrdersPrices = useAtomValue(pendingOrdersPricesAtom)
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useUpdateAtom(updateOrdersToCancelAtom)
  const getSpotPrice = useGetSpotPrice()
  const selectReceiptOrder = useSelectReceiptOrder()

  const spender = useMemo(() => (chainId ? GP_VAULT_RELAYER[chainId] : undefined), [chainId])

  const { currentTabId, currentPageNumber } = useMemo(() => {
    const params = parseLimitOrdersPageParams(location.search)

    return {
      currentTabId: params.tabId || OPEN_TAB.id,
      currentPageNumber: params.pageNumber || 1,
    }
  }, [location.search])

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, currentTabId)
  }, [ordersList, currentTabId])

  const tabs = useMemo(() => {
    return LIMIT_ORDERS_TABS.map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [currentTabId, ordersList])

  const isOpenOrdersTab = useMemo(() => OPEN_TAB.id === currentTabId, [currentTabId])

  // Get tokens from pending orders (only if the OPEN orders tab is opened)
  const tokens = useInputTokensFromOrders(isOpenOrdersTab ? ordersList.pending : [])

  // Get effective balance
  const balancesAndAllowances = useBalancesAndAllowances({ account, spender, tokens })

  const toggleOrdersForCancellation = useCallback(
    (orders: Order[]) => {
      updateOrdersToCancel(orders)
    },
    [updateOrdersToCancel]
  )

  const toggleOrderForCancellation = useCallback(
    (order: Order) => {
      updateOrdersToCancel(toggleOrderInCancellationList(ordersToCancel, order))
    },
    [ordersToCancel, updateOrdersToCancel]
  )

  const orderActions: LimitOrderActions = {
    getShowCancellationModal,
    selectReceiptOrder,
    toggleOrderForCancellation,
    toggleOrdersForCancellation,
  }

  // Set page params initially once
  useEffect(() => {
    navigate(buildLimitOrdersUrl(location, { pageNumber: currentPageNumber, tabId: currentTabId }), { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useValidatePageUrlParams(orders, currentTabId, currentPageNumber)

  return (
    <>
      <ContentWrapper>
        <Orders
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
        >
          {isOpenOrdersTab && orders.length && <MultipleCancellationMenu pendingOrders={orders} />}
        </Orders>
      </ContentWrapper>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
    </>
  )
}
