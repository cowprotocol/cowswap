import { useAtomValue } from 'jotai'

import { Fraction, Price, Token } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'

import { useRateImpact } from './useRateImpact'

jest.mock('jotai', () => ({ useAtomValue: jest.fn() }))
jest.mock('../state/limitRateAtom', () => ({ limitRateAtom: {} }))

function setRates(activeRate: Fraction | null, marketRate: Fraction | null, isLoading = false): void {
  jest.mocked(useAtomValue).mockReturnValue({ activeRate, marketRate, isLoading, isLoadingMarketRate: false })
}

describe('useRateImpact', () => {
  it.each([
    [5, new Fraction(21105, 10), new Fraction(10, 19095)],
    [10, new Fraction(2211), new Fraction(1, 1809)],
    [20, new Fraction(2412), new Fraction(1, 1608)],
    [7, new Fraction(21507, 10), new Fraction(10, 18693)],
    [2.5, new Fraction(206025, 100), new Fraction(100, 195975)],
  ])('matches the %s percent shortcut in both price directions', (percentage, sellRate, buyRate) => {
    setRates(sellRate, new Fraction(2010))
    expect(renderHook(() => useRateImpact()).result.current).toBe(percentage)

    setRates(buyRate, new Fraction(1, 2010))
    expect(renderHook(() => useRateImpact(true)).result.current).toBe(-percentage)
  })

  it('preserves the economic rate impact used by order warnings', () => {
    const marketRate = new Fraction(1, 2010)
    setRates(new Fraction(10, 19095), marketRate)

    expect(renderHook(() => useRateImpact()).result.current).toBe(5.3)
    expect(renderHook(() => useRateImpact(true)).result.current).toBe(-5)
  })

  it('calculates the inverted price change before rounding', () => {
    setRates(new Fraction(10521, 10000), new Fraction(1))

    expect(renderHook(() => useRateImpact()).result.current).toBe(5.2)
    expect(renderHook(() => useRateImpact(true)).result.current).toBe(-5)
  })

  it('normalizes token decimals for rates restored from a URL', () => {
    const weth = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH')
    const usdc = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC')
    const price = new Price(weth, usdc, '1000000000000000000', '2110500000')
    setRates(price, new Fraction(2010))

    expect(renderHook(() => useRateImpact()).result.current).toBe(5)
  })

  it('keeps tiny token rates finite before calculating the percentage', () => {
    const marketRate = new Fraction(1, '1000000000000000000')
    setRates(marketRate.multiply(new Fraction(105, 100)), marketRate)

    expect(renderHook(() => useRateImpact()).result.current).toBe(5)
  })

  it.each([false, true])('shows zero at market with inversion %s', (isInverted) => {
    setRates(new Fraction(2010), new Fraction(2010))
    expect(renderHook(() => useRateImpact(isInverted)).result.current).toBe(0)
  })

  it.each([null, new Fraction(0)])('shows zero for an unavailable price %s', (rate) => {
    setRates(rate, new Fraction(2010))
    expect(renderHook(() => useRateImpact(true)).result.current).toBe(0)
    setRates(new Fraction(2010), rate)
    expect(renderHook(() => useRateImpact(true)).result.current).toBe(0)
  })

  it('hides the impact while rates load', () => {
    setRates(new Fraction(21105, 10), new Fraction(2010), true)
    expect(renderHook(() => useRateImpact()).result.current).toBe(0)
  })
})
