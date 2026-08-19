import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, Suspense, useCallback, useMemo } from 'react'

import { Fraction } from '@cowprotocol/currency'

import { useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { TabOrderTypes } from 'entities/routes/routes.atom'
import styled from 'styled-components/macro'

import { Loading } from 'legacy/components/FlashingLoading'

import {
  executionPriceAtom,
  isChartPriceSelectionModeAtom,
  limitOrdersSettingsAtom,
  limitRateAtom,
  LimitOrdersWidget,
  useIsWidgetUnlocked,
  useLimitOrdersDerivedState,
  useUpdateActiveRate,
} from 'modules/limitOrders'
import { LimitOrdersPermitUpdater, ordersTableStateAtom, OrdersTableWidget, useOrdersTable } from 'modules/ordersTable'
import { getLimitPriceFromRate, PriceChart, priceChartVisibleAtom, usePriceChartFeatureFlags } from 'modules/priceChart'
import * as styledEl from 'modules/trade'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

const SecondaryColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  grid-area: secondary;
`

export function RegularLimitOrdersPage(): ReactNode {
  useOrdersTable(TabOrderTypes.LIMIT)

  const { t } = useLingui()
  const isUnlocked = useIsWidgetUnlocked()
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const executionPrice = useAtomValue(executionPriceAtom)
  const { activeRate } = useAtomValue(limitRateAtom)
  const isChartPriceSelectionMode = useAtomValue(isChartPriceSelectionModeAtom)
  const updateRate = useUpdateActiveRate()
  const { pendingOrders } = useAtomValue(ordersTableStateAtom)
  const { hideOrdersTable } = useInjectedWidgetParams()
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)
  const isChartVisible = useAtomValue(priceChartVisibleAtom)
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  const setIsChartPriceSelectionMode = useSetAtom(isChartPriceSelectionModeAtom)
  const activeLimitPrice = useMemo(() => {
    if (!inputCurrency || !outputCurrency || !activeRate) {
      return null
    }

    return getLimitPriceFromRate(inputCurrency, outputCurrency, activeRate)
  }, [activeRate, inputCurrency, outputCurrency])
  const handleSelectLimitPrice = useCallback(
    (activeRate: Fraction) => {
      updateRate({
        activeRate,
        isAlternativeOrderRate: false,
        isRateFromUrl: false,
        isTypedValue: false,
      })
      setIsChartPriceSelectionMode(false)
    },
    [setIsChartPriceSelectionMode, updateRate],
  )
  const shouldShowChart = Boolean(isPriceChartEnabled && isChartVisible && inputCurrency && outputCurrency)
  const hasSecondaryContent = shouldShowChart || !hideOrdersTable

  return (
    <styledEl.PageWrapper
      isUnlocked={isUnlocked}
      secondaryOnLeft={ordersTableOnLeft}
      maxWidth={LIMIT_ORDERS_MAX_WIDTH}
      hideOrdersTable={!hasSecondaryContent}
    >
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      {hasSecondaryContent && (
        <SecondaryColumn className="trade-orders-table">
          {shouldShowChart ? (
            <styledEl.ChartWrapper $isExpanded>
              <PriceChart
                executionPrice={executionPrice}
                inputCurrency={inputCurrency}
                onSelectLimitPrice={isChartPriceSelectionMode ? handleSelectLimitPrice : undefined}
                outputCurrency={outputCurrency}
                referenceLine={{ label: t`Limit`, price: activeLimitPrice }}
              />
            </styledEl.ChartWrapper>
          ) : null}
          {!hideOrdersTable ? (
            <styledEl.SecondaryWrapper>
              {pendingOrders.length > 0 && <LimitOrdersPermitUpdater orders={pendingOrders} />}
              <Suspense fallback={<Loading />}>
                <OrdersTableWidget orderType={TabOrderTypes.LIMIT} />
              </Suspense>
            </styledEl.SecondaryWrapper>
          ) : null}
        </SecondaryColumn>
      )}
    </styledEl.PageWrapper>
  )
}
