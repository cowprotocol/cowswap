import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, Suspense, useCallback, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import type { Fraction } from '@cowprotocol/currency'
import { Dialog, DialogOrInline, Media, Modal, ModalHeader } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { TabOrderTypes } from 'entities/routes/routes.atom'

import { Loading } from 'legacy/components/FlashingLoading'

import {
  useLimitOrdersDerivedState,
  limitOrdersSettingsAtom,
  LimitOrdersWidget,
  limitRateAtom,
  updateLimitRateAtom,
  isChartPriceSelectionModeAtom,
  useUpdateActiveRate,
} from 'modules/limitOrders'
import { LimitOrdersPermitUpdater, ordersTableStateAtom, OrdersTableWidget, useOrdersTable } from 'modules/ordersTable'
import { PriceChart, getLimitPriceFromRate } from 'modules/priceChart'
import * as styledEl from 'modules/trade'
import { useOrdersTableDrawerState, useSetOrdersTableDrawerOpen } from 'modules/trade'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

export function RegularLimitOrdersPage(): ReactNode {
  useOrdersTable(TabOrderTypes.LIMIT)

  const { t } = useLingui()
  const { pendingOrders } = useAtomValue(ordersTableStateAtom)
  const { hideOrdersTable } = useInjectedWidgetParams()
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)
  const { isOpen: isOrdersTableDrawerOpen } = useOrdersTableDrawerState()
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const { inputCurrency, outputCurrency, isUnlocked } = useLimitOrdersDerivedState()
  const { activeRate, isInverted } = useAtomValue(limitRateAtom)
  const updateLimitRate = useSetAtom(updateLimitRateAtom)
  const isChartPriceSelectionMode = useAtomValue(isChartPriceSelectionModeAtom)
  const setIsChartPriceSelectionMode = useSetAtom(isChartPriceSelectionModeAtom)
  const updateRate = useUpdateActiveRate()
  const referenceLines = useMemo(
    () => [
      {
        id: 'trade:limit',
        label: t`Limit`,
        variant: 'trade' as const,
        price:
          inputCurrency && outputCurrency && activeRate
            ? getLimitPriceFromRate(inputCurrency, outputCurrency, activeRate)
            : null,
      },
    ],
    [inputCurrency, outputCurrency, activeRate, t],
  )
  const handleSelectLimitPrice = useCallback(
    (activeRate: Fraction) => {
      updateRate({ activeRate, isAlternativeOrderRate: false, isRateFromUrl: false, isTypedValue: false })
      setIsChartPriceSelectionMode(false)
    },
    [setIsChartPriceSelectionMode, updateRate],
  )

  const handleOrdersTableDrawerOpenChange = useCallback(
    (open: boolean) => {
      setOrdersTableDrawerOpen(open)
    },
    [setOrdersTableDrawerOpen],
  )

  return (
    <styledEl.PageWrapper
      isUnlocked={isUnlocked}
      secondaryOnLeft={ordersTableOnLeft}
      maxWidth={LIMIT_ORDERS_MAX_WIDTH}
      hideOrdersTable={hideOrdersTable || isUpToLarge || !isUnlocked}
    >
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      {isUnlocked && (
        <styledEl.SecondaryColumn>
          <PriceChart
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            selectedCurrency={isInverted ? outputCurrency : inputCurrency}
            onSelectCurrency={(currency) =>
              updateLimitRate({ isInverted: Boolean(outputCurrency?.equals(currency)), isTypedValue: false })
            }
            onSelectLimitPrice={isChartPriceSelectionMode ? handleSelectLimitPrice : undefined}
            referenceLines={referenceLines}
          />
          {!hideOrdersTable && (
            <DialogOrInline
              isDialog={isUpToLarge}
              isOpen={isOrdersTableDrawerOpen}
              onOpenChange={handleOrdersTableDrawerOpenChange}
            >
              <Modal.Root className="trade-orders-table">
                {isUpToLarge && (
                  <ModalHeader
                    sticky
                    title={t`Limit orders`}
                    titleAs={Dialog.Title}
                    onClose={() => setOrdersTableDrawerOpen(false)}
                  />
                )}
                <styledEl.SecondaryWrapper $inDrawer={isUpToLarge}>
                  {pendingOrders.length > 0 && <LimitOrdersPermitUpdater orders={pendingOrders} />}
                  <Suspense fallback={<Loading />}>
                    <OrdersTableWidget orderType={TabOrderTypes.LIMIT} />
                  </Suspense>
                </styledEl.SecondaryWrapper>
              </Modal.Root>
            </DialogOrInline>
          )}
        </styledEl.SecondaryColumn>
      )}
    </styledEl.PageWrapper>
  )
}
