import { Orders } from './index'
import { OrderTab } from './OrdersTabs'
import { ordersMock } from './orders.mock'

const tabs: OrderTab[] = [
  {
    title: 'Open orders',
    count: 5,
  },
  {
    title: 'Orders history',
    count: 0,
    isActive: false,
  },
]

export default <Orders orders={ordersMock} tabs={tabs} onTabChange={() => void 0} />
