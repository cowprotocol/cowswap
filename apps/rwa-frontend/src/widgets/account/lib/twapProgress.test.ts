import { getTwapProgress } from './twapProgress'

const SCHEDULE = { startTime: 1_790_000_000, interval: 3600, partsCount: 10 }

describe('getTwapProgress', () => {
  it('counts down to the first part before the TWAP starts', () => {
    expect(getTwapProgress(SCHEDULE, SCHEDULE.startTime - 2 * 3600)).toEqual({
      isScheduled: true,
      part: 1,
      partsCount: 10,
      minutesLeft: 120,
      isLastPart: false,
    })
  })

  it('counts down to the next part', () => {
    expect(getTwapProgress(SCHEDULE, SCHEDULE.startTime + 3 * 3600 - 24 * 60)).toEqual({
      isScheduled: false,
      part: 4,
      partsCount: 10,
      minutesLeft: 24,
      isLastPart: false,
    })
  })

  it('rounds a part that starts within a minute up to one minute', () => {
    expect(getTwapProgress(SCHEDULE, SCHEDULE.startTime + 3600 - 5).minutesLeft).toBe(1)
  })

  it('counts down to the end of the last part', () => {
    expect(getTwapProgress(SCHEDULE, SCHEDULE.startTime + 9 * 3600 + 48 * 60)).toEqual({
      isScheduled: false,
      part: 10,
      partsCount: 10,
      minutesLeft: 12,
      isLastPart: true,
    })
  })
})
