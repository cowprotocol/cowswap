import { OrderStatus } from '@cowprotocol/cow-sdk'

import { toMinutesLeft, type TwapProgress } from './twapProgress'

import type { OpenOrder } from '../api/openOrders'

import { formatDuration } from '@/shared/lib/format'

const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 })

/** `Expires in 28 min`, or `25% filled · 6h left` once partly filled. `now` in unix seconds */
export function formatOrderProgress(
  { filledFraction, validTo }: Pick<OpenOrder, 'filledFraction' | 'validTo'>,
  now: number,
): string {
  const filled = filledFraction > 0 ? `${percentFormatter.format(filledFraction)} filled` : null

  if (validTo <= now) {
    return filled ? `${filled} · Expired` : 'Expired'
  }

  const timeLeft = formatDuration(toMinutesLeft(validTo - now))

  return filled ? `${filled} · ${timeLeft} left` : `Expires in ${timeLeft}`
}

/** `now` in unix seconds */
export function getOrderStatusLabel(
  { status, validTo }: Pick<OpenOrder, 'status' | 'validTo'>,
  twapProgress: TwapProgress | null,
  now: number,
): string {
  if (status === OrderStatus.PRESIGNATURE_PENDING) return 'Awaiting signature'
  if (twapProgress) return twapProgress.isScheduled ? 'Scheduled' : 'Open'

  return validTo <= now ? 'Expired' : 'Open'
}
