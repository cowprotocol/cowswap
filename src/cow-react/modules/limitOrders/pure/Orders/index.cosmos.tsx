import { Orders } from './index'
import { OrderTab } from './OrdersTabs'
import { ordersMock } from './orders.mock'
import { EffectiveBalances } from '@cow/modules/tokens'

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
const effectiveBalances: EffectiveBalances = {
  balances: {},
  allowances: {},
  isLoading: false,
}

export default (
  <Orders
    pendingOrdersPrices={{}}
    chainId={1}
    currentPageNumber={1}
    orders={ordersMock}
    tabs={tabs}
    isOpenOrdersTab={true}
    isWalletConnected={true}
    effectiveBalances={effectiveBalances}
    getSpotPrice={() => null}
    getShowCancellationModal={(order) => {
      if (order.status === 'pending') {
        return () => alert('cancelling!')
      }
      return null
    }}
  />
)
