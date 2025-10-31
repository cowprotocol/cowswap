import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import {
  advancedOrdersAtom,
  AdvancedOrdersWidget,
  FillAdvancedOrdersDerivedStateUpdater,
  SetupAdvancedOrderAmountsFromUrlUpdater,
} from 'modules/advancedOrders'
import { PageTitle } from 'modules/application/containers/PageTitle'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
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

const ADVANCED_ORDERS_MAX_WIDTH = '1800px'

export default function AdvancedOrdersPage(): ReactNode {
  const { i18n } = useLingui()
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)

  const allEmulatedOrders = useAllEmulatedOrders()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  const twapFormValidation = useTwapFormState()
  const twapSlippage = useTwapSlippage()
  const mapTwapCurrencyInfo = useMapTwapCurrencyInfo()
  const { hideOrdersTable } = useInjectedWidgetParams()

  const disablePriceImpact = twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL
  const advancedWidgetParams = { disablePriceImpact }
  const pendingOrders = allEmulatedOrders.filter((order) => order.status === OrderStatus.PENDING)

  return (
    <>
      <PageTitle title={i18n._(PAGE_TITLES.ADVANCED)} />
      <FillAdvancedOrdersDerivedStateUpdater slippage={twapSlippage} />
      <SetupAdvancedOrderAmountsFromUrlUpdater />
      <styledEl.PageWrapper
        isUnlocked={isUnlocked}
        maxWidth={ADVANCED_ORDERS_MAX_WIDTH}
        secondaryOnLeft={ordersTableOnLeft}
        hideOrdersTable={hideOrdersTable}
      >
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
                {/*TODO: conditionally display a widget for current advanced order type*/}
                <TwapFormWidget tradeWarnings={tradeWarnings} />
              </>
            )}
          </AdvancedOrdersWidget>
        </styledEl.PrimaryWrapper>

        {!hideOrdersTable && (
          <styledEl.SecondaryWrapper>
            <OrdersTableWidget
              isTwapTable
              displayOrdersOnlyForSafeApp
              orderType={TabOrderTypes.ADVANCED}
              orders={allEmulatedOrders}
            />
          </styledEl.SecondaryWrapper>
        )}
      </styledEl.PageWrapper>
    </>
  )
}
