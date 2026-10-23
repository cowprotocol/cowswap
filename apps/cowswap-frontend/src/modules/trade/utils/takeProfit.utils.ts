import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { Order } from 'legacy/state/orders/actions'

import { LimitOrderDraft } from 'modules/limitOrderDraft'

import { Routes } from 'common/constants/routes'
import { parameterizeTradeRoute } from 'common/modules/tradeNavigation'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import { getCurrencyId } from './getCurrencyId.utils'

export function getTakeProfitDraft(order: Order): LimitOrderDraft | null {
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

export function getTakeProfitNavigation(
  order: LimitOrderDraft,
  percentage: string | null,
): { pathname: string; draft: LimitOrderDraft } {
  const { inputAmount, outputCurrency } = order
  const pathname = parameterizeTradeRoute(
    {
      chainId: String(inputAmount.currency.chainId),
      inputCurrencyAmount: undefined,
      outputCurrencyAmount: undefined,
      orderKind: OrderKind.SELL,
      inputCurrencyId: getCurrencyId(inputAmount.currency),
      outputCurrencyId: getCurrencyId(outputCurrency),
    },
    Routes.LIMIT_ORDERS,
  )
  const draft: LimitOrderDraft = {
    ...order,
    price: percentage === null ? { type: 'custom' } : { type: 'percentage', value: percentage },
  }
  return { pathname, draft }
}
