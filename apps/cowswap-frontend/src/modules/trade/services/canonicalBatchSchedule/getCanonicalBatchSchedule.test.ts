import { getMockCanonicalBatchSchedule, mapCanonicalBatchSchedule } from './getCanonicalBatchSchedule'

describe('mapCanonicalBatchSchedule', () => {
  it('anchors the countdown to the client clock using secondsUntilNextBatch', () => {
    const nowMs = 1_700_000_000_000

    expect(
      mapCanonicalBatchSchedule(
        {
          intervalSeconds: 300,
          nextBatch: 1_700_000_240,
          secondsUntilNextBatch: 55,
          nextBatchValidTo: 1_700_000_600,
          nextBatchExpiration: 1_700_000_535,
        },
        nowMs,
      ),
    ).toEqual({
      nextBatch: 1_700_000_240,
      secondsUntilNextBatch: 55,
      countdownTargetEpochSec: 1_700_000_000 + 55,
      nextBatchValidTo: 1_700_000_600,
      nextBatchExpiration: 1_700_000_535,
    })
  })

  it('derives nextBatchValidTo and nextBatchExpiration until the orderbook returns them', () => {
    const nowMs = 1_700_000_000_000
    const nextBatch = 1_700_000_240
    const intervalSeconds = 300

    expect(
      mapCanonicalBatchSchedule(
        {
          intervalSeconds,
          nextBatch,
          secondsUntilNextBatch: 55,
        },
        nowMs,
      ),
    ).toMatchObject({
      nextBatchValidTo: nextBatch + intervalSeconds + 60,
      nextBatchExpiration: nextBatch + intervalSeconds - 5,
    })
  })
})

describe('getMockCanonicalBatchSchedule', () => {
  it('returns a batch a few minutes ahead of now', () => {
    const nowMs = 1_700_000_000_000
    const schedule = getMockCanonicalBatchSchedule(nowMs)

    expect(schedule.secondsUntilNextBatch).toBe(180)
    expect(schedule.nextBatch).toBe(1_700_000_000 + 180)
    expect(schedule.countdownTargetEpochSec).toBe(1_700_000_000 + 180)
    expect(schedule.nextBatchValidTo).toBe(schedule.nextBatch + 180 + 60)
    expect(schedule.nextBatchExpiration).toBe(schedule.nextBatchValidTo - 60 - 5)
  })
})
