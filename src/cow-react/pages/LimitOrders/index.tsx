import * as styledEl from './styled'

import {
  LimitOrdersWidget,
  QuoteUpdater,
  InfoPopup,
  MarketPriceUpdater,
  ActiveRateUpdater,
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
      <ActiveRateUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.Column>
          <LimitOrdersWidget />
          {isUnlocked && <InfoPopup />}
        </styledEl.Column>

        {/*TODO: temporary hidden right part of the page until it's ready*/}
        <styledEl.Column>
          {/*  <ChartWidget />*/}
          <OrdersWidget />
        </styledEl.Column>
      </styledEl.PageWrapper>
    </>
  )
}
