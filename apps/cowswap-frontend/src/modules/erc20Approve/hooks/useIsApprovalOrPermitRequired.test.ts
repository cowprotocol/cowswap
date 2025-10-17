import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token, Ether } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { usePermitInfo } from 'modules/permit'
import { TradeType, useDerivedTradeState } from 'modules/trade'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

import { useApproveState } from './useApproveState'
import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'
import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from './useIsApprovalOrPermitRequired'

import { ApprovalState } from '../types'

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: jest.fn(),
}))


jest.mock('modules/permit', () => ({
  usePermitInfo: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useDerivedTradeState: jest.fn(),
  TradeType: {
    SWAP: 'SWAP',
    LIMIT_ORDER: 'LIMIT_ORDER',
    ADVANCED_ORDERS: 'ADVANCED_ORDERS',
    YIELD: 'YIELD',
  },
}))

jest.mock('./useApproveState', () => ({
  useApproveState: jest.fn(),
}))

jest.mock('./useGetAmountToSignApprove', () => ({
  useGetAmountToSignApprove: jest.fn(),
}))

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUsePermitInfo = usePermitInfo as jest.MockedFunction<typeof usePermitInfo>
const mockUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockUseApproveState = useApproveState as jest.MockedFunction<typeof useApproveState>
const mockUseGetAmountToSignApprove = useGetAmountToSignApprove as jest.MockedFunction<typeof useGetAmountToSignApprove>

describe('useIsApprovalOrPermitRequired', () => {
  const mockToken = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
  const mockAmountToApprove = CurrencyAmount.fromRawAmount(mockToken, '1000000000000000000')

  const createMockTradeState = (overrides: Partial<TradeDerivedState> = {}): TradeDerivedState => ({
    inputCurrency: mockToken,
    outputCurrency: null,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    inputCurrencyBalance: null,
    outputCurrencyBalance: null,
    inputCurrencyFiatAmount: null,
    outputCurrencyFiatAmount: null,
    recipient: null,
    recipientAddress: null,
    orderKind: OrderKind.SELL,
    slippage: null,
    tradeType: TradeType.SWAP,
    isQuoteBasedOrder: false,
    ...overrides,
  })

  const mockTradeState = createMockTradeState()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseGetAmountToSignApprove.mockReturnValue(mockAmountToApprove)
    mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
    mockUseDerivedTradeState.mockReturnValue(mockTradeState)
    mockUseApproveState.mockReturnValue({ state: ApprovalState.APPROVED, currentAllowance: BigInt(0) })
    mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })
  })

  describe('when permit is not supported', () => {
    it('should return Required when approval state is NOT_APPROVED', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.Required)
    })

    it('should return Required when approval state is PENDING', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.PENDING,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.Required)
    })

    it('should return NotRequired when approval state is APPROVED', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.APPROVED,
        currentAllowance: BigInt(1000000000000000000),
      })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('when trade type is not SWAP', () => {
    it('should return NotRequired for LIMIT_ORDER', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: TradeType.LIMIT_ORDER,
        }),
      )

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for ADVANCED_ORDERS', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: TradeType.ADVANCED_ORDERS,
        }),
      )

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for YIELD', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: TradeType.YIELD,
        }),
      )

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('when partial approve is disabled', () => {
    it('should return NotRequired when isPartialApproveEnabled is false', () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('when currency is native token', () => {
    it('should return NotRequired for native token regardless of amount', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for native token even with zero amount', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '0')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for native token even when bundling is enabled', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('when bundling is supported', () => {
    it('should return BundleApproveRequired when bundling is enabled and approval is needed', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }))

      expect(result.current).toBe(ApproveRequiredReason.BundleApproveRequired)
    })

    it('should return BundleApproveRequired when bundling is enabled regardless of permit support', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }))

      expect(result.current).toBe(ApproveRequiredReason.BundleApproveRequired)
    })

    it('should return BundleApproveRequired when bundling is enabled and permit is not supported', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.APPROVED,
        currentAllowance: BigInt(1000000000000000000),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }))

      expect(result.current).toBe(ApproveRequiredReason.BundleApproveRequired)
    })
  })

  describe('when permit is supported', () => {
    it('should return Eip2612PermitRequired for eip-2612 permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.Eip2612PermitRequired)
    })

    it('should return DaiLikePermitRequired for dai-like permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'dai-like' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.DaiLikePermitRequired)
    })

    it('should return NotRequired for unsupported permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined trade state', () => {
      mockUseDerivedTradeState.mockReturnValue(null)

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle undefined permit info', () => {
      mockUsePermitInfo.mockReturnValue(undefined)

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle null amount to approve', () => {
      mockUseGetAmountToSignApprove.mockReturnValue(null)
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle zero amount to approve', () => {
      mockUseGetAmountToSignApprove.mockReturnValue(CurrencyAmount.fromRawAmount(mockToken, '0'))
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle undefined input currency', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: null,
        }),
      )

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle undefined trade type', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: null,
        }),
      )

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('integration scenarios', () => {
    it('should prioritize permit over approval when both are available', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.Eip2612PermitRequired)
    })

    it('should fall back to approval when permit is not supported but approval is needed', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.Required)
    })

    it('should return NotRequired when both permit and approval are not needed', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.APPROVED,
        currentAllowance: BigInt(1000000000000000000),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('getPermitRequirements function', () => {
    it('should return correct permit requirements for different permit types', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })
      const { result: result1 } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))
      expect(result1.current).toBe(ApproveRequiredReason.Eip2612PermitRequired)

      mockUsePermitInfo.mockReturnValue({ type: 'dai-like' })
      const { result: result2 } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))
      expect(result2.current).toBe(ApproveRequiredReason.DaiLikePermitRequired)

      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })
      const { result: result3 } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))
      expect(result3.current).toBe(ApproveRequiredReason.NotRequired)

      mockUsePermitInfo.mockReturnValue(undefined)
      const { result: result4 } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))
      expect(result4.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('complex scenarios', () => {
    it('should handle SWAP trade type with partial approve enabled and eip-2612 permit', () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: mockToken,
          tradeType: TradeType.SWAP,
        }),
      )
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.Eip2612PermitRequired)
    })

    it('should handle SWAP trade type with partial approve disabled', () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: mockToken,
          tradeType: TradeType.SWAP,
        }),
      )
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle non-SWAP trade type with partial approve enabled', () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: mockToken,
          tradeType: TradeType.LIMIT_ORDER,
        }),
      )
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle approval state UNKNOWN', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.UNKNOWN,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() => useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }))

      expect(result.current).toBe(ApproveRequiredReason.NotRequired)
    })
  })
})
