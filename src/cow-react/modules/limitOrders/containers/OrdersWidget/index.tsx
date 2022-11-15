import { Orders } from '../../pure/Orders'
import { OrderTab } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'
import { LimitOrdersList, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useMemo, useState } from 'react'
import { Order } from 'state/orders/actions'
import { useWeb3React } from '@web3-react/core'

const TABS: OrderTab[] = [
  {
    title: 'Open orders',
    count: 0,
  },
  {
    title: 'Orders history',
    count: 0,
  },
]

function getOrdersListByIndex(ordersList: LimitOrdersList, index: number): Order[] {
  return index === 0 ? ordersList.pending : ordersList.history
}

export function OrdersWidget() {
  const [activeTab, setActiveTab] = useState(0)
  const ordersList = useLimitOrdersList()
  const { account } = useWeb3React()

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, activeTab)
  }, [ordersList, activeTab])

  const tabs = useMemo(() => {
    return TABS.map((tab, index) => {
      return { ...tab, isActive: index === activeTab, count: getOrdersListByIndex(ordersList, index).length }
    })
  }, [activeTab, ordersList])

  const onTabChange = (tab: OrderTab, index: number) => {
    setActiveTab(index)
  }

  return <Orders onTabChange={onTabChange} tabs={tabs} orders={orders} isWalletConnected={!!account} />
}
