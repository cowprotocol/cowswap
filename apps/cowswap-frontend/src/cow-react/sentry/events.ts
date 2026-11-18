export enum SentryEvents {
  NATIVE_TOKEN_SENDING_INTENTION = 'Native token sending intention',
  NATIVE_TOKEN_SENDING_TRANSACTION = 'Native token sending transaction',
  LIMIT_ORDER_EXPIRY_WARNING_ACKNOWLEDGEMENT = 'Limit order expiry warning acknowledgement',
  LIMIT_ORDER_RATE_IMPACT_ACKNOWLEDGEMENT = 'Limit order rate impact acknowledgement',
  PRICE_IMPACT_CONFIRMED = 'Price impact confirmed',
}

export const NO_DEDUP_EVENTS: string[] = [
  SentryEvents.NATIVE_TOKEN_SENDING_INTENTION,
  SentryEvents.NATIVE_TOKEN_SENDING_TRANSACTION,
  SentryEvents.LIMIT_ORDER_EXPIRY_WARNING_ACKNOWLEDGEMENT,
  SentryEvents.LIMIT_ORDER_RATE_IMPACT_ACKNOWLEDGEMENT,
  SentryEvents.PRICE_IMPACT_CONFIRMED,
]
