import { useAtomValue } from 'jotai'

import { AdvancedOrdersWidget } from 'modules/advancedOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { TwapFormWidget } from 'modules/twap'
import { parsedTwapOrdersAtom } from 'modules/twap/state/twapOrdersListAtom'

export default function AdvancedOrdersPage() {
  const parsedTwapOrders = useAtomValue(parsedTwapOrdersAtom)

  return (
    <>
      {/*TODO: add isUnlocked value*/}
      <styledEl.PageWrapper isUnlocked={true}>
        <styledEl.PrimaryWrapper>
          <AdvancedOrdersWidget>
            {/*TODO: conditionally display a widget for current advanced order type*/}
            <TwapFormWidget />
          </AdvancedOrdersWidget>
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget customOrders={parsedTwapOrders} />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
