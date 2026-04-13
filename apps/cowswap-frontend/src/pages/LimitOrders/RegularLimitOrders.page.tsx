import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, Suspense, useCallback, useMemo } from 'react'

import { Fraction, Price } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Loading } from 'legacy/components/FlashingLoading'
import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrders } from 'legacy/state/orders/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
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
import { LimitOrdersPermitUpdater, OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import { PriceChart } from 'modules/priceChart'
import * as styledEl from 'modules/trade'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

const SecondaryColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  grid-area: secondary;
`

export function RegularLimitOrdersPage(): ReactNode {
  const isUnlocked = useIsWidgetUnlocked()
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const executionPrice = useAtomValue(executionPriceAtom)
  const { activeRate } = useAtomValue(limitRateAtom)
  const isChartPriceSelectionMode = useAtomValue(isChartPriceSelectionModeAtom)
  const updateRate = useUpdateActiveRate()
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)
  const pendingLimitOrders = useMemo(
    () => allLimitOrders.filter((order) => order.status === OrderStatus.PENDING),
    [allLimitOrders],
  )
  const { hideOrdersTable } = useInjectedWidgetParams()
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)
  const setIsChartPriceSelectionMode = useSetAtom(isChartPriceSelectionModeAtom)
  const activeLimitPrice = useMemo(() => {
    if (!inputCurrency || !outputCurrency || !activeRate) {
      return null
    }

    return new Price(inputCurrency, outputCurrency, activeRate.denominator.toString(), activeRate.numerator.toString())
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

  return (
    <styledEl.PageWrapper
      isUnlocked={isUnlocked}
      secondaryOnLeft={ordersTableOnLeft}
      maxWidth={LIMIT_ORDERS_MAX_WIDTH}
      hideOrdersTable={hideOrdersTable}
    >
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      {!hideOrdersTable && (
        <SecondaryColumn className="trade-orders-table">
          {inputCurrency && outputCurrency ? (
            <styledEl.SecondaryWrapper>
              <PriceChart
                executionPrice={executionPrice}
                inputCurrency={inputCurrency}
                limitPrice={activeLimitPrice}
                onSelectLimitPrice={isChartPriceSelectionMode ? handleSelectLimitPrice : undefined}
                outputCurrency={outputCurrency}
              />
            </styledEl.SecondaryWrapper>
          ) : null}
          <styledEl.SecondaryWrapper>
            {pendingLimitOrders.length > 0 && <LimitOrdersPermitUpdater orders={pendingLimitOrders} />}
            <Suspense fallback={<Loading />}>
              <OrdersTableWidget orderType={TabOrderTypes.LIMIT} orders={allLimitOrders} />
            </Suspense>
          </styledEl.SecondaryWrapper>
        </SecondaryColumn>
      )}
    </styledEl.PageWrapper>
  )
}
