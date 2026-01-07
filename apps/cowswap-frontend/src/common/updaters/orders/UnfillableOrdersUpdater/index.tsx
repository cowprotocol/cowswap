import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { GenericOrder } from 'common/types'

import { LastTimePriceUpdateResetUpdater } from './updaters/LastTimePriceUpdateResetUpdater'
import { UnfillableOrderUpdater } from './updaters/UnfillableOrderUpdater'

export { LastTimePriceUpdateResetUpdater }

interface UnfillableOrdersUpdaterProps {
  orders: GenericOrder[]
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater({ orders }: UnfillableOrdersUpdaterProps): ReactNode {
  const { chainId } = useWalletInfo()

  return (
    <>
      {orders.map((order) => {
        return <UnfillableOrderUpdater key={order.id} chainId={chainId} order={order} />
      })}
    </>
  )
}
