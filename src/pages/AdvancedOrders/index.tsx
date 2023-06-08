import { AdvancedOrdersWidget } from 'modules/advancedOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { TradeFormValidationUpdater } from 'modules/tradeFormValidation'
import { TwapFormWidget } from 'modules/twap'

export default function AdvancedOrdersPage() {
  return (
    <>
      {/*TODO: add isExpertMode value*/}
      <TradeFormValidationUpdater isExpertMode={false} />

      {/*TODO: add isUnlocked value*/}
      <styledEl.PageWrapper isUnlocked={true}>
        <styledEl.PrimaryWrapper>
          <AdvancedOrdersWidget>
            {/*TODO: conditionally display a widget for current advanced order type*/}
            <TwapFormWidget />
          </AdvancedOrdersWidget>
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
