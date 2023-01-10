import * as styledEl from './styled'
import {
  LimitOrdersWidget,
  QuoteUpdater,
  InfoPopup,
  MarketPriceUpdater,
  OrdersWidget,
  limitOrdersAtom,
} from '@cow/modules/limitOrders'
import { useAtomValue } from 'jotai/utils'

export default function LimitOrderPage() {
  const { isUnlocked } = useAtomValue(limitOrdersAtom)

  return (
    <>
      <QuoteUpdater />
      <MarketPriceUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <LimitOrdersWidget />
          {isUnlocked && <InfoPopup />}
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          {/*<ChartWidget />*/}
          <OrdersWidget />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
