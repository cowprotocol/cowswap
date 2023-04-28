import { Orders } from './index'
import { OrderTab } from './OrdersTabs'
import { ordersMock } from './orders.mock'
import { BalancesAndAllowances } from '@cow/modules/tokens'
import { LimitOrderActions } from '@cow/modules/limitOrders/pure/Orders/types'
import { UID } from '@cowprotocol/cow-sdk'

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

const orderActions: LimitOrderActions = {
  getShowCancellationModal: (order) => {
    if (order.status === 'pending') {
      return () => alert('cancelling!')
    }
    return null
  },
  selectReceiptOrder(orderUid: UID) {
    console.log('selectReceiptOrder', orderUid)
  },
  toggleOrderForCancellation(order) {
    console.log('toggleOrderForCancellation', order)
  },
  toggleOrdersForCancellation() {
    console.log('toggleAllOrdersForCancellation')
  },
}

export default (
  <Orders
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
  />
)
