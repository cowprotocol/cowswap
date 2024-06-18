import { useAtomValue } from 'jotai'

import {
  advancedOrdersAtom,
  AdvancedOrdersWidget,
  FillAdvancedOrdersDerivedStateUpdater,
  SetupAdvancedOrderAmountsFromUrlUpdater,
} from 'modules/advancedOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import {
  TwapConfirmModal,
  TwapFormWidget,
  TwapUpdaters,
  useAllEmulatedOrders,
  useMapTwapCurrencyInfo,
  useTwapFormState,
  useTwapSlippage,
} from 'modules/twap'
import { TwapFormState } from 'modules/twap/pure/PrimaryActionButton/getTwapFormState'

export default function AdvancedOrdersPage() {
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)

  const allEmulatedOrders = useAllEmulatedOrders()

  const twapFormValidation = useTwapFormState()
  const twapSlippage = useTwapSlippage()
  const mapTwapCurrencyInfo = useMapTwapCurrencyInfo()

  const disablePriceImpact = twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL

  const advancedWidgetParams = { disablePriceImpact }

  return (
    <>
      <FillAdvancedOrdersDerivedStateUpdater slippage={twapSlippage} />
      <SetupAdvancedOrderAmountsFromUrlUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <AdvancedOrdersWidget
            updaters={<TwapUpdaters />}
            confirmContent={<TwapConfirmModal />}
            params={advancedWidgetParams}
            mapCurrencyInfo={mapTwapCurrencyInfo}
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
