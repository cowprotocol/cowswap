import { normalizeError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

// import { backendEnv } from '@cowprotocol/common-utils'
// import { orderBookApi } from 'cowSdk'
import { z } from 'zod'

// const CANONICAL_BATCH_SCHEDULE_PATH = '/api/v1/canonical_batch_schedule'
/** Temporary until canonical_batch_schedule is on the env-resolved orderbook host. */
const CANONICAL_BATCH_SCHEDULE_URL = 'https://barn.api.cow.fi/linea/api/v1/canonical_batch_schedule'

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
  // Temporary: the schedule endpoint only exists on barn Linea.
  if (chainId !== SupportedChainId.LINEA) {
    throw new Error(`canonical_batch_schedule is not available on chain ${chainId}`)
  }

  // const baseUrl = getOrderBookBaseUrl(chainId)
  // const response = await fetch(`${baseUrl}${CANONICAL_BATCH_SCHEDULE_PATH}`)
  const response = await fetch(CANONICAL_BATCH_SCHEDULE_URL)

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

// /** `getApiBaseUrls` is private; `getOrderLink` is the public resolver for the same base. */
// function getOrderBookBaseUrl(chainId: SupportedChainId): string {
//   const orderLink = orderBookApi.getOrderLink('', { chainId, env: backendEnv })
//   const ordersPath = '/api/v1/orders/'
//   const ordersPathIndex = orderLink.lastIndexOf(ordersPath)
//
//   if (ordersPathIndex === -1) {
//     throw normalizeError(new Error(`canonical_batch_schedule has no orderbook URL for chain ${chainId}`))
//   }
//
//   return orderLink.slice(0, ordersPathIndex)
// }
