import { useAtomValue } from 'jotai/utils'

import { AppDataUpdater } from 'modules/appData'
import {
  LimitOrdersWidget,
  QuoteObserverUpdater,
  InitialPriceUpdater,
  ExecutionPriceUpdater,
  limitOrdersRawStateAtom,
  limitOrdersSettingsAtom,
  LIMIT_ORDER_SLIPPAGE,
} from 'modules/limitOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { TradeFormValidationUpdater } from 'modules/tradeFormValidation'

export default function LimitOrderPage() {
  const { isUnlocked } = useAtomValue(limitOrdersRawStateAtom)
  const { expertMode } = useAtomValue(limitOrdersSettingsAtom)

  return (
    <>
      <AppDataUpdater orderClass="limit" slippage={LIMIT_ORDER_SLIPPAGE} />
      <QuoteObserverUpdater />
      <InitialPriceUpdater />
      <ExecutionPriceUpdater />
      <TradeFormValidationUpdater isExpertMode={expertMode} />

      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <LimitOrdersWidget />
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
