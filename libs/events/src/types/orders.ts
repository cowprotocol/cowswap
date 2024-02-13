export interface OnPostedOrderPayload {
  orderUid: string
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}

export interface OnExecutedOrderPayload {
  orderUid: string
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}

export interface OnRejectedOrderPayload {
  orderUid: string
  reason: string
  errorCode?: number
  // TODO: Potentially add all order info here, but lets keep it minimal for now
}
