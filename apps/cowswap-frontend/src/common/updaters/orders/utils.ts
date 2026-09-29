import { EnrichedOrder, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { BridgeOrderData, Nullish, UiOrderType } from '@cowprotocol/types'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'

import { getOrder } from 'api/cowProtocol'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getIsComposableCowChildOrder } from 'utils/orderUtils/getIsComposableCowChildOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { UltimateOrderData } from '../../hooks/useUltimateOrder'
import { TradeAmounts } from '../../types'

export type OrderTransitionData = {
  status: OrderTransitionStatus
  order: EnrichedOrder
  orderType: UiOrderType
}

export type OrderTypesByUid = Record<string, UiOrderType>

export async function fetchAndClassifyOrder(
  orderFromStore: Order,
  chainId: ChainId,
): Promise<OrderTransitionData | null> {
  // Creating orders (EthFlow, Solana) aren't indexed by the order-book yet; _updateCreatingOrders handles those
  if (orderFromStore.status === OrderStatus.CREATING) {
    return null
  }

  try {
    const isComposableCowChildOrder = getIsComposableCowChildOrder(orderFromStore)
    // For ComposableCow child orders always request PROD order-book
    const order = await getOrder(chainId, orderFromStore.id, isComposableCowChildOrder ? 'prod' : undefined)

    if (!order) return null

    const status = classifyOrder(order)
    const orderType = getUiOrderType(orderFromStore)

    return { status, order, orderType }
  } catch {
    console.debug(
      `[PendingOrdersUpdater] Failed to fetch order popup data on chain ${chainId} for order ${orderFromStore.id}`,
    )
    return null
  }
}

/**
 * Not every order-book response carries `class`/`fullAppData` (e.g. Solana's), so the order type
 * must come from the already-classified `orderTypesByUid` map rather than being re-derived from
 * the fetched API order.
 */
export function getFulfilledOrderUidsForSurplusQueue(
  fulfilledOrders: EnrichedOrder[],
  orderTypesByUid: OrderTypesByUid,
): string[] {
  return fulfilledOrders
    .filter((order) => orderTypesByUid[order.uid] === UiOrderType.SWAP && !getIsBridgeOrder(order))
    .map((order) => order.uid)
}

export function getOrdersFromTransitionData(orderData: OrderTransitionData[]): EnrichedOrder[] {
  return orderData.map(({ order }) => order)
}

export function getOrderTypesByUid(orderData: OrderTransitionData[]): OrderTypesByUid {
  return orderData.reduce<OrderTypesByUid>((acc, { order, orderType }) => {
    acc[order.uid] = orderType
    return acc
  }, {})
}

export function getUltimateOrderTradeAmounts({
  orderFromStore,
  bridgeOrderFromStore,
  bridgeOrderFromApi,
}: UltimateOrderData): TradeAmounts {
  const genericOrder = orderFromStore.apiAdditionalInfo ?? orderFromStore
  const { status } = genericOrder

  const { inputToken, outputToken } = orderFromStore
  const executedBuyAmount = orderFromStore.apiAdditionalInfo?.executedBuyAmount
  const executedSellAmount = orderFromStore.apiAdditionalInfo?.executedSellAmount
  const isFulfilled = status === OrderStatus.FULFILLED && executedBuyAmount && executedSellAmount

  // Bridge order
  if (bridgeOrderFromStore) {
    return getBridgeTradeAmounts(bridgeOrderFromStore, bridgeOrderFromApi)
  }

  // Executed swap order
  if (isFulfilled) {
    return {
      inputAmount: stringToCurrency(executedSellAmount, inputToken),
      outputAmount: stringToCurrency(executedBuyAmount, outputToken),
    }
  }

  const sellAmount = genericOrder.sellAmount
  // Fee is undefined in Solana
  const feeAmount = genericOrder.feeAmount ?? '0'
  const buyAmount = genericOrder.buyAmount

  // Any other swap orders
  return {
    inputAmount: stringToCurrency(sellAmount, inputToken).add(stringToCurrency(feeAmount, inputToken)),
    outputAmount: stringToCurrency(buyAmount, outputToken),
  }
}

/**
 * Resolves the validTo to store once a creating order (EthFlow, Solana) is confirmed indexed by the
 * order-book. EthFlow's `userValidTo` is the most specific/authoritative source; the order-book's
 * generic `validTo` (present on every order, unlike `ethflowData`) covers everything else, including
 * Solana, whose order gets created with whatever the SDK originally quoted until this refresh.
 */
export function resolveValidToOnCreation(orderData: EnrichedOrder, storedValidTo: number): number {
  return orderData.ethflowData?.userValidTo || orderData.validTo || storedValidTo
}

function getBridgeTradeAmounts(
  bridgeOrderFromStore: BridgeOrderData,
  bridgeOrderFromApi?: Nullish<CrossChainOrder>,
): TradeAmounts {
  // Executed order
  if (bridgeOrderFromApi?.bridgingParams.outputAmount) {
    return {
      inputAmount: bridgeOrderFromStore.quoteAmounts.swapSellAmount,
      outputAmount: CurrencyAmount.fromRawAmount(
        bridgeOrderFromStore.quoteAmounts.bridgeMinReceiveAmount.currency,
        bridgeOrderFromApi.bridgingParams.outputAmount.toString(),
      ),
    }
  }

  return {
    inputAmount: bridgeOrderFromStore.quoteAmounts.swapSellAmount,
    outputAmount: bridgeOrderFromStore.quoteAmounts.bridgeMinReceiveAmount,
  }
}

function stringToCurrency(amount: string, currency: Currency): CurrencyAmount<Currency> {
  return CurrencyAmount.fromRawAmount(currency, amount)
}
