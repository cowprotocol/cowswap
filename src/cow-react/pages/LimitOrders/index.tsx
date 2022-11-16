import * as styledEl from './styled'
import {
  LimitOrdersWidget,
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
        <styledEl.PrimaryWrapper>
          <LimitOrdersWidget />
          <InfoPopup />
        </styledEl.PrimaryWrapper>

        {/*TODO: temporary hidden right part of the page until it's ready*/}
        <styledEl.SecondaryWrapper>
          {/* <ChartWidget />
          <Orders />*/}
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
