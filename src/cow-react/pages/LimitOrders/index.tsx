import * as styledEl from './styled'

import { LimitOrdersWidget } from 'cow-react/modules/limitOrders/containers/LimitOrdersWidget'
import { Chart } from 'cow-react/modules/limitOrders/containers/Chart'
import { Orders } from 'cow-react/modules/limitOrders/containers/Orders'
import { InfoPopup } from 'cow-react/modules/limitOrders/pure/InfoPopup'
import { QuoteResolver } from 'cow-react/modules/limitOrders/containers/QuoteResolver'

export default function LimitOrderPage() {
  return (
    <>
      <QuoteResolver />
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
