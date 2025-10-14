import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Token } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { useTradeApproveCallback } from './useTradeApproveCallback'

const mockUpdateTradeApproveState = jest.fn()
const mockApproveCallback = jest.fn()
const mockSendEvent = jest.fn()
const mockUseTradeSpenderAddress = jest.fn()
const mockUseFeatureFlags = jest.fn()

jest.mock('@cowprotocol/analytics', () => ({
  useCowAnalytics: () => ({
    sendEvent: mockSendEvent,
  }),
  __resetGtmInstance: jest.fn(),
}))

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  useTradeSpenderAddress: () => mockUseTradeSpenderAddress(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: () => mockUseFeatureFlags(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  errorToString: (error: unknown) => `Error: ${error}`,
  isRejectRequestProviderError: (error: unknown) => error === 'reject',
}))

jest.mock('common/analytics/types', () => ({
  CowSwapAnalyticsCategory: {
    TRADE: 'TRADE',
  },
}))

jest.mock('../../hooks', () => ({
  useApproveCallback: () => mockApproveCallback,
}))

const mockResetApproveProgressModalState = jest.fn(() => {
  mockUpdateTradeApproveState({ currency: undefined, approveInProgress: false })
})

jest.mock('../../state', () => ({
  useUpdateApproveProgressModalState: () => mockUpdateTradeApproveState,
  useResetApproveProgressModalState: () => mockResetApproveProgressModalState,
}))

const mockCurrency = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 6, 'USDC', 'USD Coin')

const mockTransactionResponse: TransactionResponse = {
  hash: '0x123',
  wait: jest.fn(),
} as unknown as TransactionResponse

const mockTransactionReceipt: TransactionReceipt = {
  transactionHash: '0x123',
  blockNumber: 12345,
} as unknown as TransactionReceipt

