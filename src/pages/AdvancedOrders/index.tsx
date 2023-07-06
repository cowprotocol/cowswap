import { Navigate } from 'react-router-dom'

import { AdvancedOrdersWidget } from 'modules/advancedOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { TwapFormWidget } from 'modules/twap'

import { Routes as RoutesEnum } from 'common/constants/routes'
import { useIsAdvancedOrdersEnabled } from 'common/hooks/useIsAdvancedOrdersEnabled'

export default function AdvancedOrdersPage() {
  const isAdvancedOrdersEnabled = useIsAdvancedOrdersEnabled()
  const tradeContext = useTradeRouteContext()

  if (!isAdvancedOrdersEnabled) {
    // To prevent direct access when the flag is off
    return <Navigate to={parameterizeTradeRoute(tradeContext, RoutesEnum.SWAP)} />
  }

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
          <OrdersTableWidget />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
