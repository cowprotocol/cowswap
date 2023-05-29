import { useAtomValue } from 'jotai/utils'

import {
  LimitOrdersWidget,
  QuoteObserverUpdater,
  InitialPriceUpdater,
  ExecutionPriceUpdater,
  OrdersWidget,
  limitOrdersRawStateAtom,
} from 'modules/limitOrders'

import * as styledEl from './styled'

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
          {/*<ChartWidget />*/}
          <OrdersWidget />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
