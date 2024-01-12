import BN from 'bn.js'
import { adjustAmountToLowerPrecision } from 'utils'

const higherPrecision = 4
const amount = new BN(12345) // 1.2345

test('equal precision', () => {
  const precision = 5

  expect(adjustAmountToLowerPrecision({ amount, higherPrecision: precision, lowerPrecision: precision })).toStrictEqual(
    amount,
  )
})

test('higher precision not higher than lower precision', () => {
  try {
    adjustAmountToLowerPrecision({ amount, higherPrecision: 1, lowerPrecision: 5 })
    fail('Should not reach')
  } catch (e) {
    expect(e.message).toMatch(/higherPrecision must be > lowerPrecision/)
  }
})

test('rounding down', () => {
  const lowerPrecision = 2
  const expected = new BN(123) // 1.23

  expect(adjustAmountToLowerPrecision({ amount, higherPrecision, lowerPrecision })).toStrictEqual(expected)
})

test('rounding up', () => {
  const lowerPrecision = 1
  const amount = new BN(15555) // 1.5555
  const expected = new BN(16) // 1.6

  expect(adjustAmountToLowerPrecision({ amount, higherPrecision, lowerPrecision })).toStrictEqual(expected)
})
