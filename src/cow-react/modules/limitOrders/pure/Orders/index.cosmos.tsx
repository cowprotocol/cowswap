import { Orders } from './index'
import { OrderTab } from './OrdersTabs'
import { ordersMock } from './orders.mock'
import { BalancesAndAllowances } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useOrdersBalancesAndAllowances'

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

// TODO: set values
const balancesAndAllowances: BalancesAndAllowances = {
  balances: {},
  allowances: {},
}

export default (
  <Orders
    chainId={1}
    currentPageNumber={1}
    orders={ordersMock}
    tabs={tabs}
    isSmartContractWallet={false}
    isOpenOrdersTab={true}
    isWalletConnected={true}
    balancesAndAllowances={balancesAndAllowances}
    showOrderCancelationModal={() => console.log('showOrderCancelationModal')}
  />
)
