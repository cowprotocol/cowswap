import { OrderKind } from '@cowprotocol/cow-sdk'
import { PermitType } from '@cowprotocol/permit-utils'
import { CurrencyAmount, Ether, Token } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { usePermitInfo } from 'modules/permit'
import { TradeType, useDerivedTradeState } from 'modules/trade'
import { TradeDerivedState } from 'modules/trade'

import { useApproveState } from './useApproveState'
import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'
import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from './useIsApprovalOrPermitRequired'

import { ApprovalState } from '../types'

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

const mockUsePermitInfo = usePermitInfo as jest.MockedFunction<typeof usePermitInfo>
const mockUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockUseApproveState = useApproveState as jest.MockedFunction<typeof useApproveState>
const mockUseGetAmountToSignApprove = useGetAmountToSignApprove as jest.MockedFunction<typeof useGetAmountToSignApprove>

// eslint-disable-next-line max-lines-per-function
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

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Required)
    })

    it('should return Required when approval state is PENDING', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.PENDING,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Required)
    })

    it('should return NotRequired when approval state is APPROVED', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.APPROVED,
        currentAllowance: BigInt(1000000000000000000),
      })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('when trade type is not SWAP', () => {
    it('should return NotRequired for LIMIT_ORDER', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: TradeType.LIMIT_ORDER,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for ADVANCED_ORDERS', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: TradeType.ADVANCED_ORDERS,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for YIELD', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: TradeType.YIELD,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('when currency is native token', () => {
    it('should return Unsupported for native token when not SWAP', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.LIMIT_ORDER,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP without bundling', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP with bundling disabled', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: false }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return NotRequired for native token in SWAP with bundling enabled and zero amount', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '0')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return BundleApproveRequired for native token in SWAP when bundling is enabled', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.BundleApproveRequired)
    })
  })

  describe('when approve is unsupported (Unsupported)', () => {
    it('should return Unsupported for native token in LIMIT_ORDER', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.LIMIT_ORDER,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in ADVANCED_ORDERS', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.ADVANCED_ORDERS,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in YIELD', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.YIELD,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP without bundling (null)', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP without bundling (false)', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: false }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP even when permit is supported', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP even when approval is needed', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should NOT return Unsupported for ERC20 token in SWAP without bundling', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Required)
      expect(result.current.reason).not.toBe(ApproveRequiredReason.Unsupported)
    })

    it('should NOT return Unsupported for ERC20 token in LIMIT_ORDER', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: mockToken,
          tradeType: TradeType.LIMIT_ORDER,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
      expect(result.current.reason).not.toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token with undefined inputCurrency', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: undefined,
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      // undefined inputCurrency means not native flow, so should not be Unsupported
      expect(result.current.reason).not.toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP with bundling but zero amount', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '0')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }),
      )

      // Even with bundling enabled, if amount is 0, should be NotRequired, not Unsupported
      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
      expect(result.current.reason).not.toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP with bundling disabled even with permit', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )
      mockUsePermitInfo.mockReturnValue({ type: 'dai-like' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: false }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })

    it('should return Unsupported for native token in SWAP with bundling disabled even when approved', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.APPROVED,
        currentAllowance: BigInt(1000000000000000000),
      })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: false }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Unsupported)
    })
  })

  describe('when bundling is supported', () => {
    it('should return BundleApproveRequired when bundling is enabled and approval is needed', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.BundleApproveRequired)
    })

    it('should return BundleApproveRequired when bundling is enabled regardless of permit support', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.BundleApproveRequired)
    })

    it('should return BundleApproveRequired when bundling is enabled and permit is not supported', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(Ether.onChain(1), '1000000000000000000')
      mockUseGetAmountToSignApprove.mockReturnValue(nativeAmount)
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: Ether.onChain(1),
          tradeType: TradeType.SWAP,
        }),
      )
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.APPROVED,
        currentAllowance: BigInt(1000000000000000000),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: true }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.BundleApproveRequired)
    })
  })

  describe('when permit is supported', () => {
    it('should return Eip2612PermitRequired for eip-2612 permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Eip2612PermitRequired)
    })

    it('should return DaiLikePermitRequired for dai-like permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'dai-like' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.DaiLikePermitRequired)
    })

    it('should return NotRequired for unsupported permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for undefined permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: undefined as unknown as PermitType })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should return NotRequired for null permit type', () => {
      mockUsePermitInfo.mockReturnValue({ type: null as unknown as PermitType })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined trade state', () => {
      mockUseDerivedTradeState.mockReturnValue(null)

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle undefined permit info', () => {
      mockUsePermitInfo.mockReturnValue(undefined)

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle null amount to approve', () => {
      mockUseGetAmountToSignApprove.mockReturnValue(null)
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle zero amount to approve', () => {
      mockUseGetAmountToSignApprove.mockReturnValue(CurrencyAmount.fromRawAmount(mockToken, '0'))
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle undefined input currency', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: null,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle undefined trade type', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          tradeType: null,
        }),
      )

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('integration scenarios', () => {
    it('should prioritize permit over approval when both are available', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Eip2612PermitRequired)
    })

    it('should fall back to approval when permit is not supported but approval is needed', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.NOT_APPROVED,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Required)
    })

    it('should return NotRequired when both permit and approval are not needed', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.APPROVED,
        currentAllowance: BigInt(1000000000000000000),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('getPermitRequirements function', () => {
    it('should return correct permit requirements for different permit types', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })
      const { result: result1 } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )
      expect(result1.current.reason).toBe(ApproveRequiredReason.Eip2612PermitRequired)

      mockUsePermitInfo.mockReturnValue({ type: 'dai-like' })
      const { result: result2 } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )
      expect(result2.current.reason).toBe(ApproveRequiredReason.DaiLikePermitRequired)

      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })
      const { result: result3 } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )
      expect(result3.current.reason).toBe(ApproveRequiredReason.NotRequired)

      mockUsePermitInfo.mockReturnValue(undefined)
      const { result: result4 } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )
      expect(result4.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })
  })

  describe('complex scenarios', () => {
    it('should handle SWAP trade type with eip-2612 permit', () => {
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.Eip2612PermitRequired)
    })

    it('should handle non-SWAP trade type', () => {
      mockUseDerivedTradeState.mockReturnValue(
        createMockTradeState({
          inputCurrency: mockToken,
          tradeType: TradeType.LIMIT_ORDER,
        }),
      )
      mockUsePermitInfo.mockReturnValue({ type: 'eip-2612' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })

    it('should handle approval state UNKNOWN', () => {
      mockUseApproveState.mockReturnValue({
        state: ApprovalState.UNKNOWN,
        currentAllowance: BigInt(0),
      })
      mockUsePermitInfo.mockReturnValue({ type: 'unsupported' })

      const { result } = renderHook(() =>
        useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: null }),
      )

      expect(result.current.reason).toBe(ApproveRequiredReason.NotRequired)
    })
  })
})
