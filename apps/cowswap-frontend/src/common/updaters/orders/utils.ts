import { EnrichedOrder, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'

import { getOrder } from 'api/cowProtocol'
import { getIsComposableCowChildOrder } from 'utils/orderUtils/getIsComposableCowChildOrder'

import { UltimateOrderData } from '../../hooks/useUltimateOrder'
import { TradeAmounts } from '../../types'

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

  // Executed swap order
  if (isFulfilled) {
    return {
      inputAmount: stringToCurrency(executedSellAmount, inputToken),
      outputAmount: stringToCurrency(executedBuyAmount, outputToken),
    }
  }

  const sellAmount = genericOrder.sellAmount
  const feeAmount = genericOrder.feeAmount
  const buyAmount = genericOrder.buyAmount

  // Any other swap orders
  return {
    inputAmount: stringToCurrency(sellAmount, inputToken).add(stringToCurrency(feeAmount, inputToken)),
    outputAmount: stringToCurrency(buyAmount, outputToken),
  }
}

function stringToCurrency(amount: string, currency: Currency): CurrencyAmount<Currency> {
  return CurrencyAmount.fromRawAmount(currency, amount)
}

type PopupData = {
  status: OrderTransitionStatus
  order: EnrichedOrder
}

export async function fetchAndClassifyOrder(orderFromStore: Order, chainId: ChainId): Promise<PopupData | null> {
  // Skip EthFlow creating orders
  if (orderFromStore.status === OrderStatus.CREATING) {
    return null
  }

  try {
    const isComposableCowChildOrder = getIsComposableCowChildOrder(orderFromStore)
    // For ComposableCow child orders always request PROD order-book
    const order = await getOrder(chainId, orderFromStore.id, isComposableCowChildOrder ? 'prod' : undefined)

    if (!order) return null

    const status = classifyOrder(order)

    return { status, order }
  } catch {
    console.debug(
      `[PendingOrdersUpdater] Failed to fetch order popup data on chain ${chainId} for order ${orderFromStore.id}`,
    )
    return null
  }
}
