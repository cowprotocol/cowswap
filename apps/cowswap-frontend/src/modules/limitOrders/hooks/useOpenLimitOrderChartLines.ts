import { useMemo } from 'react'

import { formatTokenAmount, getWrappedToken } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { useLingui } from '@lingui/react/macro'
import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { getRemainderAmountsWithoutSurplus } from 'legacy/state/orders/utils'

import type { PriceChartReferenceLine } from 'modules/priceChart'

import { calculatePrice } from 'utils/orderUtils/calculatePrice'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

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
        const sellLabel = t`Sell ${formattedSellAmount} ${order.inputToken.symbol || 'TOKEN'}`
        const buyLabel = t`Buy ${formattedBuyAmount} ${order.outputToken.symbol || 'TOKEN'}`
        const isForwardOrder = isMatchingCurrency(order.inputToken, inputCurrency)
        const labels = isForwardOrder ? { sell: sellLabel, buy: buyLabel } : { sell: buyLabel, buy: sellLabel }
        const prefixLabel = (label: string): string => (order.isUnfillable ? t`Unfillable · ${label}` : label)

        return [
          {
            id: `open-order:${order.id}`,
            label: prefixLabel(labels.sell),
            labels: { buy: prefixLabel(labels.buy), sell: prefixLabel(labels.sell) },
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

function isMatchingCurrency(currency: Currency, expectedCurrency: Currency): boolean {
  const wrappedCurrency = getWrappedToken(currency)
  const wrappedExpectedCurrency = getWrappedToken(expectedCurrency)

  return (
    wrappedCurrency.chainId === wrappedExpectedCurrency.chainId &&
    areAddressesEqual(wrappedCurrency.address, wrappedExpectedCurrency.address)
  )
}

function isMatchingOpenLimitOrder(order: Order, inputCurrency: Currency, outputCurrency: Currency): boolean {
  if (order.status !== OrderStatus.PENDING || order.isHidden || getUiOrderType(order) !== UiOrderType.LIMIT) {
    return false
  }

  return (
    (isMatchingCurrency(order.inputToken, inputCurrency) && isMatchingCurrency(order.outputToken, outputCurrency)) ||
    (isMatchingCurrency(order.inputToken, outputCurrency) && isMatchingCurrency(order.outputToken, inputCurrency))
  )
}
