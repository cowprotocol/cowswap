import { useAtomValue } from 'jotai'

import {
  advancedOrdersAtom,
  AdvancedOrdersWidget,
  FillAdvancedOrdersDerivedStateUpdater,
  SetupAdvancedOrderAmountsFromUrlUpdater,
} from 'modules/advancedOrders'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import {
  SetupFallbackHandlerWarning,
  TwapConfirmModal,
  TwapFormWidget,
  TwapUpdaters,
  useAllEmulatedOrders,
  useIsFallbackHandlerRequired,
  useMapTwapCurrencyInfo,
  useTwapFormState,
  useTwapSlippage,
} from 'modules/twap'
import { TwapFormState } from 'modules/twap/pure/PrimaryActionButton/getTwapFormState'

export default function AdvancedOrdersPage() {
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)

  const allEmulatedOrders = useAllEmulatedOrders()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  const twapFormValidation = useTwapFormState()
  const twapSlippage = useTwapSlippage()
  const mapTwapCurrencyInfo = useMapTwapCurrencyInfo()

  const disablePriceImpact = twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL

  const advancedWidgetParams = { disablePriceImpact }

  const { hideOrdersTable } = useInjectedWidgetParams()

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
            {(tradeWarnings) => (
              <>
                {/*TODO: conditionally display a widget for current advanced order type*/}
                <TwapFormWidget tradeWarnings={tradeWarnings} />
              </>
            )}
          </AdvancedOrdersWidget>
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          {!hideOrdersTable && (
            <OrdersTableWidget
              displayOrdersOnlyForSafeApp={true}
              orderType={TabOrderTypes.ADVANCED}
              orders={allEmulatedOrders}
            >
              {isFallbackHandlerRequired && allEmulatedOrders.length > 0 && <SetupFallbackHandlerWarning />}
            </OrdersTableWidget>
          )}
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
