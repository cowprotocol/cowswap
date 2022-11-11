import * as styledEl from './styled'

import {
  LimitOrdersWidget,
  QuoteUpdater,
  InfoPopup,
  MarketPriceUpdater,
  ActiveRateUpdater,
  OrdersWidget,
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

        {/*TODO: temporary hidden right part of the page until it's ready*/}
        <styledEl.Column>
          {/*  <ChartWidget />*/}
          <OrdersWidget />
        </styledEl.Column>
      </styledEl.PageWrapper>
    </>
  )
}
