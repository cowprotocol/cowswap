import { useAtomValue } from 'jotai'
import { ReactNode, Suspense, useCallback } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Dialog, DialogOrInline, Media, Modal, ModalHeader } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { TabOrderTypes } from 'entities/routes/routes.atom'
import { useParams } from 'react-router'

import { Loading } from 'legacy/components/FlashingLoading'

import {
  advancedOrdersAtom,
  advancedOrdersDerivedStateAtom,
  AdvancedOrdersWidget,
  SetupAdvancedOrderAmountsFromUrlUpdater,
  useAdvancedOrdersDerivedStateToFill,
} from 'modules/advancedOrders'
import { PageTitle } from 'modules/application'
import { limitOrdersSettingsAtom } from 'modules/limitOrders'
import { OrdersTableWidget, ordersTableStateAtom, useOrdersTable } from 'modules/ordersTable'
import * as styledEl from 'modules/trade'
import { TradeRouteRedirect, useOrdersTableDrawerState, useSetOrdersTableDrawerOpen } from 'modules/trade'
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

import { Routes } from 'common/constants/routes'
import { HydrateAtom } from 'common/state/HydrateAtom'

const ADVANCED_ORDERS_MAX_WIDTH = '1800px'

export function AdvancedOrdersPage(): ReactNode {
  useOrdersTable(TabOrderTypes.ADVANCED)

  const params = useParams()
  const { i18n, t } = useLingui()
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)

  const { pendingOrders } = useAtomValue(ordersTableStateAtom)
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  const twapFormValidation = useTwapFormState()
  const twapSlippage = useTwapSlippage()
  const mapTwapCurrencyInfo = useMapTwapCurrencyInfo()
  const { hideOrdersTable } = useInjectedWidgetParams()
  const { isOpen: isOrdersTableDrawerOpen } = useOrdersTableDrawerState()
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const handleOrdersTableDrawerOpenChange = useCallback(
    (open: boolean) => {
      setOrdersTableDrawerOpen(open)
    },
    [setOrdersTableDrawerOpen],
  )

  const disablePriceImpact = twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL
  const advancedWidgetParams = { disablePriceImpact }
  const advancedOrdersDerivedStateToFill = useAdvancedOrdersDerivedStateToFill(twapSlippage)

  if (!params.chainId) {
    return <TradeRouteRedirect route={Routes.ADVANCED_ORDERS} />
  }

  return (
    <HydrateAtom atom={advancedOrdersDerivedStateAtom} state={advancedOrdersDerivedStateToFill}>
      <PageTitle title={i18n._(PAGE_TITLES.ADVANCED)} />
      <SetupAdvancedOrderAmountsFromUrlUpdater />
      <styledEl.PageWrapper
        isUnlocked={isUnlocked}
        maxWidth={ADVANCED_ORDERS_MAX_WIDTH}
        secondaryOnLeft={ordersTableOnLeft}
        hideOrdersTable={hideOrdersTable || isUpToLarge}
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

        {!hideOrdersTable && isUnlocked && (
          <DialogOrInline
            isDialog={isUpToLarge}
            isOpen={isOrdersTableDrawerOpen}
            onOpenChange={handleOrdersTableDrawerOpenChange}
          >
            <Modal.Root className="trade-orders-table">
              {isUpToLarge ? (
                <ModalHeader
                  sticky
                  title={t`TWAP orders`}
                  titleAs={Dialog.Title}
                  onClose={() => setOrdersTableDrawerOpen(false)}
                />
              ) : null}
              <styledEl.SecondaryWrapper $inDrawer={isUpToLarge}>
                <Suspense fallback={<Loading />}>
                  <OrdersTableWidget orderType={TabOrderTypes.ADVANCED} />
                </Suspense>
              </styledEl.SecondaryWrapper>
            </Modal.Root>
          </DialogOrInline>
        )}
      </styledEl.PageWrapper>
    </HydrateAtom>
  )
}
