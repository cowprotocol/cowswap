import { UiOrderType } from '@cowprotocol/types'

export enum ToastMessageType {
  SWAP_ETH_FLOW_SENT_TX = 'SWAP_ETH_FLOW_SENT_TX',
  ORDER_CREATED = 'ORDER_CREATED',
  SWAP_SIGNING_ERROR = 'SWAP_SIGNING_ERROR',
  ORDER_FULFILLED = 'ORDER_FULFILLED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_EXPIRED = 'ORDER_EXPIRED',
  ORDER_PRESIGNED = 'ORDER_PRESIGNED',
  ONCHAIN_TRANSACTION_MINED = 'ONCHAIN_TRANSACTION_MINED',
  ONCHAIN_TRANSACTION_FAILED = 'ONCHAIN_TRANSACTION_FAILED',
}

export interface ToastMessagePayloads {
  [ToastMessageType.SWAP_ETH_FLOW_SENT_TX]: {
    tx: string
  }

  [ToastMessageType.ORDER_CREATED]: {
    orderUid: string
    orderType: UiOrderType
    orderCreationHash?: string
  }

  [ToastMessageType.SWAP_SIGNING_ERROR]: {
    type: 'REJECTED' | 'ERROR_SIGNING'
    errorCode?: number
    message: string
  }

  [ToastMessageType.ORDER_FULFILLED]: {
    orderUid: string
    orderType: UiOrderType
  }

  [ToastMessageType.ORDER_CANCELLED]: {
    orderUid: string
    orderType: UiOrderType
  }

  [ToastMessageType.ORDER_EXPIRED]: {
    orderUid: string
    orderType: UiOrderType
  }

  [ToastMessageType.ORDER_PRESIGNED]: {
    orderUid: string
    orderType: UiOrderType
  }

  [ToastMessageType.ONCHAIN_TRANSACTION_MINED]: {
    transactionHash: string
  }

  [ToastMessageType.ONCHAIN_TRANSACTION_FAILED]: {
    transactionHash: string
  }
}

export interface BaseToastMessagePayload<T extends ToastMessageType> {
  /**
   * The type of the toast message
   */
  messageType: T

  /**
   * Plain text message to be displayed.
   */
  message: string

  /**
   * Additional data to be used to create your own message.
   */
  data: ToastMessagePayloads[T]
}

/**
 * The payload of the `onToastMessage` event.
 *
 * The type is:
 *
 * export type OnToastMessagePayload =
 *     | BaseToastMessagePayload<ToastMessageType.SWAP_ETH_FLOW_SENT_TX>
 *     | BaseToastMessagePayload<ToastMessageType.SWAP_ORDER_CANCELLED>
 *     ... all other toast message types
 *
 * But is defined automatically using some TypeScript magic. To see how we got here, check:
 *    https://github.com/cowprotocol/cowswap/pull/3813#discussion_r1484752100
 */
export type OnToastMessagePayload = {
  [K in keyof typeof ToastMessageType]: BaseToastMessagePayload<(typeof ToastMessageType)[K]>
}[keyof typeof ToastMessageType]
