import { getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { Order } from 'legacy/state/orders/actions'

import { LimitOrderDraft } from 'modules/limitOrderDraft'

import { Routes } from 'common/constants/routes'
import { parameterizeTradeRoute } from 'common/modules/tradeNavigation'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

interface TakeProfitOrder {
  inputAmount: CurrencyAmount<Token>
  outputCurrency: Token
}

export function getTakeProfitNavigation(
  order: TakeProfitOrder,
  percentage: string | null,
): { path: string; draft: LimitOrderDraft } {
  const { inputAmount, outputCurrency } = order
  const path = parameterizeTradeRoute(
    {
      chainId: String(inputAmount.currency.chainId),
      inputCurrencyAmount: undefined,
      outputCurrencyAmount: undefined,
      orderKind: OrderKind.SELL,
      inputCurrencyId: getIsNativeToken(inputAmount.currency.chainId, inputAmount.currency.address)
        ? inputAmount.currency.symbol
        : inputAmount.currency.address,
      outputCurrencyId: getIsNativeToken(outputCurrency.chainId, outputCurrency.address)
        ? outputCurrency.symbol
        : outputCurrency.address,
    },
    Routes.LIMIT_ORDERS,
  )
  const draft: LimitOrderDraft = {
    ...order,
    price: percentage === null ? { type: 'custom' } : { type: 'percentage', value: percentage },
  }
  return { path, draft }
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
