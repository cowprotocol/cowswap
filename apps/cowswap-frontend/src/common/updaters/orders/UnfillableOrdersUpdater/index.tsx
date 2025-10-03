import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderToCheckFillability } from './types'
import { UnfillableOrderUpdater } from './updaters/UnfillableOrderUpdater'

interface UnfillableOrdersUpdaterProps {
  orders: OrderToCheckFillability[]
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater({ orders }: UnfillableOrdersUpdaterProps): ReactNode {
  const { chainId } = useWalletInfo()

  console.debug(`[UnfillableOrderUpdater] orders to update: ${orders.length}`, orders)

  return (
    <>
      {orders.map((order) => {
        return <UnfillableOrderUpdater key={order.id} chainId={chainId} order={order} />
      })}
    </>
  )
}
