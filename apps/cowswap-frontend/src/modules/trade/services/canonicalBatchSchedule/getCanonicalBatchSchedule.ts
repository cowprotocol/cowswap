import { backendEnv, normalizeError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'
import { z } from 'zod'

const CANONICAL_BATCH_SCHEDULE_PATH = '/api/v1/canonical_batch_schedule'

const unixSecondsSchema = z.number().finite()

/** Orderbook fields we keep; extra JSON keys such as `secondsUntilNextBatch` are stripped. */
const canonicalBatchScheduleSchema = z.object({
  nextBatch: unixSecondsSchema,
  /** Earliest signed `validTo` that still clears the next canonical batch, including a skipped one and accounting for min validity. */
  nextBatchValidTo: unixSecondsSchema,
  intervalSeconds: z.number().finite().positive(),
})

/** Canonical batch used as the countdown and as the `validTo` anchor. */
export type CanonicalBatchSchedule = z.infer<typeof canonicalBatchScheduleSchema>

export async function fetchCanonicalBatchSchedule(chainId: SupportedChainId): Promise<CanonicalBatchSchedule> {
  const response = await fetch(`${getOrderBookBaseUrl(chainId)}${CANONICAL_BATCH_SCHEDULE_PATH}`)

  if (!response.ok) {
    throw new Error(`canonical_batch_schedule failed with ${response.status}`)
  }

  return mapCanonicalBatchSchedule(await response.json())
}

/**
 * Once `nextBatch` is due, step it and `nextBatchValidTo` forward by whole intervals.
 * Callers keep a future batch while the refetch is still in flight. The offset between the two
 * timestamps stays put, because the orderbook already baked min validity into `nextBatchValidTo`.
 */
export function getOptimisticCanonicalBatchSchedule(
  schedule: CanonicalBatchSchedule,
  nowMs: number = Date.now(),
): CanonicalBatchSchedule {
  const nowSec = Math.floor(nowMs / 1000)

  if (nowSec < schedule.nextBatch) {
    return schedule
  }

  const elapsedIntervals = Math.floor((nowSec - schedule.nextBatch) / schedule.intervalSeconds) + 1
  const shiftSeconds = elapsedIntervals * schedule.intervalSeconds

  return {
    intervalSeconds: schedule.intervalSeconds,
    nextBatch: schedule.nextBatch + shiftSeconds,
    nextBatchValidTo: schedule.nextBatchValidTo + shiftSeconds,
  }
}

export function mapCanonicalBatchSchedule(response: unknown): CanonicalBatchSchedule {
  const parsed = canonicalBatchScheduleSchema.safeParse(response)

  if (!parsed.success) {
    throw normalizeError(new Error('canonical_batch_schedule response is invalid'))
  }

  return parsed.data
}

/** `getApiBaseUrls` is private; `getOrderLink` resolves the same base, including custom base URLs. */
function getOrderBookBaseUrl(chainId: SupportedChainId): string {
  const orderLink = orderBookApi.getOrderLink('', { chainId, env: backendEnv })
  const ordersPath = '/api/v1/orders/'
  const ordersPathIndex = orderLink.lastIndexOf(ordersPath)

  if (ordersPathIndex <= 0 || !orderLink.startsWith('http')) {
    throw normalizeError(new Error(`canonical_batch_schedule has no orderbook URL for chain ${chainId}`))
  }

  return orderLink.slice(0, ordersPathIndex)
}
