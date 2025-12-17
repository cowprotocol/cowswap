import { ReactNode } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { OrdersPermitUpdater, usePendingOrdersFillability } from 'modules/ordersTable'
import { TradeType } from 'modules/trade'

import { GenericOrder } from 'common/types'

export function TradeOrdersPermitUpdater(): ReactNode {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const orders = Object.values(pendingOrdersFillability)
    .map((fillability) => fillability?.order)
    .filter((order): order is GenericOrder => !!order)

  return <OrdersPermitUpdater orders={orders} tradeType={TradeType.SWAP} />
}
