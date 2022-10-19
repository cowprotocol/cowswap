import * as styledEl from './styled'

import { LimitOrdersWidget } from '@cow/modules/limitOrders/containers/LimitOrdersWidget'
import { Chart } from '@cow/modules/limitOrders/containers/Chart'
import { Orders } from '@cow/modules/limitOrders/containers/Orders'
import { InfoPopup } from '@cow/modules/limitOrders/pure/InfoPopup'
import { QuoteUpdater } from '@cow/modules/limitOrders/updaters/QuoteUpdater'

export default function LimitOrderPage() {
  return (
    <>
      <QuoteUpdater />
      <styledEl.PageWrapper>
        <styledEl.Column>
          <LimitOrdersWidget />
          <InfoPopup />
        </styledEl.Column>

        <styledEl.Column>
          <Chart />
          <Orders />
        </styledEl.Column>
      </styledEl.PageWrapper>
    </>
  )
}
