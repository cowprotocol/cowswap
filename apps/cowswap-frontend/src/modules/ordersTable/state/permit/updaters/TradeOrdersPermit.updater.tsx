import { ReactNode } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'

import { GenericOrder } from 'common/types'

import { OrdersPermitUpdater } from './OrdersPermit.updater'

import { usePendingOrdersFillability } from '../../../hooks/usePendingOrdersFillability'

export function TradeOrdersPermitUpdater(): ReactNode {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const orders = Object.values(pendingOrdersFillability)
    .map((fillability) => fillability?.order)
    .filter((order): order is GenericOrder => !!order)

  return <OrdersPermitUpdater orders={orders} tradeType={TradeType.SWAP} />
}
