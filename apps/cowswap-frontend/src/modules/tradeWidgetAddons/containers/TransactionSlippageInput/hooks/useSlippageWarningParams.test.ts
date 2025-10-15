import { Percent } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { useSlippageWarningParams } from './useSlippageWarningParams'

// Mocks
jest.mock('modules/trade', () => ({
  useIsEoaEthFlow: jest.fn(),
}))

jest.mock('modules/tradeSlippage', () => ({
  ...jest.requireActual('modules/tradeSlippage'),
  useSlippageConfig: jest.fn(),
}))

const mockUseIsEoaEthFlow = require('modules/trade').useIsEoaEthFlow as jest.Mock
const mockUseSlippageConfig = require('modules/tradeSlippage').useSlippageConfig as jest.Mock

const bps = (value: number): Percent => new Percent(value, 10_000)

describe('useSlippageWarningParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockUseIsEoaEthFlow.mockReturnValue(false)
    mockUseSlippageConfig.mockReturnValue({
      min: 1,
      max: 5000,
      defaultValue: 50, // 0.5%
    })
  })

  describe('early returns', () => {
    it('returns null when isSlippageModified is false', () => {
      const { result } = renderHook(() => useSlippageWarningParams(bps(50), 50, false))

      expect(result.current).toBeNull()
    })

    it('returns null when smartSlippage equals chosen swapSlippage', () => {
      const { result } = renderHook(() => useSlippageWarningParams(bps(50), 50, true))

      expect(result.current).toBeNull()
    })
  })

  describe('with smartSlippage provided (threshold: ±20%)', () => {
    it('flags tooLow when below computed low bound', () => {
      // smartSlippage = 500 bps (5%), lowBound = 5 - 20% = 4% = 400 bps
      const { result } = renderHook(
        () => useSlippageWarningParams(bps(300), 500, true), // 3% < 4%
      )

      expect(result.current).toEqual({
        tooLow: true,
        tooHigh: false,
        min: 0.01,
        max: 50,
      })
    })

    it('flags tooHigh when above computed high bound', () => {
      // smartSlippage = 500 bps (5%), highBound = 5 + 20% = 6% = 600 bps
      const { result } = renderHook(
        () => useSlippageWarningParams(bps(700), 500, true), // 7% > 6%
      )

      expect(result.current).toEqual({
        tooLow: false,
        tooHigh: true,
        min: 0.01,
        max: 50,
      })
    })

    it('returns no warnings when within computed bounds', () => {
      // smartSlippage = 500 bps (5%), bounds are [400, 600] bps
      const { result } = renderHook(
        () => useSlippageWarningParams(bps(450), 500, true), // 4.5% within [4%, 6%]
      )

      expect(result.current).toEqual({
        tooLow: false,
        tooHigh: false,
        min: 0.01,
        max: 50,
      })
    })
  })

  describe('without smartSlippage (use config + EOA/non-EOA thresholds)', () => {
    describe('non-EOA flow', () => {
      beforeEach(() => {
        mockUseIsEoaEthFlow.mockReturnValue(false)
      })

      it('uses LOW_SLIPPAGE_BPS and HIGH_SLIPPAGE_BPS with defaultValue fallback', () => {
        mockUseSlippageConfig.mockReturnValue({
          min: 1,
          max: 5000,
          defaultValue: 50, // 0.5%
        })

        // LOW_SLIPPAGE_BPS = 5, HIGH_SLIPPAGE_BPS = 100
        // Since defaultValue = 50 > LOW_SLIPPAGE_BPS = 5, lowBound = 50
        // Since defaultValue = 50 < HIGH_SLIPPAGE_BPS = 100, highBound = 100

        const tooLow = renderHook(
          () => useSlippageWarningParams(bps(40), null, true), // 0.4% < 0.5%
        ).result
        expect(tooLow.current).toEqual({
          tooLow: true,
          tooHigh: false,
          min: 0.01,
          max: 50,
        })

        const tooHigh = renderHook(
          () => useSlippageWarningParams(bps(150), null, true), // 1.5% > 1%
        ).result
        expect(tooHigh.current).toEqual({
          tooLow: false,
          tooHigh: true,
          min: 0.01,
          max: 50,
        })
      })
    })

    describe('EOA ETH flow', () => {
      beforeEach(() => {
        mockUseIsEoaEthFlow.mockReturnValue(true)
        mockUseSlippageConfig.mockReturnValue({
          min: 1,
          max: 5000,
          defaultValue: 50,
        })
      })

      it('uses MINIMUM_ETH_FLOW_SLIPPAGE_BPS and HIGH_ETH_FLOW_SLIPPAGE_BPS', () => {
        // MINIMUM_ETH_FLOW_SLIPPAGE_BPS = 50, HIGH_ETH_FLOW_SLIPPAGE_BPS = 1000
        // Since defaultValue = 50 = MINIMUM_ETH_FLOW_SLIPPAGE_BPS, lowBound = 50
        // Since defaultValue = 50 < HIGH_ETH_FLOW_SLIPPAGE_BPS = 1000, highBound = 1000

        const tooLow = renderHook(
          () => useSlippageWarningParams(bps(40), null, true), // 0.4% < 0.5%
        ).result
        expect(tooLow.current).toEqual({
          tooLow: true,
          tooHigh: false,
          min: 0.01,
          max: 50,
        })

        const withinBounds = renderHook(
          () => useSlippageWarningParams(bps(500), null, true), // 5% within [0.5%, 10%]
        ).result
        expect(withinBounds.current).toEqual({
          tooLow: false,
          tooHigh: false,
          min: 0.01,
          max: 50,
        })

        const tooHigh = renderHook(
          () => useSlippageWarningParams(bps(1100), null, true), // 11% > 10%
        ).result
        expect(tooHigh.current).toEqual({
          tooLow: false,
          tooHigh: true,
          min: 0.01,
          max: 50,
        })
      })
    })
  })
})
