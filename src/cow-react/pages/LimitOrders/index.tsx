import * as styledEl from './styled'

import { LimitOrdersWidget } from 'cow-react/modules/limitOrders/containers/LimitOrdersWidget'
import { Chart } from 'cow-react/modules/limitOrders/containers/Chart'
import { Orders } from 'cow-react/modules/limitOrders/containers/Orders'
import { InfoPopup } from 'cow-react/modules/limitOrders/pure/InfoPopup'

export default function LimitOrderPage() {
  return (
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
  )
}
