import { Orders } from '../../pure/Orders'
import { LimitOrdersList, ParsedOrder, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OrdersReceiptModal } from '@cow/modules/limitOrders/containers/OrdersReceiptModal'
import { useOrdersBalancesAndAllowances } from './hooks/useOrdersBalancesAndAllowances'
import { GP_VAULT_RELAYER } from 'constants/index'
import { buildLimitOrdersUrl, parseLimitOrdersPageParams } from '@cow/modules/limitOrders/utils/buildLimitOrdersUrl'
import { LIMIT_ORDERS_TABS, OPEN_TAB } from '@cow/modules/limitOrders/const/limitOrdersTabs'
import { useValidatePageUrlParams } from './hooks/useValidatePageUrlParams'
import { useCancelOrder } from '@cow/common/hooks/useCancelOrder'
import { useAtomValue } from 'jotai/utils'
import { pendingOrdersPricesAtom } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import { useWalletInfo } from '@cow/modules/wallet'
import { useGetSpotPrice } from '@cow/modules/orders/state/spotPricesAtom'
import { useSelectReceiptOrder } from '@cow/modules/limitOrders/containers/OrdersReceiptModal/hooks'
import { LimitOrderActions } from '@cow/modules/limitOrders/pure/Orders/types'
import { Order } from 'state/orders/actions'
import { ordersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import styled from 'styled-components/macro'
import { useAtom } from 'jotai'
import { MultipleCancellationMenu } from '@cow/modules/limitOrders/containers/OrdersWidget/MultipleCancellationMenu'

function getOrdersListByIndex(ordersList: LimitOrdersList, id: string): ParsedOrder[] {
  return id === OPEN_TAB.id ? ordersList.pending : ordersList.history
}

function toggleOrderForCancellation(state: Order[], order: Order): Order[] {
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
  const [ordersToCancel, setOrdersToCancel] = useAtom(ordersToCancelAtom)
  const getSpotPrice = useGetSpotPrice()
  const selectReceiptOrder = useSelectReceiptOrder()

  const isRowSelectable = ordersToCancel !== null

  const orderActions: LimitOrderActions = {
    getShowCancellationModal,
    selectReceiptOrder,
    toggleOrderForCancellation(order: Order) {
      if (!ordersToCancel) return

      setOrdersToCancel(toggleOrderForCancellation(ordersToCancel, order))
    },
  }

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
  const pendingBalancesAndAllowances = useOrdersBalancesAndAllowances(
    // Request balances and allowances only for the open orders tab
    isOpenOrdersTab ? account : undefined,
    spender,
    ordersList.pending
  )

  // Set page params initially once
  useEffect(() => {
    navigate(buildLimitOrdersUrl(location, { pageNumber: currentPageNumber, tabId: currentTabId }), { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useValidatePageUrlParams(orders, currentTabId, currentPageNumber)

  return (
    <>
      <ContentWrapper>
        <MultipleCancellationMenu pendingOrders={ordersList.pending} />
        <Orders
          chainId={chainId}
          tabs={tabs}
          orders={orders}
          isOpenOrdersTab={isOpenOrdersTab}
          currentPageNumber={currentPageNumber}
          pendingOrdersPrices={pendingOrdersPrices}
          balancesAndAllowances={pendingBalancesAndAllowances}
          isWalletConnected={!!account}
          orderActions={orderActions}
          getSpotPrice={getSpotPrice}
          isRowSelectable={isRowSelectable}
        ></Orders>
      </ContentWrapper>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
    </>
  )
}
