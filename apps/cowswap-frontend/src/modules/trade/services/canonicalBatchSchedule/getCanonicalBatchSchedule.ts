import { normalizeError } from '@cowprotocol/common-utils'
import { ORDER_BOOK_PROD_CONFIG, ORDER_BOOK_STAGING_CONFIG, SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

/** Client-anchored view of the schedule for the countdown and order `validTo`. */
export interface CanonicalBatchSchedule {
  nextBatch: number
  countdownTargetEpochSec: number
  secondsUntilNextBatch: number
  nextBatchValidTo: number
  nextBatchExpiration: number
}

/**
 * TODO(orderbook canonical_batch_schedule): the live response should also include
 * `nextBatchValidTo` and `nextBatchExpiration`. Until that ships they are derived below
 * and the query uses `getMockCanonicalBatchSchedule` instead of `fetchCanonicalBatchSchedule`.
 * Delete the mock and the derivation once those fields are returned.
 */
export interface CanonicalBatchScheduleResponse {
  intervalSeconds: number
  nextBatch: number
  secondsUntilNextBatch: number
  /** Earliest signed `validTo` that still clears the next canonical batch, including a skipped one. */
  nextBatchValidTo?: number
  /** Unix seconds after which this schedule must be refetched. */
  nextBatchExpiration?: number
}

const CANONICAL_BATCH_SCHEDULE_PATH = '/api/v1/canonical_batch_schedule'

/** Temporary mock horizon until the schedule endpoint is deployed. Remove with the mock queryFn. */
const MOCK_SECONDS_UNTIL_NEXT_BATCH = 180

/**
 * Orderbook default `min_order_validity_period`.
 * TODO(orderbook): remove once `nextBatchValidTo` / `nextBatchExpiration` are on the response.
 */
const ORDERBOOK_MIN_ORDER_VALIDITY_SECONDS = 60

/** Slack before `nextBatchValidTo` so a refetch lands before the signed order would miss the batch. */
const NEXT_BATCH_REFRESH_BUFFER_SECONDS = 5

export async function fetchCanonicalBatchSchedule(chainId: SupportedChainId): Promise<CanonicalBatchSchedule> {
  const baseUrl = getOrderBookBaseUrl(chainId)
  const response = await fetch(`${baseUrl}${CANONICAL_BATCH_SCHEDULE_PATH}`)

  if (!response.ok) {
    throw new Error(`canonical_batch_schedule failed with ${response.status}`)
  }

  const body = (await response.json()) as CanonicalBatchScheduleResponse
  assertCanonicalBatchScheduleResponse(body)

  return mapCanonicalBatchSchedule(body)
}

export function getMockCanonicalBatchSchedule(nowMs: number = Date.now()): CanonicalBatchSchedule {
  // TODO(orderbook canonical_batch_schedule): delete this mock and call fetchCanonicalBatchSchedule.
  return mapCanonicalBatchSchedule(
    {
      intervalSeconds: MOCK_SECONDS_UNTIL_NEXT_BATCH,
      nextBatch: Math.floor(nowMs / 1000) + MOCK_SECONDS_UNTIL_NEXT_BATCH,
      secondsUntilNextBatch: MOCK_SECONDS_UNTIL_NEXT_BATCH,
    },
    nowMs,
  )
}

export function mapCanonicalBatchSchedule(
  response: CanonicalBatchScheduleResponse,
  nowMs: number = Date.now(),
): CanonicalBatchSchedule {
  const countdownTargetEpochSec = Math.floor(nowMs / 1000) + response.secondsUntilNextBatch
  // Survives missing the current batch: validTo must reach the following batch plus min validity.
  const derivedNextBatchValidTo = response.nextBatch + response.intervalSeconds + ORDERBOOK_MIN_ORDER_VALIDITY_SECONDS
  const nextBatchValidTo = response.nextBatchValidTo ?? derivedNextBatchValidTo
  const nextBatchExpiration =
    response.nextBatchExpiration ??
    nextBatchValidTo - ORDERBOOK_MIN_ORDER_VALIDITY_SECONDS - NEXT_BATCH_REFRESH_BUFFER_SECONDS

  return {
    nextBatch: response.nextBatch,
    secondsUntilNextBatch: response.secondsUntilNextBatch,
    countdownTargetEpochSec,
    nextBatchValidTo,
    nextBatchExpiration,
  }
}

function assertCanonicalBatchScheduleResponse(body: CanonicalBatchScheduleResponse): void {
  if (
    typeof body.intervalSeconds !== 'number' ||
    typeof body.nextBatch !== 'number' ||
    typeof body.secondsUntilNextBatch !== 'number'
  ) {
    throw normalizeError(new Error('canonical_batch_schedule response is invalid'))
  }
}

function getOrderBookBaseUrl(chainId: SupportedChainId): string {
  const { baseUrls, env } = orderBookApi.context
  const urls = baseUrls ?? (env === 'prod' ? ORDER_BOOK_PROD_CONFIG : ORDER_BOOK_STAGING_CONFIG)

  return urls[chainId]
}
