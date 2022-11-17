import { Orders } from '../../pure/Orders'
import { OrderTab } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'
import { LimitOrdersList, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useCallback, useMemo, useState } from 'react'
import { Order } from 'state/orders/actions'
import { useWeb3React } from '@web3-react/core'
import { useHistory, useLocation } from 'react-router-dom'

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
const TAB_KEY = 'tab'

function getOrdersListByIndex(ordersList: LimitOrdersList, id: string): Order[] {
  return id === openTab.id ? ordersList.pending : ordersList.history
}

export function OrdersWidget() {
  const location = useLocation()
  const history = useHistory()
  const defaultTab = new URLSearchParams(location.search).get(TAB_KEY) || openTab.id
  const [activeTab, setActiveTab] = useState(defaultTab)
  const ordersList = useLimitOrdersList()
  const { account } = useWeb3React()

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, activeTab)
  }, [ordersList, activeTab])

  const tabs = useMemo(() => {
    return TABS.map((tab, index) => {
      return { ...tab, isActive: tab.id === activeTab, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [activeTab, ordersList])

  const onTabChange = useCallback(
    (tab: OrderTab) => {
      setActiveTab(tab.id)

      const query = new URLSearchParams(location.search)
      query.delete(TAB_KEY)
      query.append(TAB_KEY, tab.id)

      history.push(location.pathname + '?' + query)
    },
    [history, location]
  )

  return <Orders onTabChange={onTabChange} tabs={tabs} orders={orders} isWalletConnected={!!account} />
}
