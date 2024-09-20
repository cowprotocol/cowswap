import { EnrichedOrder, OrderKind } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents, OnToastMessagePayload, ToastMessagePayloads, ToastMessageType } from '@cowprotocol/events'
import { TokensByAddress } from '@cowprotocol/tokens'
import { TokenInfo } from '@cowprotocol/types'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import type { Order } from 'legacy/state/orders/actions'

export interface OrderInfo {
  owner: string
  kind: OrderKind
  receiver?: string
  inputAmount: bigint
  outputAmount: bigint
  inputToken: TokenInfo
  outputToken: TokenInfo
}

export function getToastMessageCallback(
  messageType: ToastMessageType,
  data: ToastMessagePayloads[typeof messageType],
): (toastMessage: string) => void {
  return (toastMessage: string) => {
    const payload = {
      messageType,
      message: toastMessage,
      data,
    }

    WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_TOAST_MESSAGE, payload as OnToastMessagePayload)
  }
}

export const isEnrichedOrder = (orderInfo: unknown): orderInfo is EnrichedOrder => {
  const order = orderInfo as EnrichedOrder

  return !!(order.sellToken && order.buyToken)
}

export const mapEnrichedOrderToInfo = (orderInfo: EnrichedOrder, allTokens: TokensByAddress): OrderInfo => {
  return {
    owner: orderInfo.owner,
    kind: orderInfo.kind,
    receiver: orderInfo.receiver || undefined,
    inputAmount: BigInt(orderInfo.sellAmount),
    outputAmount: BigInt(orderInfo.buyAmount),
    inputToken: allTokens[orderInfo.sellToken.toLowerCase()] as TokenInfo,
    outputToken: allTokens[orderInfo.buyToken.toLowerCase()] as TokenInfo,
  }
}

export const mapStoreOrderToInfo = (orderFromStore: Order): OrderInfo => {
  return {
    ...orderFromStore,
    inputAmount: BigInt(orderFromStore?.sellAmount),
    outputAmount: BigInt(orderFromStore?.buyAmount),
  } as OrderInfo
}
