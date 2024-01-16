import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrders } from 'legacy/state/orders/hooks'

import { AppDataUpdater } from 'modules/appData'
import {
  ExecutionPriceUpdater,
  FillLimitOrdersDerivedStateUpdater,
  InitialPriceUpdater,
  LIMIT_ORDER_SLIPPAGE,
  LimitOrdersWidget,
  QuoteObserverUpdater,
  SetupLimitOrderAmountsFromUrlUpdater,
  useIsWidgetUnlocked,
} from 'modules/limitOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import { TabOrderTypes } from 'modules/ordersTable/pure/OrdersTableContainer'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

export default function LimitOrderPage() {
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)

  const isUnlocked = useIsWidgetUnlocked()

  return (
    <>
      <AppDataUpdater orderClass="limit" slippage={LIMIT_ORDER_SLIPPAGE} />
      <QuoteObserverUpdater />
      <FillLimitOrdersDerivedStateUpdater />
      <SetupLimitOrderAmountsFromUrlUpdater />
      <InitialPriceUpdater />
      <ExecutionPriceUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <LimitOrdersWidget />
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget
            displayOrdersOnlyForSafeApp={false}
            orderType={TabOrderTypes.LIMIT}
            orders={allLimitOrders}
          />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
