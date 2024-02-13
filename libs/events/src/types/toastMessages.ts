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
    orderId: string
    // TODO: Potentially add all order info here, but lets keep it minimal for now
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

export type OnToastMessagePayload =
  | BaseToastMessagePayload<ToastMessageType.SWAP_ETH_FLOW_SENT_TX>
  | BaseToastMessagePayload<ToastMessageType.SWAP_ORDER_CANCELLED>
  | BaseToastMessagePayload<ToastMessageType.SWAP_POSTED_API>
  | BaseToastMessagePayload<ToastMessageType.SWAP_SIGNING_ERROR>
  | BaseToastMessagePayload<ToastMessageType.SWAP_TRADE_EXECUTED>
