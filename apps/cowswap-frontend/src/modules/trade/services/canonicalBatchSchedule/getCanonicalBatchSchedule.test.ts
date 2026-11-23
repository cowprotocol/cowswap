import {
  CanonicalBatchSchedule,
  getOptimisticCanonicalBatchSchedule,
  mapCanonicalBatchSchedule,
} from './getCanonicalBatchSchedule'

const schedule: CanonicalBatchSchedule = {
  nextBatch: 1_700_000_240,
  nextBatchValidTo: 1_700_000_600,
  intervalSeconds: 300,
}

describe('mapCanonicalBatchSchedule', () => {
  it('uses nextBatch as the countdown target even when secondsUntilNextBatch differs', () => {
    expect(
      mapCanonicalBatchSchedule({
        intervalSeconds: 300,
        nextBatch: 1_700_000_240,
        secondsUntilNextBatch: 55,
        nextBatchValidTo: 1_700_000_900,
      }),
    ).toEqual({
      nextBatch: 1_700_000_240,
      nextBatchValidTo: 1_700_000_900,
      intervalSeconds: 300,
    })
  })

  it('takes nextBatchValidTo from the response', () => {
    const nextBatch = 1_700_000_240
    const intervalSeconds = 300
    const nextBatchValidTo = 1_700_000_900

    expect(
      mapCanonicalBatchSchedule({
        intervalSeconds,
        nextBatch,
        secondsUntilNextBatch: 55,
        nextBatchValidTo,
      }).nextBatchValidTo,
    ).toBe(nextBatchValidTo)
  })

  it('throws when the body is invalid', () => {
    const invalidBodies: unknown[] = [
      {},
      { nextBatch: 1_700_000_240, secondsUntilNextBatch: 55, intervalSeconds: 300 },
      { nextBatchValidTo: 1_700_000_900, secondsUntilNextBatch: 55, intervalSeconds: 300 },
      { nextBatch: 1_700_000_240, nextBatchValidTo: 1_700_000_900 },
      { nextBatch: 1_700_000_240, nextBatchValidTo: 1_700_000_900, intervalSeconds: 0 },
      { nextBatch: 1_700_000_240, nextBatchValidTo: 1_700_000_900, intervalSeconds: -300 },
    ]

    for (const body of invalidBodies) {
      expect(() => mapCanonicalBatchSchedule(body)).toThrow('canonical_batch_schedule response is invalid')
    }
  })
})

describe('getOptimisticCanonicalBatchSchedule', () => {
  it('keeps the schedule while the batch is still ahead', () => {
    expect(getOptimisticCanonicalBatchSchedule(schedule, 1_700_000_239_000)).toEqual(schedule)
  })

  it('steps one interval forward when the batch is due', () => {
    expect(getOptimisticCanonicalBatchSchedule(schedule, schedule.nextBatch * 1_000)).toEqual({
      nextBatch: schedule.nextBatch + schedule.intervalSeconds,
      nextBatchValidTo: schedule.nextBatchValidTo + schedule.intervalSeconds,
      intervalSeconds: schedule.intervalSeconds,
    })
  })

  it('steps across the intervals that passed before the refetch resolves', () => {
    const nowMs = (schedule.nextBatch + schedule.intervalSeconds + 10) * 1_000

    expect(getOptimisticCanonicalBatchSchedule(schedule, nowMs)).toEqual({
      nextBatch: schedule.nextBatch + schedule.intervalSeconds * 2,
      nextBatchValidTo: schedule.nextBatchValidTo + schedule.intervalSeconds * 2,
      intervalSeconds: schedule.intervalSeconds,
    })
  })
})
