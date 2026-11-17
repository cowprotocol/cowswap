import { toMinutesLeft } from './twapProgress'

import type { OpenOrder } from '../api/openOrders'

import { formatDuration } from '@/shared/lib/format'

const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 })

/** `Expires in 28 min`, or `25% filled · 6h left` once partly filled. `now` in unix seconds */
export function formatOrderProgress(
  { filledFraction, validTo }: Pick<OpenOrder, 'filledFraction' | 'validTo'>,
  now: number,
): string {
  const timeLeft = formatDuration(toMinutesLeft(validTo - now))

  return filledFraction > 0
    ? `${percentFormatter.format(filledFraction)} filled · ${timeLeft} left`
    : `Expires in ${timeLeft}`
}
