import { Orders } from './index'
import { OrderTab } from './OrdersTabs'
import { ordersMock } from './orders.mock'

const tabs: OrderTab[] = [
  {
    id: 'open',
    title: 'Open orders',
    count: 5,
  },
  {
    id: 'history',
    title: 'Orders history',
    count: 0,
    isActive: false,
  },
]

export default <Orders orders={ordersMock} tabs={tabs} isWalletConnected={true} />
