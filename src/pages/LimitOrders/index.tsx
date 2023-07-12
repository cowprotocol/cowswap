import { useAtomValue } from 'jotai/utils'

import { AppDataUpdater } from 'modules/appData'
import {
  LimitOrdersWidget,
  QuoteObserverUpdater,
  InitialPriceUpdater,
  ExecutionPriceUpdater,
  limitOrdersRawStateAtom,
  LIMIT_ORDER_SLIPPAGE,
} from 'modules/limitOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

export default function LimitOrderPage() {
  const { isUnlocked } = useAtomValue(limitOrdersRawStateAtom)

  return (
    <>
      <AppDataUpdater orderClass="limit" slippage={LIMIT_ORDER_SLIPPAGE} />
      <QuoteObserverUpdater />
      <InitialPriceUpdater />
      <ExecutionPriceUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <LimitOrdersWidget />
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
