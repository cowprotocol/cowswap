import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { useTradeApproveCallback } from './useTradeApproveCallback'

const mockUpdateApproveProgressModalState = jest.fn()
const mockResetApproveProgressModalState = jest.fn()
const mockApproveCallback = jest.fn()
const mockSendEvent = jest.fn()
const mockUseTradeSpenderAddress = jest.fn()
const mockUseFeatureFlags = jest.fn()

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

jest.mock('../../hooks', () => ({
  useApproveCallback: () => mockApproveCallback,
}))

jest.mock('../../state', () => ({
  useUpdateApproveProgressModalState: () => mockUpdateApproveProgressModalState,
  useResetApproveProgressModalState: () => mockResetApproveProgressModalState,
}))

jest.mock('./useApproveCowAnalytics', () => ({
  useApproveCowAnalytics: () => mockSendEvent,
}))

const mockCurrency = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 6, 'USDC', 'USD Coin')

const mockTransactionResponse = {
  hash: '0x123',
  wait: jest.fn(),
} as unknown as TransactionResponse

const mockTransactionReceipt = {
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

    it('should call updateApproveProgressModalState with correct initial state', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: true,
        amountToApprove: expect.any(CurrencyAmount),
      })
    })

    it('should call analytics with correct parameters', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockSendEvent).toHaveBeenCalledWith('Send', 'USDC')
      expect(mockSendEvent).toHaveBeenCalledWith('Sign', 'USDC')
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
    it('should not call updateApproveProgressModalState when useModals is false', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: false })

      expect(mockUpdateApproveProgressModalState).not.toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: true,
        amountToApprove: expect.any(CurrencyAmount),
      })
    })

    it('should call updateApproveProgressModalState when useModals is true', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true })

      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: true,
        amountToApprove: expect.any(CurrencyAmount),
      })
    })
  })

  describe('partial approve feature flag', () => {
    it('should hide modal when partial approve is disabled and waitForTxConfirmation is false', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: false })

      expect(mockResetApproveProgressModalState).toHaveBeenCalled()
    })

    it('should not hide modal early when partial approve is enabled', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: false })

      expect(mockResetApproveProgressModalState).not.toHaveBeenCalled()
    })

    it('should set isPendingInProgress to true when partial approve is enabled', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: false })

      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
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
      expect(mockResetApproveProgressModalState).toHaveBeenCalled()
    })

    it('should handle reject request provider error', async () => {
      mockApproveCallback.mockRejectedValue('reject')
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))
      expect(response).toBeUndefined()
      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        error: 'User rejected approval transaction',
      })
    })

    it('should handle generic error with error code', async () => {
      const errorWithCode = { code: 4001, message: 'User rejected' }
      mockApproveCallback.mockRejectedValue(errorWithCode)
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))
      expect(response).toBeUndefined()
      expect(mockSendEvent).toHaveBeenCalledWith('Error', 'USDC', 4001)
      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        error: 'Error: [object Object]',
      })
    })

    it('should handle generic error without error code', async () => {
      const errorWithoutCode = { message: 'Network error' }
      mockApproveCallback.mockRejectedValue(errorWithoutCode)
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))
      expect(response).toBeUndefined()
      expect(mockSendEvent).toHaveBeenCalledWith('Error', 'USDC', null)
      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        error: 'Error: [object Object]',
      })
    })

    it('should handle error during waitForTxConfirmation', async () => {
      mockTransactionResponse.wait = jest.fn().mockRejectedValue('wait error')
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000), { useModals: true, waitForTxConfirmation: true })
      expect(response).toBeUndefined()
      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        error: 'Error: wait error',
      })
    })
  })

  describe('finally block behavior', () => {
    it('should always call updateApproveProgressModalState to reset state on success', async () => {
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      await result.current(BigInt(1000))

      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: false,
        amountToApprove: undefined,
        isPendingInProgress: false,
      })
    })

    it('should always call updateApproveProgressModalState to reset state on error', async () => {
      mockApproveCallback.mockRejectedValue('error')
      const { result } = renderHook(() => useTradeApproveCallback(mockCurrency))

      const response = await result.current(BigInt(1000))
      expect(response).toBeUndefined()

      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        currency: mockCurrency,
        approveInProgress: false,
        amountToApprove: undefined,
        isPendingInProgress: false,
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
