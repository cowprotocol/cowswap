import { useMemo } from 'react'

import { formatTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Price } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { useLingui } from '@lingui/react/macro'
import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { getRemainderAmountsWithoutSurplus } from 'legacy/state/orders/utils'

import { calculatePrice } from 'utils/orderUtils/calculatePrice'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { FALLBACK_TOKEN_SYMBOL } from '../config/priceChart.constants'
import { getPairInversion, currenciesMatch } from '../lib/priceChartCurrency.utils'

import type { PriceChartReferenceLine } from '../lib/priceChart.types'

interface UseOpenLimitOrderChartLinesParams {
  inputCurrency: Currency | null
  orders: Order[]
  outputCurrency: Currency | null
}

export function useOpenLimitOrderChartLines({
  inputCurrency,
  orders,
  outputCurrency,
}: UseOpenLimitOrderChartLinesParams): PriceChartReferenceLine<Price<Currency, Currency>>[] {
  const { t } = useLingui()

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) return []

    return orders
      .filter((order) => isMatchingOpenLimitOrder(order, inputCurrency, outputCurrency))
      .sort(compareOrders)
      .flatMap((order) => {
        const price = calculatePrice({
          buyAmount: JSBI.BigInt(order.buyAmount.toString()),
          inputToken: order.inputToken,
          outputToken: order.outputToken,
          sellAmount: JSBI.BigInt(order.sellAmount.toString()),
        })

        if (!price) return []

        const { buyAmount, sellAmount } = getRemainderAmountsWithoutSurplus(order)
        const formattedSellAmount = formatTokenAmount(CurrencyAmount.fromRawAmount(order.inputToken, sellAmount))
        const formattedBuyAmount = formatTokenAmount(CurrencyAmount.fromRawAmount(order.outputToken, buyAmount))
        const sellSymbol = order.inputToken.symbol || FALLBACK_TOKEN_SYMBOL
        const buySymbol = order.outputToken.symbol || FALLBACK_TOKEN_SYMBOL
        const sellLabel = t`Sell ${formattedSellAmount} ${sellSymbol}`
        const buyLabel = t`Buy ${formattedBuyAmount} ${buySymbol}`
        const isInverted = !currenciesMatch(order.inputToken, inputCurrency)
        const prefixLabel = (label: string): string => (order.isUnfillable ? t`Unfillable · ${label}` : label)
        const labels = {
          sell: prefixLabel(isInverted ? buyLabel : sellLabel),
          buy: prefixLabel(isInverted ? sellLabel : buyLabel),
        }

        return [
          {
            id: `open-order:${order.id}`,
            label: labels.sell,
            labels,
            price,
            variant: order.isUnfillable ? 'unfillable-order' : 'open-order',
          },
        ]
      })
  }, [inputCurrency, orders, outputCurrency, t])
}

function compareOrders(a: Order, b: Order): number {
  return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime() || a.id.localeCompare(b.id)
}

function isMatchingOpenLimitOrder(order: Order, inputCurrency: Currency, outputCurrency: Currency): boolean {
  if (order.status !== OrderStatus.PENDING || order.isHidden || getUiOrderType(order) !== UiOrderType.LIMIT) {
    return false
  }

  return getPairInversion(order.inputToken, order.outputToken, inputCurrency, outputCurrency) !== null
}
