import { getMaxTwapPartsForDeadline } from './getMaxTwapPartsForDeadline'
import { isPartTimeIntervalTooShort } from './isPartTimeIntervalTooShort'

import { MINIMUM_PART_TIME } from '../const'

describe('getMaxTwapPartsForDeadline', () => {
  it.each([300, 301, 599, 600, 899, 900, 3600])(
    'returns the highest valid parts count for %s seconds',
    (deadlineSeconds) => {
      const maxParts = getMaxTwapPartsForDeadline(deadlineSeconds)
      const intervalAtMax = Math.ceil(deadlineSeconds / maxParts)
      const intervalWithOneMorePart = Math.ceil(deadlineSeconds / (maxParts + 1))

      expect(isPartTimeIntervalTooShort(intervalAtMax)).toBe(false)
      expect(isPartTimeIntervalTooShort(intervalWithOneMorePart)).toBe(true)
    },
  )

  it('returns 1 for non-positive durations', () => {
    expect(getMaxTwapPartsForDeadline(0)).toBe(1)
    expect(getMaxTwapPartsForDeadline(-100)).toBe(1)
  })

  it('returns 12 parts for one hour deadline with 5 minutes minimum part time', () => {
    expect(getMaxTwapPartsForDeadline(3600)).toBe(12)
    expect(MINIMUM_PART_TIME).toBe(300)
  })
})
