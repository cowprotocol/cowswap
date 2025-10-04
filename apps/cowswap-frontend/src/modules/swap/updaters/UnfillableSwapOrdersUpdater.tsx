import { ReactNode } from 'react'

import { OrderClass } from '@cowprotocol/sdk-order-book'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { UnfillableOrdersUpdater } from 'common/updaters/orders'

// update last 10 pending swap orders
const PENDING_ORDERS_PAGE_SIZE = 10

export function UnfillableSwapOrdersUpdater(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const allPendingOrders = useOnlyPendingOrders(chainId, account)
  const swapPendingOrders = allPendingOrders
    .filter((order) => order.class === OrderClass.MARKET)
    .slice(0, PENDING_ORDERS_PAGE_SIZE)

  return <UnfillableOrdersUpdater orders={swapPendingOrders} />
}
