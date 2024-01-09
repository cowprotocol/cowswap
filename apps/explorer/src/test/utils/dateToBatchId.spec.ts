import { addMinutes } from 'date-fns'

import * as testHelpers from '../testHelpers'
import { dateToBatchId } from 'utils'
import { BATCH_ID, DATE } from '../data'

beforeAll(() => {
  testHelpers.mockTimes()
})

describe('dateToBatchId', () => {
  it('returns current batchId when no params', () => {
    expect(dateToBatchId()).toBe(BATCH_ID)
  })
  it('returns next batch id when exact time is set for next batch', () => {
    const fiveMinutesInTheFuture = addMinutes(DATE, 5)
    expect(dateToBatchId(fiveMinutesInTheFuture)).toBe(BATCH_ID + 1)
  })
  it('returns next batch id when time is set for middle of next batch', () => {
    const eightMinutesInTheFuture = addMinutes(DATE, 8)
    expect(dateToBatchId(eightMinutesInTheFuture)).toBe(BATCH_ID + 1)
  })
  it('returns previous batch id when time is set for middle of previous batch', () => {
    const threeMinutesInThePast = addMinutes(DATE, -3)
    expect(dateToBatchId(threeMinutesInThePast)).toBe(BATCH_ID - 1)
  })
})
