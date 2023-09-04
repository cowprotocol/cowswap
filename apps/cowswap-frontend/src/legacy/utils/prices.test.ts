import { Percent } from '@uniswap/sdk-core'

import { warningSeverity } from './prices'

describe('prices', () => {
  describe('#warningSeverity', () => {
    it('max for undefined', () => {
      expect(warningSeverity(undefined)).toEqual(4)
    })
    it('correct for -1', () => {
      expect(warningSeverity(new Percent(-1))).toEqual(-1)
    })
    it('correct for 0', () => {
      expect(warningSeverity(new Percent(0))).toEqual(0)
    })
    it('correct for 0.5', () => {
      expect(warningSeverity(new Percent(5, 1000))).toEqual(0)
    })
    it('correct for 5', () => {
      expect(warningSeverity(new Percent(5, 100))).toEqual(2)
    })
    it('correct for 50', () => {
      expect(warningSeverity(new Percent(5, 10))).toEqual(4)
    })
  })
})
