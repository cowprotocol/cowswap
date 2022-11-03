import * as styledEl from './styled'

import { LimitOrdersWidget } from '@cow/modules/limitOrders/containers/LimitOrdersWidget'
import { ChartWidget } from '@cow/modules/limitOrders/containers/ChartWidget'
import { Orders } from '@cow/modules/limitOrders/containers/Orders'
import { InfoPopup } from '@cow/modules/limitOrders/pure/InfoPopup'
import { QuoteUpdater } from '@cow/modules/limitOrders/updaters/QuoteUpdater'
import { InitialPriceUpdater } from '@cow/modules/limitOrders/updaters/InitialPriceUpdater'
import { ActiveRateUpdater } from '@cow/modules/limitOrders/updaters/ActiveRateUpdater'

export default function LimitOrderPage() {
  return (
    <>
      <QuoteUpdater />
      <InitialPriceUpdater />
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
