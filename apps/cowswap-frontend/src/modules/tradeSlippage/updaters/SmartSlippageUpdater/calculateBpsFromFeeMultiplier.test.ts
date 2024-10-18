import { USDC } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { calculateBpsFromFeeMultiplier } from './calculateBpsFromFeeMultiplier'

describe('calculateBpsFromFeeMultiplier', () => {
  const sellAmount = CurrencyAmount.fromRawAmount(USDC[1], '1000000') // 1.2 USDC
  const feeAmount = CurrencyAmount.fromRawAmount(USDC[1], '200000') // 0.2 USDC
  const isSell = true
  const multiplierPercentage = 50

  it('should return undefined for missing parameters', () => {
    expect(calculateBpsFromFeeMultiplier(undefined, feeAmount, isSell, multiplierPercentage)).toBeUndefined()
    expect(calculateBpsFromFeeMultiplier(sellAmount, undefined, isSell, multiplierPercentage)).toBeUndefined()
    expect(calculateBpsFromFeeMultiplier(sellAmount, feeAmount, undefined, multiplierPercentage)).toBeUndefined()
    expect(calculateBpsFromFeeMultiplier(sellAmount, feeAmount, isSell, 0)).toBeUndefined()
  })

  it('should return undefined for a negative multiplier percentage', () => {
    const result = calculateBpsFromFeeMultiplier(sellAmount, feeAmount, isSell, -50)
    expect(result).toBeUndefined()
  })

  it('should calculate the correct percentage for selling with different multiplier percentages', () => {
    const testCases = [
      [25, 625], // 25%, 6.25%
      [50, 1250], // 50%, 12.5%
      [75, 1875], // 75%, 18.75%
    ]

    testCases.forEach(([multiplier, expectedResult]) => {
      const result = calculateBpsFromFeeMultiplier(sellAmount, feeAmount, isSell, multiplier)
      expect(result).toBeDefined()
      expect(result).toBe(expectedResult)
    })
  })

  it('should calculate the correct percentage for buying with different multiplier percentages', () => {
    const testCases = [
      [25, 417], // 25%, 4.17%
      [50, 833], // 50%, 8.33%
      [75, 1250], // 75%, 12.5%
    ]

    testCases.forEach(([multiplier, expectedResult]) => {
      const result = calculateBpsFromFeeMultiplier(sellAmount, feeAmount, !isSell, multiplier)
      expect(result).toBeDefined()
      expect(result).toBe(expectedResult)
    })
  })
})
