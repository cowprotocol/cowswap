import { useAtomValue } from 'jotai/utils'

import {
  LimitOrdersWidget,
  QuoteObserverUpdater,
  InitialPriceUpdater,
  ExecutionPriceUpdater,
  limitOrdersRawStateAtom,
} from 'modules/limitOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

export default function LimitOrderPage() {
  const { isUnlocked } = useAtomValue(limitOrdersRawStateAtom)

  return (
    <>
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
