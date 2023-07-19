import { OrderActions } from 'modules/ordersTable/pure/OrdersTableContainer/types'
import { BalancesAndAllowances } from 'modules/tokens'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { ordersMock } from './orders.mock'

import { OrdersTableContainer, TabOrderTypes } from './index'

import { OrderTab } from '../../const/tabs'

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
  isLoading: false,
}

const orderActions: OrderActions = {
  getShowCancellationModal: (order) => {
    if (order.status === 'pending') {
      return () => alert('cancelling!')
    }
    return null
  },
  selectReceiptOrder(order: ParsedOrder) {
    console.log('selectReceiptOrder', order)
  },
  toggleOrderForCancellation(order) {
    console.log('toggleOrderForCancellation', order)
  },
  toggleOrdersForCancellation() {
    console.log('toggleAllOrdersForCancellation')
  },
}

export default (
  <OrdersTableContainer
    pendingOrdersPrices={{}}
    chainId={1}
    currentPageNumber={1}
    orders={ordersMock}
    tabs={tabs}
    allowsOffchainSigning={true}
    isOpenOrdersTab={true}
    isWalletConnected={true}
    selectedOrders={[]}
    balancesAndAllowances={balancesAndAllowances}
    getSpotPrice={() => null}
    orderActions={orderActions}
    orderType={TabOrderTypes.LIMIT}
  />
)
