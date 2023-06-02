import { AdvancedOrdersWidget } from 'modules/advancedOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

export default function AdvancedOrdersPage() {
  return (
    <>
      {/*TODO: add isUnlocked value*/}
      <styledEl.PageWrapper isUnlocked={true}>
        <styledEl.PrimaryWrapper>
          <AdvancedOrdersWidget />
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
