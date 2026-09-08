import { TEST_IDS } from './index'

describe('TEST_IDS', () => {
  it('has no duplicate values', () => {
    const values = Object.values(TEST_IDS)
    expect(new Set(values).size).toBe(values.length)
  })
})
