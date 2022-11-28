import { Orders } from '../../pure/Orders'
import { LIMIT_ORDERS_TAB_KEY, buildLimitOrdersTabUrl, OrderTab } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'
import { LimitOrdersList, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Order } from 'state/orders/actions'
import { useWeb3React } from '@web3-react/core'
import { useHistory, useLocation } from 'react-router-dom'
import { useOrdersBalancesAndAllowances } from './hooks/useOrdersBalancesAndAllowances'
import { GP_VAULT_RELAYER } from 'constants/index'
import { CancellationModal, CancellationModalProps } from 'components/AccountDetails/Transaction/CancelationModal'
import { pendingOrderSummary } from '@cow/common/helpers/pendingOrderSummary'

const openTab: OrderTab = {
  id: 'open',
  title: 'Open orders',
  count: 0,
}
const historyTab: OrderTab = {
  id: 'history',
  title: 'Orders history',
  count: 0,
}
const TABS: OrderTab[] = [openTab, historyTab]

function getOrdersListByIndex(ordersList: LimitOrdersList, id: string): Order[] {
  return id === openTab.id ? ordersList.pending : ordersList.history
}

export function OrdersWidget() {
  const location = useLocation()
  const history = useHistory()
  const ordersList = useLimitOrdersList()
  const { chainId, account } = useWeb3React()

  const [cancelModalProps, setCancelModalProps] = useState<CancellationModalProps | null>(null)

  const spender = useMemo(() => (chainId ? GP_VAULT_RELAYER[chainId] : undefined), [chainId])

  const currentTabId = useMemo(() => {
    return new URLSearchParams(location.search).get(LIMIT_ORDERS_TAB_KEY) || openTab.id
  }, [location.search])

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, currentTabId)
  }, [ordersList, currentTabId])

  const tabs = useMemo(() => {
    return TABS.map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [currentTabId, ordersList])

  const isOpenOrdersTab = openTab.id === currentTabId
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

  useEffect(() => {
    history.push(buildLimitOrdersTabUrl(location.pathname, location.search, currentTabId))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Orders
        chainId={chainId}
        tabs={tabs}
        orders={orders}
        isOpenOrdersTab={isOpenOrdersTab}
        balancesAndAllowances={pendingBalancesAndAllowances}
        isWalletConnected={!!account}
        showOrderCancelationModal={showOrderCancelationModal}
      />
      {cancelModalProps && <CancellationModal {...cancelModalProps} />}
    </>
  )
}
