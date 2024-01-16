import { Percent } from '@uniswap/sdk-core'

import { calculateOrderExecutionStatus } from './index'

describe('calculateOrderExecutionStatus', () => {
  it('returns `undefined` when any parameter is missing', () => {
    expect(calculateOrderExecutionStatus(undefined)).toBe(undefined)
  })

  describe('veryClose', () => {
    test('-1%', () => {
      expect(calculateOrderExecutionStatus(new Percent(-1, 100))).toBe('veryClose')
    })
    test('0.1%', () => {
      expect(calculateOrderExecutionStatus(new Percent(1, 1_000))).toBe('veryClose')
    })
    test('0.49%', () => {
      expect(calculateOrderExecutionStatus(new Percent(49, 100_000))).toBe('veryClose')
    })
  })

  describe('close', () => {
    test('0.5%', () => {
      expect(calculateOrderExecutionStatus(new Percent(5, 1_000))).toBe('close')
    })
    test('1%', () => {
      expect(calculateOrderExecutionStatus(new Percent(1, 100))).toBe('close')
    })
    test('5%', () => {
      expect(calculateOrderExecutionStatus(new Percent(5, 100))).toBe('close')
    })
  })

  describe('notClose', () => {
    test('5.01%', () => {
      expect(calculateOrderExecutionStatus(new Percent(501, 10_000))).toBe('notClose')
    })
    test('10%', () => {
      expect(calculateOrderExecutionStatus(new Percent(1, 10))).toBe('notClose')
    })
  })
})
