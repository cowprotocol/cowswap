import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { Order, OrderFulfillmentData, OrderStatus } from 'legacy/state/orders/actions'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'
import { stringToCurrency } from 'legacy/state/swap/extension'
import { getOrderSubmitSummary } from 'legacy/utils/trade'

import { getOrder } from 'api/gnosisProtocol'
import { getIsComposableCowChildOrder } from 'utils/orderUtils/getIsComposableCowChildOrder'

type OrderID = string

export type OrderLogPopupMixData = OrderFulfillmentData | OrderID

export function computeOrderSummary({
  orderFromStore,
  orderFromApi,
  featureFlags,
}: {
  orderFromStore: Order
  orderFromApi: EnrichedOrder | null
  featureFlags: {
    swapZeroFee: boolean | undefined
  }
}) {
  // if we can find the order from the API
  // and our specific order exists in our state, let's use that
  if (orderFromApi) {
    const { sellAmount, buyAmount, executedBuyAmount, executedSellAmount } = orderFromApi

    const { inputToken, outputToken, status } = orderFromStore
    const isFulfilled = status === OrderStatus.FULFILLED

    if (!inputToken || !outputToken) return undefined

    const feeAmount = stringToCurrency(orderFromApi.feeAmount, inputToken)

    // don't show amounts in atoms
    const inputAmount = isFulfilled
      ? stringToCurrency(executedSellAmount, inputToken)
      : // sellAmount doesn't include the fee, so we add it back to not show a different value when the order is traded
        stringToCurrency(sellAmount, inputToken).add(feeAmount)
    const outputAmount = stringToCurrency(isFulfilled ? executedBuyAmount : buyAmount, outputToken)

    return getOrderSubmitSummary({
      fullAppData: orderFromStore.fullAppData,
      composableCowInfo: orderFromStore.composableCowInfo,
      class: orderFromStore.class,
      kind: orderFromStore.kind,
      account: orderFromStore.owner,
      inputAmount,
      outputAmount,
      feeAmount,
      recipient: orderFromStore.receiver || '',
      recipientAddressOrName: orderFromStore.receiver || '',
      featureFlags,
    })
  }

  console.log(`[state:orders:updater] computeFulfilledSummary::API data not yet in sync with blockchain`)

  return orderFromStore?.summary
}

type PopupData = {
  status: OrderTransitionStatus
  popupData?: OrderLogPopupMixData
}

export async function fetchOrderPopupData(
  orderFromStore: Order,
  chainId: ChainId,
  featureFlags: {
    swapZeroFee: boolean | undefined
  }
): Promise<PopupData | null> {
  // Skip EthFlow creating orders
  if (orderFromStore.status === OrderStatus.CREATING) {
    return null
  }
  // Get order from API
  let orderFromApi: EnrichedOrder | null = null
  try {
    const isComposableCowChildOrder = getIsComposableCowChildOrder(orderFromStore)
    // For ComposableCow child orders always request PROD order-book
    orderFromApi = await getOrder(chainId, orderFromStore.id, isComposableCowChildOrder ? 'prod' : undefined)
  } catch (e: any) {
    console.debug(
      `[PendingOrdersUpdater] Failed to fetch order popup data on chain ${chainId} for order ${orderFromStore.id}`
    )
    return null
  }
  const status = classifyOrder(orderFromApi)

  let popupData = undefined

  switch (status) {
    case 'fulfilled':
      popupData = {
        id: orderFromStore.id,
        fulfillmentTime: new Date().toISOString(),
        transactionHash: '', // there's no need  for a txHash as we'll link the notification to the Explorer
        summary: computeOrderSummary({ featureFlags, orderFromStore, orderFromApi }),
        apiAdditionalInfo: orderFromApi
          ? {
              ...orderFromApi,
            }
          : undefined,
      }
      break
    case 'expired':
    case 'cancelled':
    case 'presigned':
      popupData = orderFromStore.id
      break
    default:
      // No popup for other states
      break
  }

  return { status, popupData }
}
