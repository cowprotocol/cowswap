import { useMemo } from 'react'

import { formatLocaleNumber, getWrappedToken } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { useAllOrdersMap } from 'legacy/state/orders/hooks'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'

import { getOrderExecutedAmounts } from 'utils/orderUtils/getOrderExecutedAmounts'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import type { PriceChartExecutionMarker, PriceChartSymbolDescriptor } from '../lib/tradingView.types'

type ExecutionMarkerData = Omit<PriceChartExecutionMarker, 'title'>

interface UseExecutedOrderChartMarkersParams {
  activeSymbol: PriceChartSymbolDescriptor | undefined
  inputCurrency: Currency | null
  outputCurrency: Currency | null
}

const EXECUTED_ORDER_TYPES = new Set([UiOrderType.SWAP, UiOrderType.LIMIT, UiOrderType.TWAP])

export function useExecutedOrderChartMarkers({
  activeSymbol,
  inputCurrency,
  outputCurrency,
}: UseExecutedOrderChartMarkersParams): PriceChartExecutionMarker[] {
  const { account, chainId } = useWalletInfo()
  const ordersMap = useAllOrdersMap({ chainId })
  const { i18n, t } = useLingui()

  return useMemo(() => {
    if (!account || !activeSymbol || !inputCurrency || !outputCurrency) return []

    const activeCurrency = activeSymbol.selection === 'sell' ? inputCurrency : outputCurrency

    return Object.values(ordersMap)
      .flatMap((orderObject) => {
        const order = deserializeOrder(orderObject)

        return order && isMatchingFulfilledOrder(order, account, inputCurrency, outputCurrency) ? [order] : []
      })
      .flatMap((order) => {
        const marker = getExecutionMarkerData(order, activeCurrency, i18n.locale)

        if (!marker) return []

        const { activeAmount, activeTokenSymbol, counterAmount, counterTokenSymbol } = marker

        return [
          {
            ...marker,
            title:
              marker.side === 'sell'
                ? t`Sold ${activeAmount} ${activeTokenSymbol} for ${counterAmount} ${counterTokenSymbol}`
                : t`Bought ${activeAmount} ${activeTokenSymbol} for ${counterAmount} ${counterTokenSymbol}`,
          },
        ]
      })
      .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id))
  }, [account, activeSymbol, i18n.locale, inputCurrency, ordersMap, outputCurrency, t])
}

function getExecutedAmounts(order: Order): { buy: CurrencyAmount<Currency>; sell: CurrencyAmount<Currency> } | null {
  try {
    const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

    if (!JSBI.greaterThan(executedBuyAmount, JSBI.BigInt(0))) return null
    if (!JSBI.greaterThan(executedSellAmount, JSBI.BigInt(0))) return null

    return {
      buy: CurrencyAmount.fromRawAmount(order.outputToken, executedBuyAmount),
      sell: CurrencyAmount.fromRawAmount(order.inputToken, executedSellAmount),
    }
  } catch {
    return null
  }
}

function getExecutionMarkerData(order: Order, activeCurrency: Currency, locale: string): ExecutionMarkerData | null {
  const fulfillmentTime = order.fulfillmentTime ? order.fulfillmentTime : order.creationTime
  const timestamp = Date.parse(fulfillmentTime) / 1000

  if (!Number.isFinite(timestamp)) return null
  if (timestamp <= 0) return null

  const amounts = getExecutedAmounts(order)

  if (!amounts) return null

  const isSell = isMatchingCurrency(order.inputToken, activeCurrency)
  const activeAmount = isSell ? amounts.sell : amounts.buy
  const counterAmount = isSell ? amounts.buy : amounts.sell

  return {
    activeAmount: formatLocaleNumber({ number: activeAmount, locale, sigFigs: 4 }),
    activeTokenSymbol: getSymbol(activeAmount),
    counterAmount: formatLocaleNumber({ number: counterAmount, locale, sigFigs: 4 }),
    counterTokenSymbol: getSymbol(counterAmount),
    id: `execution:${order.id}`,
    side: isSell ? 'sell' : 'buy',
    timestamp,
  }
}

function getSymbol(amount: CurrencyAmount<Currency>): string {
  return amount.currency.symbol || 'TOKEN'
}

function isMatchingCurrency(currency: Currency, expectedCurrency: Currency): boolean {
  const wrappedCurrency = getWrappedToken(currency)
  const wrappedExpectedCurrency = getWrappedToken(expectedCurrency)

  return (
    wrappedCurrency.chainId === wrappedExpectedCurrency.chainId &&
    areAddressesEqual(wrappedCurrency.address, wrappedExpectedCurrency.address)
  )
}

function isMatchingFulfilledOrder(
  order: Order,
  account: string,
  inputCurrency: Currency,
  outputCurrency: Currency,
): boolean {
  if (
    order.status !== OrderStatus.FULFILLED ||
    order.isHidden ||
    !areAddressesEqual(order.owner, account) ||
    !EXECUTED_ORDER_TYPES.has(getUiOrderType(order))
  )
    return false

  return (
    (isMatchingCurrency(order.inputToken, inputCurrency) && isMatchingCurrency(order.outputToken, outputCurrency)) ||
    (isMatchingCurrency(order.inputToken, outputCurrency) && isMatchingCurrency(order.outputToken, inputCurrency))
  )
}
