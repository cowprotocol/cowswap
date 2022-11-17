import { Orders } from '../../pure/Orders'
import { LIMIT_ORDERS_TAB_KEY, OrderTab } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'
import { LimitOrdersList, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useMemo } from 'react'
import { Order } from 'state/orders/actions'
import { useWeb3React } from '@web3-react/core'
import { useLocation } from 'react-router-dom'

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
  const ordersList = useLimitOrdersList()
  const { account } = useWeb3React()

  const currentTabId = useMemo(() => {
    return new URLSearchParams(location.search).get(LIMIT_ORDERS_TAB_KEY) || openTab.id
  }, [location.search])

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, currentTabId)
  }, [ordersList, currentTabId])

  const tabs = useMemo(() => {
    return TABS.map((tab, index) => {
      return { ...tab, isActive: tab.id === currentTabId, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [currentTabId, ordersList])

  return <Orders tabs={tabs} orders={orders} isWalletConnected={!!account} />
}
