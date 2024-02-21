import { useAtomValue } from 'jotai'

import { advancedOrdersAtom, AdvancedOrdersWidget, FillAdvancedOrdersDerivedStateUpdater } from 'modules/advancedOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { TwapConfirmModal, TwapFormWidget, TwapUpdaters, useAllEmulatedOrders } from 'modules/twap'
import { useTwapFormState } from 'modules/twap/hooks/useTwapFormState'
import { TwapFormState } from 'modules/twap/pure/PrimaryActionButton/getTwapFormState'

export default function AdvancedOrdersPage() {
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)

  const allEmulatedOrders = useAllEmulatedOrders()

  const primaryFormValidation = useGetTradeFormValidation()
  const twapFormValidation = useTwapFormState()

  const disablePriceImpact =
    primaryFormValidation === TradeFormValidation.QuoteErrors ||
    primaryFormValidation === TradeFormValidation.CurrencyNotSupported ||
    primaryFormValidation === TradeFormValidation.WrapUnwrapFlow ||
    twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL

  const advancedWidgetParams = { disablePriceImpact }

  return (
    <>
      <FillAdvancedOrdersDerivedStateUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <AdvancedOrdersWidget
            updaters={<TwapUpdaters />}
            confirmContent={<TwapConfirmModal />}
            params={advancedWidgetParams}
          >
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
