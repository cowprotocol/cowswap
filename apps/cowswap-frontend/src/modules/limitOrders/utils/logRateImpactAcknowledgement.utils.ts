import { captureEvent } from '@sentry/browser'
import { SentryEvents } from 'cow-react/sentry/events'

export interface RateImpactAcknowledgementInfo {
  isAccepted: boolean
  rateImpact: number
  chainId: number
  account: string | undefined
}

export function logRateImpactAcknowledgement(info: RateImpactAcknowledgementInfo): string {
  return captureEvent({
    message: SentryEvents.LIMIT_ORDER_RATE_IMPACT_ACKNOWLEDGEMENT,
    level: 'log',
    tags: {
      rateImpactAccepted: String(info.isAccepted),
    },
    extra: {
      isAccepted: info.isAccepted,
      rateImpact: info.rateImpact,
      chainId: info.chainId.toString(),
      account: info.account,
    },
  })
}