describe('useTradeApproveCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTradeSpenderAddress.mockReturnValue('0x123')
    mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
    mockApproveCallback.mockResolvedValue(mockTransactionResponse)
    mockTransactionResponse.wait = jest.fn().mockResolvedValue(mockTransactionReceipt)
  })

  describe('basic functionality', () => {
    it('should return a function', () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))
      expect(typeof result.current).toBe('function')
    })

    it('should call updateTradeApproveState with correct initial state', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: true,
        amountToApprove: expect.anything(),
      })
    })

    it('should call analytics with correct parameters', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockSendEvent).toHaveBeenCalledWith({
        category: 'TRADE',
        action: 'Send',
        label: 'USDC',
      })

      expect(mockSendEvent).toHaveBeenCalledWith({
        category: 'TRADE',
        action: 'Sign',
        label: 'USDC',
      })
    })

    it('should call approveCallback with correct amount', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockApproveCallback).toHaveBeenCalledWith(BigInt(1000))
    })
  })

  describe('waitForTxConfirmation parameter', () => {
    it('should return TransactionResponse when waitForTxConfirmation is false', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: false })

      expect(response).toBe(mockTransactionResponse)
      expect(mockTransactionResponse.wait).not.toHaveBeenCalled()
    })

    it('should return TransactionResponse when waitForTxConfirmation is undefined', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))

      expect(response).toBe(mockTransactionResponse)
      expect(mockTransactionResponse.wait).not.toHaveBeenCalled()
    })

    it('should return TransactionReceipt when waitForTxConfirmation is true', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const receipt = await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: true })

      expect(receipt).toBe(mockTransactionReceipt)
      expect(mockTransactionResponse.wait).toHaveBeenCalled()
    })
  })

  describe('useModals parameter', () => {
    it('should not call updateTradeApproveState when useModals is false', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: false })

      expect(mockUpdateTradeApproveState).not.toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: true,
      })
    })

    it('should call updateTradeApproveState when useModals is true', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true })

      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: true,
        amountToApprove: expect.anything(),
      })
    })
  })

  describe('partial approve feature flag', () => {
    it('should hide modal when partial approve is disabled and waitForTxConfirmation is false', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: false })

      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        currency: undefined,
        approveInProgress: false,
      })
    })

    it('should not hide modal early when partial approve is enabled', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: false })

      const calls = mockUpdateTradeApproveState.mock.calls
      const earlyHideCall = calls.find(
        (call) =>
          call[0].currency === undefined &&
          call[0].approveInProgress === false &&
          calls.indexOf(call) < calls.length - 1,
      )

      expect(earlyHideCall).toBeUndefined()
    })

    it('should set isPendingInProgress to true when partial approve is enabled', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: false })

      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        isPendingInProgress: true,
      })
    })
  })

  describe('error handling', () => {
    it('should handle approveCallback returning undefined', async () => {
      mockApproveCallback.mockResolvedValue(undefined)
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))

      expect(response).toBeUndefined()
      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        currency: undefined,
        approveInProgress: false,
      })
    })

    it('should handle reject request provider error', async () => {
      mockApproveCallback.mockRejectedValue('reject')
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))

      expect(response).toBeUndefined()
      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        error: 'User rejected approval transaction',
      })
    })

    it('should handle generic error with error code', async () => {
      const errorWithCode = { code: 4001, message: 'User rejected' }
      mockApproveCallback.mockRejectedValue(errorWithCode)
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))

      expect(response).toBeUndefined()
      expect(mockSendEvent).toHaveBeenCalledWith({
        category: 'TRADE',
        action: 'Error',
        label: 'USDC',
        value: 4001,
      })
      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        error: 'Error: [object Object]',
      })
    })

    it('should handle generic error without error code', async () => {
      const errorWithoutCode = { message: 'Network error' }
      mockApproveCallback.mockRejectedValue(errorWithoutCode)
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))

      expect(response).toBeUndefined()
      expect(mockSendEvent).toHaveBeenCalledWith({
        category: 'TRADE',
        action: 'Error',
        label: 'USDC',
      })
      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        error: 'Error: [object Object]',
      })
    })

    it('should handle error during waitForTxConfirmation', async () => {
      mockTransactionResponse.wait = jest.fn().mockRejectedValue('wait error')
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: true })

      expect(response).toBeUndefined()
      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        error: 'Error: wait error',
      })
    })
  })

  describe('finally block behavior', () => {
    it('should always call updateTradeApproveState to reset state on success', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        currency: undefined,
        approveInProgress: false,
      })
    })

    it('should always call updateTradeApproveState to reset state on error', async () => {
      mockApproveCallback.mockRejectedValue('error')
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
        currency: undefined,
        approveInProgress: false,
      })
    })
  })

  describe('hook dependencies', () => {
    it('should recreate callback when currency changes', () => {
      const { result, rerender } = renderHook(({ currency }) => useTradeApproveCallback(currency), {
        initialProps: { currency: mockCurrency },
      })

      const firstCallback = result.current

      rerender({ currency: new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin') })

      expect(result.current).not.toBe(firstCallback)
    })

    it('should recreate callback when symbol changes', () => {
      const { result, rerender } = renderHook(({ currency }) => useTradeApproveCallback(currency), {
        initialProps: { currency: mockCurrency },
      })

      const firstCallback = result.current

      rerender({ currency: new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether') })

      expect(result.current).not.toBe(firstCallback)
    })
  })

  describe('type safety', () => {
    it('should accept bigint amount parameter', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await expect(result.current(BigInt(1000))).resolves.toBeDefined()
      await expect(result.current(BigInt(0))).resolves.toBeDefined()
      await expect(result.current(BigInt(999999999))).resolves.toBeDefined()
    })

    it('should handle different parameter combinations', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await expect(
        result.current(BigInt(1000), {
          useModals: true,
          waitForTxConfirmation: false,
        }),
      ).resolves.toBeDefined()
      await expect(
        result.current(BigInt(1000), {
          useModals: false,
          waitForTxConfirmation: true,
        }),
      ).resolves.toBeDefined()
      await expect(
        result.current(BigInt(1000), {
          useModals: true,
          waitForTxConfirmation: true,
        }),
      ).resolves.toBeDefined()
    })
  })
})
