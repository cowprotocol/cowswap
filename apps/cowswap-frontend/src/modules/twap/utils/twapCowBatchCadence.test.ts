import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'

import {
  getTwapCowBatchCadenceSuggestion,
  getTwapCowBatchStartTime,
  isTwapPartTimeOnCowBatchCadence,
  TWAP_COW_BATCH_MIN_START_LEAD,
  withTwapCowBatchStartTime,
} from './twapCowBatchCadence'

import { TWAPOrder } from '../types'

const MINUTE = 60
const HOUR = 60 * MINUTE

const allowAll = (): boolean => true

describe('isTwapPartTimeOnCowBatchCadence', () => {
  it('accepts whole multiples of the batch interval', () => {
    expect(isTwapPartTimeOnCowBatchCadence(COW_BATCH_TIME_SECONDS)).toBe(true)
    expect(isTwapPartTimeOnCowBatchCadence(15 * MINUTE)).toBe(true)
    expect(isTwapPartTimeOnCowBatchCadence(HOUR)).toBe(true)
    expect(isTwapPartTimeOnCowBatchCadence(24 * HOUR)).toBe(true)
  })

  it('rejects part times between batches', () => {
    expect(isTwapPartTimeOnCowBatchCadence(Math.ceil(HOUR / 7))).toBe(false)
    expect(isTwapPartTimeOnCowBatchCadence(8 * MINUTE)).toBe(false)
  })

  it('rejects non-positive part times', () => {
    expect(isTwapPartTimeOnCowBatchCadence(0)).toBe(false)
    expect(isTwapPartTimeOnCowBatchCadence(-COW_BATCH_TIME_SECONDS)).toBe(false)
  })
})

describe('getTwapCowBatchCadenceSuggestion', () => {
  it('returns null when the current split is already on cadence', () => {
    expect(
      getTwapCowBatchCadenceSuggestion({ totalDuration: HOUR, currentParts: 4, isPartsCountAllowed: allowAll }),
    ).toBeNull()
  })

  it('suggests the nearest part count on cadence', () => {
    // 1h / 7 parts = ~8.6 min; 6 parts (10 min) is nearer than 12 parts (5 min)
    expect(
      getTwapCowBatchCadenceSuggestion({ totalDuration: HOUR, currentParts: 7, isPartsCountAllowed: allowAll }),
    ).toEqual({ parts: 6, partTime: 10 * MINUTE })
  })

  it('prefers fewer parts when two candidates are equally near', () => {
    // 1h / 9 parts: candidates 6 (10 min) and 12 (5 min) are both 3 parts away
    expect(
      getTwapCowBatchCadenceSuggestion({ totalDuration: HOUR, currentParts: 9, isPartsCountAllowed: allowAll }),
    ).toEqual({ parts: 6, partTime: 10 * MINUTE })
  })

  it('skips part counts the caller does not allow', () => {
    const atMostFive = (parts: number): boolean => parts <= 5

    expect(
      getTwapCowBatchCadenceSuggestion({ totalDuration: HOUR, currentParts: 7, isPartsCountAllowed: atMostFive }),
    ).toEqual({ parts: 4, partTime: 15 * MINUTE })
  })

  it('returns null when no part count lands on cadence', () => {
    // 63 min: no split of 3780s yields a multiple of 300s with at least 2 parts
    expect(
      getTwapCowBatchCadenceSuggestion({
        totalDuration: 63 * MINUTE,
        currentParts: 4,
        isPartsCountAllowed: allowAll,
      }),
    ).toBeNull()
  })

  it('never suggests a single part', () => {
    // 15 min: 1 part (15 min) is on cadence but not a TWAP; 3 parts (5 min) is the only candidate
    expect(
      getTwapCowBatchCadenceSuggestion({
        totalDuration: 15 * MINUTE,
        currentParts: 4,
        isPartsCountAllowed: allowAll,
      }),
    ).toEqual({ parts: 3, partTime: 5 * MINUTE })
  })
})

describe('getTwapCowBatchStartTime', () => {
  const batch = 1_700_000_100

  it('returns the next batch when it is far enough ahead', () => {
    expect(getTwapCowBatchStartTime(batch - 120)).toBe(batch)
  })

  it('returns the next batch when the lead equals the minimum', () => {
    expect(getTwapCowBatchStartTime(batch - TWAP_COW_BATCH_MIN_START_LEAD)).toBe(batch)
  })

  it('skips to the batch after next when the next one is too close', () => {
    expect(getTwapCowBatchStartTime(batch - TWAP_COW_BATCH_MIN_START_LEAD + 1)).toBe(batch + COW_BATCH_TIME_SECONDS)
    expect(getTwapCowBatchStartTime(batch - 0.5)).toBe(batch + COW_BATCH_TIME_SECONDS)
  })

  it('returns the following batch when now is exactly on a boundary', () => {
    expect(getTwapCowBatchStartTime(batch)).toBe(batch + COW_BATCH_TIME_SECONDS)
  })
})

describe('withTwapCowBatchStartTime', () => {
  const order = { startTime: 0, timeInterval: 10 * MINUTE } as TWAPOrder

  it('snaps the start time to the next canonical batch when on cadence', () => {
    const now = 1_700_000_123

    expect(withTwapCowBatchStartTime(order, now).startTime).toBe(1_700_000_400)
  })

  it('leaves the order untouched when off cadence', () => {
    const offCadence = { ...order, timeInterval: Math.ceil(HOUR / 7) }

    expect(withTwapCowBatchStartTime(offCadence, 1_700_000_123)).toBe(offCadence)
  })
})
