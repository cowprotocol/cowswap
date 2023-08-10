import { useAtomValue } from 'jotai'

import { Navigate } from 'react-router-dom'

import { AdvancedOrdersWidget, advancedOrdersAtom, FillAdvancedOrdersDerivedStateUpdater } from 'modules/advancedOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import { TabOrderTypes } from 'modules/ordersTable/pure/OrdersTableContainer'
import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { TwapFormWidget, useAllEmulatedOrders, TwapUpdaters } from 'modules/twap'

import { Routes as RoutesEnum } from 'common/constants/routes'
import { useIsAdvancedOrdersEnabled } from 'common/hooks/useIsAdvancedOrdersEnabled'

export default function AdvancedOrdersPage() {
  const isAdvancedOrdersEnabled = useIsAdvancedOrdersEnabled()
  const tradeContext = useTradeRouteContext()
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)

  const allEmulatedOrders = useAllEmulatedOrders()

  if (isAdvancedOrdersEnabled === undefined) {
    return null
  }

  if (!isAdvancedOrdersEnabled) {
    // To prevent direct access when the flag is off
    return <Navigate to={parameterizeTradeRoute(tradeContext, RoutesEnum.SWAP)} />
  }

  return (
    <>
      <FillAdvancedOrdersDerivedStateUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <AdvancedOrdersWidget updaters={<TwapUpdaters />}>
            {/*TODO: conditionally display a widget for current advanced order type*/}
            <TwapFormWidget />
          </AdvancedOrdersWidget>
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget
            displayOrdersOnlyForSafeApp={true}
            orderType={TabOrderTypes.ADVANCED}
            orders={allEmulatedOrders}
          />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
