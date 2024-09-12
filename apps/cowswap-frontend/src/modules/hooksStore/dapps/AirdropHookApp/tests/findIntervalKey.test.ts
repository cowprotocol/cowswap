import { findIntervalKey } from '../hooks/useClaimData'

describe('findIntervalKey', () => {
  const testIntervals = {
    b: 'c',
    d: 'e',
    g: 'h',
  }

  const expectedResults = [
    { name: 'e', expectedOutput: 'd', testName: 'should return the correct interval key' },
    {
      name: 'bcdefg',
      expectedOutput: 'b',
      testName: 'should return the correct interval key for strings with different sizes',
    },
    { name: 'g', expectedOutput: 'g', testName: 'should return the correct interval key if equal to interval border' },
    {
      name: 'a',
      expectedOutput: undefined,
      testName: 'should return undefined if name is smaller than the smallest interval',
    },
    { name: 'f', expectedOutput: undefined, testName: 'should return undefined if name is between intervals' },
    {
      name: 'z',
      expectedOutput: undefined,
      testName: 'should return undefined if name is greater than the greatest interval',
    },
  ]

  expectedResults.forEach(({ name, expectedOutput, testName }) => {
    it(testName, () => {
      expect(findIntervalKey(name, testIntervals)).toEqual(expectedOutput)
    })
  })
})
