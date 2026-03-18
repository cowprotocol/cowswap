import { Percent } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'

import { useSlippageWarningParams } from './useSlippageWarningParams'

const bps = (value: number): Percent => new Percent(value, 10_000)

// Mocks
jest.mock('modules/trade', () => ({
  useIsEoaEthFlow: jest.fn(),
}))

jest.mock('modules/tradeQuote', () => ({
  useSmartSlippageFromQuote: jest.fn(),
}))

jest.mock('modules/tradeSlippage', () => ({
  ...jest.requireActual('modules/tradeSlippage'),
  useSlippageConfig: jest.fn(),
  useTradeSlippage: jest.fn(),
}))

const mockUseIsEoaEthFlow = require('modules/trade').useIsEoaEthFlow as jest.Mock
const mockUseSmartSlippageFromQuote = require('modules/tradeQuote').useSmartSlippageFromQuote as jest.Mock
const mockUseSlippageConfig = require('modules/tradeSlippage').useSlippageConfig as jest.Mock
const mockUseTradeSlippage = require('modules/tradeSlippage').useTradeSlippage as jest.Mock

describe('useSlippageWarningParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseIsEoaEthFlow.mockReturnValue(false)
    mockUseSlippageConfig.mockReturnValue({
      min: 1,
      max: 5000,
      defaultValue: 50, // 0.5%
    })
  })

  describe('early returns', () => {
    it('returns null when isSlippageModified is false', () => {
      mockUseTradeSlippage.mockReturnValue(bps(50))
      mockUseSmartSlippageFromQuote.mockReturnValue(50)

      const { result } = renderHook(() => useSlippageWarningParams(false))

      expect(result.current).toBeNull()
    })

    it('returns null when smartSlippage equals chosen swapSlippage', () => {
      mockUseTradeSlippage.mockReturnValue(bps(50))
      mockUseSmartSlippageFromQuote.mockReturnValue(50)

      const { result } = renderHook(() => useSlippageWarningParams(true))

      expect(result.current).toBeNull()
    })
  })

  describe('with smartSlippage provided (threshold: ±20%)', () => {
    it('flags tooLow when below computed low bound', () => {
      mockUseTradeSlippage.mockReturnValue(bps(300))
      mockUseSmartSlippageFromQuote.mockReturnValue(500)
      // smartSlippage = 500 bps (5%), lowBound = 4% = 400 bps, 3% < 4%

      const { result } = renderHook(() => useSlippageWarningParams(true))

      expect(result.current).toEqual({
        tooLow: true,
        tooHigh: false,
        min: 0.01,
        max: 50,
        lowSlippageBound: 4,
        highSlippageBound: 6,
      })
    })

    it('flags tooHigh when above computed high bound', () => {
      mockUseTradeSlippage.mockReturnValue(bps(700))
      mockUseSmartSlippageFromQuote.mockReturnValue(500)
      // smartSlippage = 500 bps (5%), highBound = 6% = 600 bps, 7% > 6%

      const { result } = renderHook(() => useSlippageWarningParams(true))

      expect(result.current).toEqual({
        tooLow: false,
        tooHigh: true,
        min: 0.01,
        max: 50,
        lowSlippageBound: 4,
        highSlippageBound: 6,
      })
    })

    it('returns no warnings when within computed bounds', () => {
      mockUseTradeSlippage.mockReturnValue(bps(450))
      mockUseSmartSlippageFromQuote.mockReturnValue(500)
      // bounds [400, 600] bps, 4.5% within [4%, 6%]

      const { result } = renderHook(() => useSlippageWarningParams(true))

      expect(result.current).toEqual({
        tooLow: false,
        tooHigh: false,
        min: 0.01,
        max: 50,
        lowSlippageBound: 4,
        highSlippageBound: 6,
      })
    })
  })

  describe('without smartSlippage (use config + EOA/non-EOA thresholds)', () => {
    beforeEach(() => {
      mockUseSmartSlippageFromQuote.mockReturnValue(null)
    })

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
        // LOW_SLIPPAGE_BPS = 5, HIGH_SLIPPAGE_BPS = 100; lowBound = 50, highBound = 100

        mockUseTradeSlippage.mockReturnValue(bps(40))
        const tooLow = renderHook(() => useSlippageWarningParams(true)).result
        expect(tooLow.current).toEqual({
          tooLow: true,
          tooHigh: false,
          min: 0.01,
          max: 50,
          lowSlippageBound: 0.5,
          highSlippageBound: 1,
        })

        mockUseTradeSlippage.mockReturnValue(bps(150))
        const tooHigh = renderHook(() => useSlippageWarningParams(true)).result
        expect(tooHigh.current).toEqual({
          tooLow: false,
          tooHigh: true,
          min: 0.01,
          max: 50,
          lowSlippageBound: 0.5,
          highSlippageBound: 1,
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
        // lowBound = 50, highBound = 1000

        mockUseTradeSlippage.mockReturnValue(bps(40))
        const tooLow = renderHook(() => useSlippageWarningParams(true)).result
        expect(tooLow.current).toEqual({
          tooLow: true,
          tooHigh: false,
          min: 0.01,
          max: 50,
          lowSlippageBound: 0.5,
          highSlippageBound: 10,
        })

        mockUseTradeSlippage.mockReturnValue(bps(500))
        const withinBounds = renderHook(() => useSlippageWarningParams(true)).result
        expect(withinBounds.current).toEqual({
          tooLow: false,
          tooHigh: false,
          min: 0.01,
          max: 50,
          lowSlippageBound: 0.5,
          highSlippageBound: 10,
        })

        mockUseTradeSlippage.mockReturnValue(bps(1100))
        const tooHigh = renderHook(() => useSlippageWarningParams(true)).result
        expect(tooHigh.current).toEqual({
          tooLow: false,
          tooHigh: true,
          min: 0.01,
          max: 50,
          lowSlippageBound: 0.5,
          highSlippageBound: 10,
        })
      })
    })
  })
})
