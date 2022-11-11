import { Orders } from '../../pure/Orders'
import { OrderTab } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'

const tabs: OrderTab[] = [
  {
    title: 'Open orders',
    count: 5,
  },
  {
    title: 'Orders history',
    count: 0,
  },
]

export function OrdersWidget() {
  const onTabChange = () => {
    console.log('tab changed')
  }

  return <Orders onTabChange={onTabChange} tabs={tabs} />
}
