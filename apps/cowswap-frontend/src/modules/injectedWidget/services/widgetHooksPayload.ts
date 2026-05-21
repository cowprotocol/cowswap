import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { EnrichedOrder, OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { AtomsAndUnits, OnTradeParamsPayload } from '@cowprotocol/events'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'

import { Order } from 'legacy/state/orders/actions'

import { CancellableOrder } from 'common/utils/isOrderCancellable'

interface BuildTradeWidgetHookPayloadParams {
  orderType: UiOrderType
  inputAmount?: CurrencyAmount<Currency> | null
  outputAmount?: CurrencyAmount<Currency> | null
  recipient?: string | null
  orderKind?: OrderKind
  maximumSendSellAmount?: CurrencyAmount<Currency> | null
  minimumReceiveBuyAmount?: CurrencyAmount<Currency> | null
}

export function buildOrdersWidgetHookPayload(orders: CancellableOrder[]): EnrichedOrder[] {
  return orders.map((order) => {
    const candidate = order as { apiAdditionalInfo?: EnrichedOrder }

    return (candidate.apiAdditionalInfo || order) as EnrichedOrder
  })
}

export function buildOrderWidgetHookPayload(order: Order): EnrichedOrder {
  return (order.apiAdditionalInfo || order) as EnrichedOrder
}

export function buildTradeWidgetHookPayload({
  orderType,
  inputAmount,
  outputAmount,
  recipient,
  orderKind,
  maximumSendSellAmount,
  minimumReceiveBuyAmount,
}: BuildTradeWidgetHookPayloadParams): OnTradeParamsPayload {
  return {
    orderType,
    sellToken: currencyToTokenInfo(inputAmount?.currency),
    buyToken: currencyToTokenInfo(outputAmount?.currency),
    sellTokenAmount: currencyAmountToAtomsAndUnits(inputAmount),
    buyTokenAmount: currencyAmountToAtomsAndUnits(outputAmount),
    maximumSendSellAmount: currencyAmountToAtomsAndUnits(maximumSendSellAmount ?? inputAmount),
    minimumReceiveBuyAmount: currencyAmountToAtomsAndUnits(minimumReceiveBuyAmount ?? outputAmount),
    recipient: recipient || undefined,
    orderKind,
  }
}

function currencyAmountToAtomsAndUnits(currency?: CurrencyAmount<Currency> | null): AtomsAndUnits | undefined {
  if (!currency) return undefined

  return {
    atoms: BigInt(currency.quotient.toString()),
    units: currency.toExact(),
  }
}

function currencyToTokenInfo(currency?: Currency | null): TokenInfo | undefined {
  if (!currency) return undefined

  return {
    address: getCurrencyAddress(currency),
    chainId: currency.chainId,
    name: currency.name || '',
    decimals: currency.decimals,
    symbol: currency.symbol || '',
  }
}
