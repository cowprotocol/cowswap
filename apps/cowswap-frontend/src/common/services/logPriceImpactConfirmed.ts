import { captureEvent } from '@sentry/browser'
import { SentryEvents } from 'cow-react/sentry/events'

export interface PriceImpactConfirmedInfo {
  priceImpact: string
  isBridge: boolean
  isCritical: boolean
}

export function logPriceImpactConfirmed(info: PriceImpactConfirmedInfo): string {
  return captureEvent({
    message: SentryEvents.PRICE_IMPACT_CONFIRMED,
    level: 'log',
    extra: {
      priceImpact: info.priceImpact,
      isBridge: info.isBridge,
      isCritical: info.isCritical,
    },
  })
}
