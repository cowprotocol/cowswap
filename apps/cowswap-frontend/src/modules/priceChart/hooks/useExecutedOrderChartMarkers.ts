import { useMemo } from 'react'

import { formatLocaleNumber } from '@cowprotocol/common-utils'
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

import { FALLBACK_TOKEN_SYMBOL } from '../config/priceChart.constants'
import { getPairInversion, currenciesMatch } from '../lib/priceChartCurrency.utils'

import type { PriceChartExecutionMarker } from '../lib/priceChart.types'

type ExecutionMarkerData = Omit<PriceChartExecutionMarker, 'title'>

interface UseExecutedOrderChartMarkersParams {
  activeCurrency: Currency | undefined
  inputCurrency: Currency | null
  outputCurrency: Currency | null
}

const EXECUTED_ORDER_TYPES = new Set([UiOrderType.SWAP, UiOrderType.LIMIT, UiOrderType.TWAP])

export function useExecutedOrderChartMarkers({
  activeCurrency,
  inputCurrency,
  outputCurrency,
}: UseExecutedOrderChartMarkersParams): PriceChartExecutionMarker[] {
  const { account, chainId } = useWalletInfo()
  const ordersMap = useAllOrdersMap({ chainId })
  const { i18n, t } = useLingui()

  return useMemo(() => {
    if (!account || !activeCurrency || !inputCurrency || !outputCurrency) return []

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
  }, [account, activeCurrency, i18n.locale, inputCurrency, ordersMap, outputCurrency, t])
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

  const isSell = currenciesMatch(order.inputToken, activeCurrency)
  const activeAmount = isSell ? amounts.sell : amounts.buy
  const counterAmount = isSell ? amounts.buy : amounts.sell

  return {
    activeAmount: formatLocaleNumber({ number: activeAmount, locale, sigFigs: 4 }),
    activeTokenSymbol: activeAmount.currency.symbol || FALLBACK_TOKEN_SYMBOL,
    counterAmount: formatLocaleNumber({ number: counterAmount, locale, sigFigs: 4 }),
    counterTokenSymbol: counterAmount.currency.symbol || FALLBACK_TOKEN_SYMBOL,
    id: `execution:${order.id}`,
    side: isSell ? 'sell' : 'buy',
    timestamp,
  }
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

  return getPairInversion(order.inputToken, order.outputToken, inputCurrency, outputCurrency) !== null
}
