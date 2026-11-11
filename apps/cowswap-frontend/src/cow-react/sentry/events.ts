export enum SentryEvents {
  NATIVE_TOKEN_SENDING_INTENTION = 'Native token sending intention',
  NATIVE_TOKEN_SENDING_TRANSACTION = 'Native token sending transaction',
  PRICE_IMPACT_CONFIRMED = 'Price impact confirmed',
}

export const NO_DEDUP_EVENTS: string[] = [
  SentryEvents.NATIVE_TOKEN_SENDING_INTENTION,
  SentryEvents.NATIVE_TOKEN_SENDING_TRANSACTION,
  SentryEvents.PRICE_IMPACT_CONFIRMED,
]
