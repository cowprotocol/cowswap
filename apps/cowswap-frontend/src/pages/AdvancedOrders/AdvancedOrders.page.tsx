import { useAtomValue } from 'jotai'
import { ReactNode, Suspense } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import { Loading } from 'legacy/components/FlashingLoading'

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
import {
  OrdersTableWidget,
  HistoryStatusFilter,
  ordersTableStateAtom,
  useResetOrdersTableFilters,
} from 'modules/ordersTable'
import * as styledEl from 'modules/trade'
import {
  SetupFallbackHandlerWarning,
  TwapConfirmModal,
  TwapFormWidget,
  TwapUpdaters,
  useIsFallbackHandlerRequired,
  useMapTwapCurrencyInfo,
  useTwapFormState,
  useTwapSlippage,
  TwapFormState,
} from 'modules/twap'

import { HydrateAtom } from 'common/state/HydrateAtom'

const ADVANCED_ORDERS_MAX_WIDTH = '1800px'

export function AdvancedOrdersPage(): ReactNode {
  const { i18n } = useLingui()
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)

  const { pendingOrders } = useAtomValue(ordersTableStateAtom)
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  const twapFormValidation = useTwapFormState()
  const twapSlippage = useTwapSlippage()
  const mapTwapCurrencyInfo = useMapTwapCurrencyInfo()
  const { hideOrdersTable } = useInjectedWidgetParams()

  const disablePriceImpact = twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL
  const advancedWidgetParams = { disablePriceImpact }

  useResetOrdersTableFilters({
    historyStatusFilter: HistoryStatusFilter.FILLED,
  })

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
            <Suspense fallback={<Loading />}>
              <OrdersTableWidget />
            </Suspense>
          </styledEl.SecondaryWrapper>
        )}
      </styledEl.PageWrapper>
    </HydrateAtom>
  )
}
