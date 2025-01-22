import { useAtomValue } from 'jotai'

import { PENDING_STATES } from 'legacy/state/orders/actions'

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

import { SHOW_LIMIT_ORDERS_PROMO } from 'common/constants/featureFlags'
import { limitOrdersPromoDismissedAtom } from 'common/state/limitOrdersPromoAtom'

export default function AdvancedOrdersPage() {
  const { isUnlocked: isWidgetUnlocked } = useAtomValue(advancedOrdersAtom)
  const isDismissed = useAtomValue(limitOrdersPromoDismissedAtom)
  const shouldShowPromo = SHOW_LIMIT_ORDERS_PROMO && !isDismissed
  const isUnlocked = isWidgetUnlocked || SHOW_LIMIT_ORDERS_PROMO

  const allEmulatedOrders = useAllEmulatedOrders()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  const twapFormValidation = useTwapFormState()
  const twapSlippage = useTwapSlippage()
  const mapTwapCurrencyInfo = useMapTwapCurrencyInfo()
  const { hideOrdersTable } = useInjectedWidgetParams()

  const disablePriceImpact = twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL
  const advancedWidgetParams = { disablePriceImpact }
  const pendingOrders = allEmulatedOrders.filter((order) => PENDING_STATES.includes(order.status))

  return (
    <>
      <FillAdvancedOrdersDerivedStateUpdater slippage={twapSlippage} />
      <SetupAdvancedOrderAmountsFromUrlUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked && (!shouldShowPromo || isDismissed)}>
        <styledEl.PrimaryWrapper>
          {isFallbackHandlerRequired && pendingOrders.length > 0 && <SetupFallbackHandlerWarning />}
          <AdvancedOrdersWidget
            updaters={<TwapUpdaters />}
            confirmContent={<TwapConfirmModal />}
            params={advancedWidgetParams}
            mapCurrencyInfo={mapTwapCurrencyInfo}
          >
            {(tradeWarnings) => (
              <>
                <TwapFormWidget tradeWarnings={tradeWarnings} />
              </>
            )}
          </AdvancedOrdersWidget>
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          {!hideOrdersTable && !shouldShowPromo && (
            <OrdersTableWidget
              displayOrdersOnlyForSafeApp={true}
              orderType={TabOrderTypes.ADVANCED}
              orders={allEmulatedOrders}
            />
          )}
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
