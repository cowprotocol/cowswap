import { captureEvent } from '@sentry/browser'
import { SentryEvents } from 'cow-react/sentry/events'
import { Milliseconds } from 'types'

import { OrderExpiryWarningTier } from './getOrderExpiryWarningTier.utils'

export interface OrderExpiryWarningAcknowledgementInfo {
  isAccepted: boolean
  tier: OrderExpiryWarningTier
  deadlineDurationMs: Milliseconds
  chainId: number
  account: string | undefined
}

export function logOrderExpiryWarningAcknowledgement(info: OrderExpiryWarningAcknowledgementInfo): string {
  return captureEvent({
    message: SentryEvents.LIMIT_ORDER_EXPIRY_WARNING_ACKNOWLEDGEMENT,
    level: 'log',
    tags: {
      orderExpiryWarningTier: info.tier,
      orderExpiryWarningAccepted: String(info.isAccepted),
    },
    extra: {
      isAccepted: info.isAccepted,
      tier: info.tier,
      deadlineDurationMs: info.deadlineDurationMs,
      deadlineDurationDays: Math.round(info.deadlineDurationMs / 86_400_000),
      chainId: info.chainId.toString(),
      account: info.account,
    },
  })
}
