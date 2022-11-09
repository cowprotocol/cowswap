import * as styledEl from './styled'

import {
  LimitOrdersWidget,
  ChartWidget,
  Orders,
  QuoteUpdater,
  InfoPopup,
  MarketPriceUpdater,
  ActiveRateUpdater,
} from '@cow/modules/limitOrders'

export default function LimitOrderPage() {
  return (
    <>
      <QuoteUpdater />
      <MarketPriceUpdater />
      <ActiveRateUpdater />
      <styledEl.PageWrapper>
        <styledEl.Column>
          <LimitOrdersWidget />
          <InfoPopup />
        </styledEl.Column>

        <styledEl.Column>
          <ChartWidget />
          <Orders />
        </styledEl.Column>
      </styledEl.PageWrapper>
    </>
  )
}
