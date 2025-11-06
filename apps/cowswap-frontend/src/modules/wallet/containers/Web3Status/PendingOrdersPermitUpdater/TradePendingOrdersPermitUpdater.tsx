import { ReactNode } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { PendingOrdersPermitUpdater } from 'modules/ordersTable'
import { TradeType } from 'modules/trade'

export function TradePendingOrdersPermitUpdater(): ReactNode {
  return <PendingOrdersPermitUpdater orderClass={OrderClass.MARKET} tradeType={TradeType.SWAP} />
}

