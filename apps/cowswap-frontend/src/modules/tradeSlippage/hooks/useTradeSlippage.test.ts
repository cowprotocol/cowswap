import { useAtomValue } from 'jotai'

import { renderHook } from '@testing-library/react'

import { useSmartSlippageFromQuote } from 'modules/tradeQuote'

import { useTradeSlippageValueAndType } from './useTradeSlippage'

import {
  currentUserSlippageAtom,
  shouldUseAutoSlippageAtom,
  slippageConfigAtom,
} from '../state/slippageValueAndTypeAtom'

// Mock jotai
jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

// Mock trade quote module
jest.mock('modules/tradeQuote', () => ({
  useSmartSlippageFromQuote: jest.fn(),
}))

// Mock slippage atoms
jest.mock('../state/slippageValueAndTypeAtom', () => ({
  currentUserSlippageAtom: Symbol('currentUserSlippageAtom'),
  shouldUseAutoSlippageAtom: Symbol('shouldUseAutoSlippageAtom'),
  slippageConfigAtom: Symbol('slippageConfigAtom'),
}))

const mockedUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const mockedUseSmartSlippageFromQuote = useSmartSlippageFromQuote as jest.MockedFunction<
  typeof useSmartSlippageFromQuote
>

describe('useTradeSlippageValueAndType', () => {
  const mockSlippageConfig = {
    defaultValue: 50, // 0.5%
    max: 5000, // 50%
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock for useAtomValue
    mockedUseAtomValue.mockImplementation((atom) => {
      if (atom === slippageConfigAtom) {
        return mockSlippageConfig
      }
      if (atom === currentUserSlippageAtom) {
        return null
      }
      if (atom === shouldUseAutoSlippageAtom) {
        return false
      }
      return undefined
    })

    mockedUseSmartSlippageFromQuote.mockReturnValue(null)
  })

  describe('when user has set custom slippage', () => {
    it('should return user type with user slippage value', () => {
      const userSlippage = 100 // 1%

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return userSlippage
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return false
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(null)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'user',
        value: userSlippage,
      })
    })

    it('should return user type even when auto slippage is enabled', () => {
      const userSlippage = 200 // 2%

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return userSlippage
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(75) // 0.75%

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'user',
        value: userSlippage,
      })
    })

    it('should return user type when user slippage is 0', () => {
      const userSlippage = 0

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return userSlippage
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return false
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(null)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'user',
        value: userSlippage,
      })
    })
  })

  describe('when auto slippage is enabled', () => {
    it('should return smart type with smart slippage value when available', () => {
      const smartSlippage = 75 // 0.75%

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(smartSlippage)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'smart',
        value: smartSlippage,
      })
    })

    it('should cap smart slippage at max value', () => {
      const smartSlippage = 15000 // 150% (exceeds max of 50%)

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(smartSlippage)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'smart',
        value: mockSlippageConfig.max,
      })
    })

    it('should return default when smart slippage is undefined', () => {
      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(null)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'default',
        value: mockSlippageConfig.defaultValue,
      })
    })

    it('should return default when smart slippage is 0', () => {
      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(0)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'default',
        value: mockSlippageConfig.defaultValue,
      })
    })
  })

  describe('when auto slippage is disabled', () => {
    it('should return default type with default value', () => {
      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return false
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(75) // Available but not used

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'default',
        value: mockSlippageConfig.defaultValue,
      })
    })
  })

  describe('edge cases', () => {
    it('should handle smart slippage equal to max value', () => {
      const smartSlippage = mockSlippageConfig.max

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(smartSlippage)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'smart',
        value: mockSlippageConfig.max,
      })
    })

    it('should handle very small smart slippage values', () => {
      const smartSlippage = 1 // 0.01%

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(smartSlippage)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'smart',
        value: smartSlippage,
      })
    })

    it('should handle negative smart slippage by capping it with Math.min', () => {
      const smartSlippage = -10

      mockedUseAtomValue.mockImplementation((atom) => {
        if (atom === currentUserSlippageAtom) return null
        if (atom === slippageConfigAtom) return mockSlippageConfig
        if (atom === shouldUseAutoSlippageAtom) return true
        return undefined
      })

      mockedUseSmartSlippageFromQuote.mockReturnValue(smartSlippage)

      const { result } = renderHook(() => useTradeSlippageValueAndType())

      expect(result.current).toEqual({
        type: 'default',
        value: mockSlippageConfig.defaultValue,
      })
    })
  })
})
