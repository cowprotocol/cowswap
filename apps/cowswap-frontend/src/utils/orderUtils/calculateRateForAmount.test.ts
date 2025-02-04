import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { calculateRateForAmount } from './calculateRateForAmount'

describe('calculateRateForAmount', () => {
  // Setup mock currencies
  const mockCurrency1 = {
    symbol: 'MOCK1',
    decimals: 18,
  } as Currency

  const mockCurrency2 = {
    symbol: 'MOCK2',
    decimals: 18,
  } as Currency

  // Setup mock CurrencyAmounts
  const mock1Amount = CurrencyAmount.fromRawAmount(mockCurrency1, '1000000000000000000') // 1 MOCK1
  const mock2Amount = CurrencyAmount.fromRawAmount(mockCurrency2, '2000000000000000000') // 2 MOCK2

  it('returns null when amount is null', () => {
    const result = calculateRateForAmount(true, null, mock1Amount, mock2Amount)
    expect(result).toBeNull()
  })

  describe('when isBuyAmountChange is true', () => {
    const isBuyAmountChange = true
    it('returns null when inputCurrencyAmount is null', () => {
      const result = calculateRateForAmount(isBuyAmountChange, mock2Amount, null, mock2Amount)
      expect(result).toBeNull()
    })

    it('calculates correct rate for buy amount change', () => {
      const result = calculateRateForAmount(isBuyAmountChange, mock2Amount, mock1Amount, null)

      expect(result).toBeInstanceOf(Price)
      expect(result?.quoteCurrency).toBe(mock2Amount.currency)
      expect(result?.baseCurrency).toBe(mock1Amount.currency)
      expect(result?.toFixed(6)).toBe('2.000000') // 2 MOCK2 / 1 MOCK1 == 2 MOCK2
    })
  })

  describe('when isBuyAmountChange is false', () => {
    const isBuyAmountChange = false

    it('returns null when outputCurrencyAmount is null', () => {
      const result = calculateRateForAmount(isBuyAmountChange, mock1Amount, mock1Amount, null)
      expect(result).toBeNull()
    })

    it('calculates correct rate for sell amount change', () => {
      const result = calculateRateForAmount(isBuyAmountChange, mock1Amount, null, mock2Amount)

      expect(result).toBeInstanceOf(Price)
      expect(result?.quoteCurrency).toBe(mock2Amount.currency)
      expect(result?.baseCurrency).toBe(mock1Amount.currency)
      expect(result?.toFixed(6)).toBe('2.000000') // 2 MOCK2 / 1 MOCK1 = 2 MOCK1
    })
  })
})
