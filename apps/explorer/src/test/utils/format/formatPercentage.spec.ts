import BigNumber from 'bignumber.js'

import { formatPercentage } from '../../../utils'

const CASES = [
  { given: '0', result: '0%' },
  { given: '0.000000000001', result: '<0.01%' },
  { given: '0.00001', result: '<0.01%' },
  { given: '0.0001', result: '0.01%' },
  { given: '0.00015', result: '0.01%' },
  { given: '0.0012', result: '0.12%' },
  { given: '0.0123', result: '1.23%' },
  { given: '0.1234', result: '12.34%' },
  { given: '0.123456789', result: '12.34%' },
  { given: '0.5', result: '50%' },
  { given: '0.9', result: '90%' },
  { given: '0.99', result: '99%' },
  { given: '0.999', result: '99.9%' },
  { given: '0.9999', result: '99.99%' },
  { given: '0.99999', result: '>99.99%' },
  { given: '0.999999999999999', result: '>99.99%' },
]

describe('formatPercentage', () => {
  CASES.forEach(({ given, result }) => {
    it(`Given ${given}, when formats percentage, then expect ${result}`, async () => {
      const percentage = formatPercentage(new BigNumber(given))
      expect(percentage).toEqual(result)
    })
  })
})
