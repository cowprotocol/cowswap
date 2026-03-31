import { useAtomValue } from 'jotai'
import { ReactNode, Suspense, useState } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { BlockOrDrawer } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'

import { Loading } from 'legacy/components/FlashingLoading'
import { OrderStatus } from 'legacy/state/orders/actions'

import {
  advancedOrdersAtom,
  advancedOrdersDerivedStateAtom,
  AdvancedOrdersWidget,
  SetupAdvancedOrderAmountsFromUrlUpdater,
  useAdvancedOrdersDerivedStateToFill,
} from 'modules/advancedOrders'
import { PageTitle } from 'modules/application'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { limitOrdersSettingsAtom } from 'modules/limitOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade'
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
  TwapFormState,
} from 'modules/twap'

import { HydrateAtom } from 'common/state/HydrateAtom'

const ADVANCED_ORDERS_MAX_WIDTH = '1800px'

export function AdvancedOrdersPage(): ReactNode {
  const [isOrdersTableOpen, setIsOrdersTableOpen] = useState(false)

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

  const advancedOrdersDerivedStateToFill = useAdvancedOrdersDerivedStateToFill(twapSlippage)

  return (
    <HydrateAtom atom={advancedOrdersDerivedStateAtom} state={advancedOrdersDerivedStateToFill}>
      <PageTitle title={i18n._(PAGE_TITLES.ADVANCED)} />
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
            toggleMyOrders={() => setIsOrdersTableOpen(true)}
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
          <BlockOrDrawer isOpen={isOrdersTableOpen} onDismiss={() => setIsOrdersTableOpen(false)}>
            <styledEl.SecondaryWrapper className="trade-orders-table">
              <Suspense fallback={<Loading />}>
                <OrdersTableWidget
                  displayOrdersOnlyForSafeApp
                  orderType={TabOrderTypes.ADVANCED}
                  orders={allEmulatedOrders}
                />
              </Suspense>
            </styledEl.SecondaryWrapper>
          </BlockOrDrawer>
        )}
      </styledEl.PageWrapper>
    </HydrateAtom>
  )
}
