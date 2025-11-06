import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

// todo move this component to orders module
import { TradeType } from 'modules/trade'
import { OrderPermitUpdater } from 'modules/wallet/containers/Web3Status/PendingOrdersPermitUpdater/OrderPermitUpdater'

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
        return (
          <>
            <UnfillableOrderUpdater key={order.id} chainId={chainId} order={order} />
            <OrderPermitUpdater key={order.id} order={order} tradeType={TradeType.LIMIT_ORDER} />
          </>
        )
      })}
    </>
  )
}
