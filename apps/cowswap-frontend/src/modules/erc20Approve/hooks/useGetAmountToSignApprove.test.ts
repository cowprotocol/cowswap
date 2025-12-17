import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'
import { useGetPartialAmountToSignApprove } from './useGetPartialAmountToSignApprove'

import { MAX_APPROVE_AMOUNT } from '../constants'
import { useIsPartialApproveSelectedByUser } from '../state'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: jest.fn(),
}))

jest.mock('common/hooks/useNeedsApproval', () => ({
  useNeedsApproval: jest.fn(),
}))

jest.mock('./useGetPartialAmountToSignApprove', () => ({
  useGetPartialAmountToSignApprove: jest.fn(),
}))

jest.mock('../state', () => ({
  useIsPartialApproveSelectedByUser: jest.fn(),
}))

const mockUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUseNeedsApproval = useNeedsApproval as jest.MockedFunction<typeof useNeedsApproval>
const mockUseGetPartialAmountToSignApprove = useGetPartialAmountToSignApprove as jest.MockedFunction<
  typeof useGetPartialAmountToSignApprove
>
const mockUseIsPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser as jest.MockedFunction<
  typeof useIsPartialApproveSelectedByUser
>

describe('useGetAmountToSignApprove', () => {
  const mockToken = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
  const mockPartialAmount = CurrencyAmount.fromRawAmount(mockToken, '1000000000000000000') // 1 token
  const mockZeroAmount = CurrencyAmount.fromRawAmount(mockToken, '0')
  const mockMaxAmount = CurrencyAmount.fromRawAmount(mockToken, MAX_APPROVE_AMOUNT.toString())

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseGetPartialAmountToSignApprove.mockReturnValue(mockPartialAmount)
    mockUseNeedsApproval.mockReturnValue(true)
    mockUseIsPartialApproveSelectedByUser.mockReturnValue(false)
    mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
    mockUseAtomValue.mockReturnValue(true)
  })

  describe('when partialAmountToSign is null', () => {
    it('should return null when partialAmountToSign is null', () => {
      mockUseGetPartialAmountToSignApprove.mockReturnValue(null)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toBe(null)
    })
  })

  describe('when approval is not needed', () => {
    it('should return zero amount when approval is not needed', () => {
      mockUseNeedsApproval.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockZeroAmount)
    })

    it('should return zero amount when approval is not needed regardless of partial approval settings', () => {
      mockUseNeedsApproval.mockReturnValue(false)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseAtomValue.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockZeroAmount)
    })
  })

  describe('when approval is needed and partial approval is enabled', () => {
    it('should return partial amount when all conditions are met', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockPartialAmount)
    })

    it('should return max amount when user has not selected partial approval', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(false)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })

    it('should return max amount when partial approval is disabled in settings', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })
  })

  describe('when partial approval feature is disabled', () => {
    it('should return max amount when isPartialApproveEnabled is false', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      mockUseAtomValue.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })

    it('should return max amount when isPartialApproveEnabled is false regardless of user selection', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      mockUseAtomValue.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })
  })

  describe('edge cases', () => {
    it('should handle when useSwapPartialApprovalToggleState returns null values', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      mockUseAtomValue.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })

    it('should handle when partial approval is enabled but settings return false', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })

    it('should handle when partial approval is enabled but user has not selected it', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(false)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })
  })

  describe('memoization', () => {
    it('should memoize result based on dependencies', () => {
      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      const firstResult = result.current

      rerender()
      expect(result.current).toBe(firstResult)

      mockUseNeedsApproval.mockReturnValue(false)
      rerender()
      expect(result.current).not.toBe(firstResult)
    })

    it('should update when partialAmountToSign changes', () => {
      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      const firstResult = result.current

      const newPartialAmount = CurrencyAmount.fromRawAmount(mockToken, '2000000000000000000')
      mockUseGetPartialAmountToSignApprove.mockReturnValue(newPartialAmount)
      rerender()

      expect(result.current).not.toBe(firstResult)
    })

    it('should update when isApprovalNeeded changes', () => {
      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      const firstResult = result.current

      mockUseNeedsApproval.mockReturnValue(false)
      rerender()

      expect(result.current).not.toBe(firstResult)
      expect(result.current).toEqual(mockZeroAmount)
    })

    it('should update when isPartialApproveEnabled changes', () => {
      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      const firstResult = result.current

      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      rerender()

      expect(result.current).not.toBe(firstResult)
      expect(result.current).toEqual(mockMaxAmount)
    })

    it('should update when isPartialApprovalSelectedByUser changes', () => {
      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      const firstResult = result.current

      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      rerender()

      expect(result.current).not.toBe(firstResult)
      expect(result.current).toEqual(mockPartialAmount)
    })

    it('should update when isPartialApprovalEnabledInSettings changes', () => {
      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      const firstResult = result.current

      mockUseAtomValue.mockReturnValue(false)
      rerender()

      expect(result.current).not.toBe(firstResult)
      expect(result.current).toEqual(mockMaxAmount)
    })
  })

  describe('integration scenarios', () => {
    it('should return partial amount when all conditions are met for partial approval', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockPartialAmount)
    })

    it('should return max amount when any condition for partial approval is not met', () => {
      const scenarios = [
        {
          isPartialApproveEnabled: false,
          isPartialApprovalSelectedByUser: true,
          isPartialApprovalEnabledInSettings: true,
        },
        {
          isPartialApproveEnabled: true,
          isPartialApprovalSelectedByUser: false,
          isPartialApprovalEnabledInSettings: true,
        },
        {
          isPartialApproveEnabled: true,
          isPartialApprovalSelectedByUser: true,
          isPartialApprovalEnabledInSettings: false,
        },
      ]

      scenarios.forEach((scenario) => {
        mockUseNeedsApproval.mockReturnValue(true)
        mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: scenario.isPartialApproveEnabled })
        mockUseIsPartialApproveSelectedByUser.mockReturnValue(scenario.isPartialApprovalSelectedByUser)
        mockUseAtomValue.mockReturnValue(scenario.isPartialApprovalEnabledInSettings)

        const { result } = renderHook(() => useGetAmountToSignApprove())

        expect(result.current).toEqual(mockMaxAmount)
      })
    })

    it('should handle complex state combinations correctly', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseAtomValue.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockMaxAmount)
    })
  })

  describe('currency amount calculations', () => {
    it('should return correct currency for zero amount', () => {
      mockUseNeedsApproval.mockReturnValue(false)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current?.currency).toEqual(mockToken)
      expect(result.current?.toExact()).toBe('0')
    })

    it('should return correct currency for max amount', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current?.currency).toEqual(mockToken)
      expect(result.current).toEqual(mockMaxAmount)
    })

    it('should return correct currency for partial amount', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current?.currency).toEqual(mockToken)
      expect(result.current?.toExact()).toBe('1')
    })
  })

  describe('hook behavior consistency', () => {
    it('should always return the same result for the same inputs', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(true)

      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      const firstResult = result.current
      rerender()
      const secondResult = result.current

      expect(firstResult).toEqual(secondResult)
    })

    it('should handle rapid state changes correctly', () => {
      const { result, rerender } = renderHook(() => useGetAmountToSignApprove())

      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseAtomValue.mockReturnValue(true)
      rerender()
      expect(result.current).toEqual(mockPartialAmount)

      mockUseNeedsApproval.mockReturnValue(false)
      rerender()
      expect(result.current).toEqual(mockZeroAmount)

      mockUseNeedsApproval.mockReturnValue(true)
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      rerender()
      expect(result.current).toEqual(mockMaxAmount)
    })
  })
})
