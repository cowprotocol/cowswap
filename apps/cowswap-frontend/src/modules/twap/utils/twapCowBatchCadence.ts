import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'
import { getCowBatchValidFrom } from '@cowprotocol/common-utils'

import { DEFAULT_NUM_OF_PARTS, MAX_PART_TIME } from '../const'
import { TWAPOrder } from '../types'

export interface GetTwapCowBatchCadenceSuggestionParams {
  /** Seconds. */
  totalDuration: number
  currentParts: number
  isPartsCountAllowed: (parts: number) => boolean
}

export interface TwapCowBatchCadenceSuggestion {
  parts: number
  /** Seconds. */
  partTime: number
}

export function getTwapCowBatchCadenceSuggestion({
  totalDuration,
  currentParts,
  isPartsCountAllowed,
}: GetTwapCowBatchCadenceSuggestionParams): TwapCowBatchCadenceSuggestion | null {
  if (totalDuration <= 0 || currentParts < 1) return null
  if (isTwapPartTimeOnCowBatchCadence(getPartTime(totalDuration, currentParts))) return null

  const maxParts = Math.floor(totalDuration / COW_BATCH_TIME_SECONDS)
  let best: TwapCowBatchCadenceSuggestion | null = null

  for (let parts = DEFAULT_NUM_OF_PARTS; parts <= maxParts; parts++) {
    const partTime = getPartTime(totalDuration, parts)

    if (!isTwapPartTimeOnCowBatchCadence(partTime) || partTime > MAX_PART_TIME) continue
    if (!isPartsCountAllowed(parts)) continue

    // Ascending loop + strict `<` keeps the smaller count on a tie
    if (!best || Math.abs(parts - currentParts) < Math.abs(best.parts - currentParts)) {
      best = { parts, partTime }
    }
  }

  return best
}

/** @param partTime - Seconds. */
export function isTwapPartTimeOnCowBatchCadence(partTime: number): boolean {
  return partTime > 0 && partTime % COW_BATCH_TIME_SECONDS === 0
}

/**
 * Aligns the order start with the next canonical CoW batch when its part time is on cadence.
 * @param nowSec - Server-adjusted unix seconds.
 */
export function withTwapCowBatchStartTime(order: TWAPOrder, nowSec: number): TWAPOrder {
  if (!isTwapPartTimeOnCowBatchCadence(order.timeInterval)) return order

  return { ...order, startTime: getCowBatchValidFrom(nowSec) }
}

function getPartTime(totalDuration: number, parts: number): number {
  return Math.ceil(totalDuration / parts)
}
