import { MAX_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'

import { renderHook } from '@testing-library/react'

import { useIsEoaEthFlow } from 'modules/trade'

import { useSmartSlippageFromQuote } from './useSmartSlippageFromQuote'
import { useTradeQuote } from './useTradeQuote'

import { DEFAULT_TRADE_QUOTE_STATE, TradeQuoteState } from '../state/tradeQuoteAtom'

// Mock dependencies
jest.mock('./useTradeQuote')
jest.mock('modules/trade', () => ({
  useIsEoaEthFlow: jest.fn(),
}))

const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseIsEoaEthFlow = useIsEoaEthFlow as jest.MockedFunction<typeof useIsEoaEthFlow>

describe('useSmartSlippageFromQuote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when tradeQuote is null or undefined', () => {
    it('should return null when tradeQuote is null', () => {
      mockedUseTradeQuote.mockReturnValue(DEFAULT_TRADE_QUOTE_STATE)
      mockedUseIsEoaEthFlow.mockReturnValue(false)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBeNull()
    })
  })

  describe('when isEthFlow is false (regular flow)', () => {
    beforeEach(() => {
      mockedUseIsEoaEthFlow.mockReturnValue(false)
    })

    it('should return valid slippage within bounds', () => {
      const validSlippage = 100 // 1%
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: validSlippage,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBe(validSlippage)
    })

    it('should return slippage at maximum bound', () => {
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: MAX_SLIPPAGE_BPS,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBe(MAX_SLIPPAGE_BPS)
    })

    it('should return null when slippage exceeds maximum', () => {
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: MAX_SLIPPAGE_BPS + 1,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBeNull()
    })

    it('should handle negative slippage values', () => {
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: -10,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      // Negative values are less than bottom cap (0), so should return null
      expect(result.current).toBeNull()
    })
  })

  describe('when isEthFlow is true (ETH flow)', () => {
    beforeEach(() => {
      mockedUseIsEoaEthFlow.mockReturnValue(true)
    })

    it('should return valid slippage within bounds', () => {
      const validSlippage = MINIMUM_ETH_FLOW_SLIPPAGE_BPS + 50
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: validSlippage,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBe(validSlippage)
    })

    it('should return slippage at minimum ETH flow bound', () => {
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: MINIMUM_ETH_FLOW_SLIPPAGE_BPS,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBe(MINIMUM_ETH_FLOW_SLIPPAGE_BPS)
    })

    it('should return null when slippage is below minimum ETH flow threshold', () => {
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: MINIMUM_ETH_FLOW_SLIPPAGE_BPS - 1,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBeNull()
    })

    it('should return slippage at maximum bound for ETH flow', () => {
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: MAX_SLIPPAGE_BPS,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBe(MAX_SLIPPAGE_BPS)
    })

    it('should return null when slippage exceeds maximum for ETH flow', () => {
      mockedUseTradeQuote.mockReturnValue({
        quote: {
          quoteResults: {
            suggestedSlippageBps: MAX_SLIPPAGE_BPS + 1,
          },
        },
      } as TradeQuoteState)

      const { result } = renderHook(() => useSmartSlippageFromQuote())

      expect(result.current).toBeNull()
    })
  })
})
