import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'

import { getCowBatchValidFrom, getServerNowSec } from './getCowBatchValidFrom'

describe('getCowBatchValidFrom', () => {
  const INTERVAL = COW_BATCH_TIME_SECONDS

  it('returns now + batch time when already on a batch boundary', () => {
    expect(getCowBatchValidFrom(INTERVAL)).toBe(INTERVAL * 2)
  })

  it('rounds down to the previous batch boundary after adding batch time', () => {
    // now=1 → now+300=301 → floor → 300
    expect(getCowBatchValidFrom(1)).toBe(INTERVAL)
  })

  it('rolls to the next interval when the floored value is not in the future', () => {
    // now just under a boundary after add would still land on current boundary if we only floored
    // without the <= guard; with now=INTERVAL-1: floor((INTERVAL-1+INTERVAL)/INTERVAL)*INTERVAL = INTERVAL
    expect(getCowBatchValidFrom(INTERVAL - 1)).toBe(INTERVAL)
  })

  it('never returns a timestamp in the past or equal to now', () => {
    for (const now of [0, 1, INTERVAL - 1, INTERVAL, INTERVAL + 1, INTERVAL * 3 + 17]) {
      expect(getCowBatchValidFrom(now)).toBeGreaterThan(now)
    }
  })

  it('aligns to the given batch interval', () => {
    const custom = 60
    expect(getCowBatchValidFrom(10, custom)).toBe(60)
    expect(getCowBatchValidFrom(60, custom)).toBe(120)
  })
})

describe('getServerNowSec', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('subtracts the quote time offset from local now', () => {
    expect(getServerNowSec(120)).toBe(1_700_000_000 - 120)
  })

  it('treats undefined offset as 0', () => {
    expect(getServerNowSec(undefined)).toBe(1_700_000_000)
  })
})
