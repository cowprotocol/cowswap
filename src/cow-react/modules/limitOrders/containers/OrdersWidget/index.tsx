import { Orders } from '../../pure/Orders'
import { LimitOrdersList, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Order } from 'state/orders/actions'
import { useWeb3React } from '@web3-react/core'
import { useHistory, useLocation } from 'react-router-dom'
import { useOrdersBalancesAndAllowances } from './hooks/useOrdersBalancesAndAllowances'
import { GP_VAULT_RELAYER } from 'constants/index'
import { CancellationModal, CancellationModalProps } from 'components/AccountDetails/Transaction/CancelationModal'
import { pendingOrderSummary } from '@cow/common/helpers/pendingOrderSummary'
import { buildLimitOrdersUrl, parseLimitOrdersPageParams } from '@cow/modules/limitOrders/utils/buildLimitOrdersUrl'
import { LIMIT_ORDERS_PAGE_SIZE, LIMIT_ORDERS_TABS, OPEN_TAB } from '@cow/modules/limitOrders/const/limitOrdersTabs'

function getOrdersListByIndex(ordersList: LimitOrdersList, id: string): Order[] {
  return id === OPEN_TAB.id ? ordersList.pending : ordersList.history
}

export function OrdersWidget() {
  const location = useLocation()
  const history = useHistory()
  const ordersList = useLimitOrdersList()
  const { chainId, account } = useWeb3React()

  const [cancelModalProps, setCancelModalProps] = useState<CancellationModalProps | null>(null)

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

  const isOpenOrdersTab = OPEN_TAB.id === currentTabId
  const pendingBalancesAndAllowances = useOrdersBalancesAndAllowances(
    // Request balances and allowances only for the open orders tab
    isOpenOrdersTab ? account : undefined,
    spender,
    ordersList.pending
  )

  const showOrderCancelationModal = useCallback(
    (order: Order) => {
      if (!chainId) return

      setCancelModalProps({
        isOpen: true,
        chainId,
        orderId: order.id,
        summary: pendingOrderSummary(order),
        onDismiss() {
          setCancelModalProps(null)
        },
      })
    },
    [chainId]
  )

  // Set page params initially once
  useEffect(() => {
    history.push(buildLimitOrdersUrl(location, { pageNumber: currentPageNumber, tabId: currentTabId }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset pageNumber to max if it's out of total pages count
  useEffect(() => {
    const pagesCount = Math.ceil(orders.length / LIMIT_ORDERS_PAGE_SIZE)

    if (currentPageNumber > pagesCount) {
      history.push(buildLimitOrdersUrl(location, { pageNumber: pagesCount }))
    }
  }, [history, location, currentPageNumber, orders.length])

  return (
    <>
      <Orders
        chainId={chainId}
        tabs={tabs}
        orders={orders}
        currentPageNumber={currentPageNumber}
        balancesAndAllowances={pendingBalancesAndAllowances}
        isWalletConnected={!!account}
        showOrderCancelationModal={showOrderCancelationModal}
      />
      {cancelModalProps && <CancellationModal {...cancelModalProps} />}
    </>
  )
}
