import { ReactNode } from 'react'

import { TradeType } from 'modules/trade'

import { GenericOrder } from 'common/types'

import { OrdersPermitUpdater } from './OrdersPermit.updater'

type LimitOrdersPermitUpdaterProps = {
  orders: GenericOrder[]
}

export function LimitOrdersPermitUpdater({ orders }: LimitOrdersPermitUpdaterProps): ReactNode {
  return <OrdersPermitUpdater orders={orders} tradeType={TradeType.LIMIT_ORDER} />
}
