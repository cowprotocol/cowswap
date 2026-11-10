export enum SentryEvents {
  NATIVE_TOKEN_SENDING_INTENTION = 'Native token sending intention',
  NATIVE_TOKEN_SENDING_TRANSACTION = 'Native token sending transaction',
  LIMIT_ORDER_EXPIRY_WARNING_ACKNOWLEDGEMENT = 'Limit order expiry warning acknowledgement',
}

export const NO_DEDUP_EVENTS: string[] = [
  SentryEvents.NATIVE_TOKEN_SENDING_INTENTION,
  SentryEvents.NATIVE_TOKEN_SENDING_TRANSACTION,
  SentryEvents.LIMIT_ORDER_EXPIRY_WARNING_ACKNOWLEDGEMENT,
]
