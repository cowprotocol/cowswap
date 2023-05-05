import * as styledEl from './styled'
import {
  LimitOrdersWidget,
  MarketPriceUpdater,
  InitialPriceUpdater,
  ExecutionPriceUpdater,
  OrdersWidget,
  limitOrdersRawStateAtom,
} from '@cow/modules/limitOrders'
import { useAtomValue } from 'jotai/utils'

export default function LimitOrderPage() {
  const { isUnlocked } = useAtomValue(limitOrdersRawStateAtom)

  return (
    <>
      <MarketPriceUpdater />
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
