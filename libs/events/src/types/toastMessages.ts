export enum ToastMessageType {
  SWAP_ETH_FLOW_SENT_TX = 'SWAP_ETH_FLOW_SENT_TX',
  SWAP_POSTED_API = 'SWAP_POSTED_API',
  SWAP_SIGNING_ERROR = 'SWAP_SIGNING_ERROR',
  SWAP_TRADE_EXECUTED = 'SWAP_TRADE_EXECUTED',
  SWAP_ORDER_CANCELLED = 'SWAP_ORDER_CANCELLED',
}

export interface ToastMessagePayloads {
  [ToastMessageType.SWAP_ETH_FLOW_SENT_TX]: {
    tx: string
  }

  [ToastMessageType.SWAP_POSTED_API]: {
    orderUid: string
    orderCreationHash?: string
  }

  [ToastMessageType.SWAP_SIGNING_ERROR]: {
    type: 'REJECTED' | 'ERROR_SIGNING'
    errorCode?: number
    message: string
  }

  [ToastMessageType.SWAP_TRADE_EXECUTED]: {
    orderUid: string
    // TODO: Potentially add all trade info here, but lets keep it minimal for now
  }

  [ToastMessageType.SWAP_ORDER_CANCELLED]: {
    orderUid: string
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
