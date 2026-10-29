import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { Order } from 'legacy/state/orders/actions'

import { Routes } from 'common/constants/routes'
import { parameterizeTradeRoute, TRADE_URL_PRICE_PERCENTAGE_KEY } from 'common/modules/tradeNavigation'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import { getCurrencyId } from './getCurrencyId.utils'

interface TakeProfitOrder {
  inputAmount: CurrencyAmount<Token>
  outputCurrency: Token
}

export function getTakeProfitNavigation(order: TakeProfitOrder, percentage: string | null): string {
  const { inputAmount, outputCurrency } = order
  const pathname = parameterizeTradeRoute(
    {
      chainId: String(inputAmount.currency.chainId),
      inputCurrencyAmount: inputAmount.toExact(),
      outputCurrencyAmount: undefined,
      orderKind: OrderKind.SELL,
      inputCurrencyId: getCurrencyId(inputAmount.currency),
      outputCurrencyId: getCurrencyId(outputCurrency),
    },
    Routes.LIMIT_ORDERS,
    true,
  )
  const [path, search] = pathname.split('?')
  const params = new URLSearchParams(search)
  params.set(TRADE_URL_PRICE_PERCENTAGE_KEY, percentage ?? 'custom')
  return `${path}?${params.toString()}`
}

export function getTakeProfitOrder(order: Order): TakeProfitOrder | null {
  if (order.class !== OrderClass.MARKET || getIsCustomRecipient(order) || getIsBridgeOrder(order)) return null

  const { executedBuyAmount, executedSellAmount } = order.apiAdditionalInfo ?? {}
  if (!executedBuyAmount || !executedSellAmount) return null

  const inputAmount = CurrencyAmount.fromRawAmount(order.outputToken, executedBuyAmount)
  const outputAmount = CurrencyAmount.fromRawAmount(order.inputToken, executedSellAmount)
  if (!inputAmount.greaterThan(0) || !outputAmount.greaterThan(0)) return null

  return {
    inputAmount,
    outputCurrency: outputAmount.currency,
  }
}
