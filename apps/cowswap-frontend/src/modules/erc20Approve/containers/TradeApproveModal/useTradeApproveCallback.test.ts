import { useCowAnalytics } from '@cowprotocol/analytics'
import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Token } from '@uniswap/sdk-core'

import { renderHook, waitFor } from '@testing-library/react'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useTradeApproveCallback } from './useTradeApproveCallback'

import { useApproveCallback } from '../../hooks'
import { useUpdateTradeApproveState } from '../../state'

jest.mock('@cowprotocol/analytics', () => ({
  useCowAnalytics: jest.fn(),
  __resetGtmInstance: jest.fn(),
}))

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  useTradeSpenderAddress: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: jest.fn(),
}))

jest.mock('../../hooks', () => ({
  useApproveCallback: jest.fn(),
}))

jest.mock('../../state', () => ({
  useUpdateTradeApproveState: jest.fn(),
}))

const mockUseCowAnalytics = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const mockUseTradeSpenderAddress = useTradeSpenderAddress as jest.MockedFunction<typeof useTradeSpenderAddress>
const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUseApproveCallback = useApproveCallback as jest.MockedFunction<typeof useApproveCallback>
const mockUseUpdateTradeApproveState = useUpdateTradeApproveState as jest.MockedFunction<
  typeof useUpdateTradeApproveState
>

describe('useTradeApproveCallback', () => {
  const mockToken = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
  const mockSpenderAddress = '0xspenderaddress1234567890123456789012345678'
  const mockAmount = BigInt('1000000000000000000')

  const mockSendEvent = jest.fn()
  const mockUpdateTradeApproveState = jest.fn()
  const mockApproveCallback = jest.fn()

  const createMockTransactionReceipt = (status: number): TransactionReceipt => ({
    to: mockSpenderAddress,
    from: '0xfrom1234567890123456789012345678901234567890',
    contractAddress: mockToken.address,
    transactionIndex: 1,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gasUsed: { toString: () => '21000' } as any,
    logsBloom: '0x',
    blockHash: '0xblockhash',
    transactionHash: '0xtxhash',
    logs: [],
    blockNumber: 123456,
    confirmations: 1,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cumulativeGasUsed: { toString: () => '21000' } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    effectiveGasPrice: { toString: () => '1000000000' } as any,
    byzantium: true,
    type: 2,
    status,
  })

  const createMockTransactionResponse = (status: number): TransactionResponse =>
    ({
      hash: '0xtxhash',
      confirmations: 0,
      from: '0xfrom1234567890123456789012345678901234567890',
      wait: jest.fn().mockResolvedValue(createMockTransactionReceipt(status)),
      nonce: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gasLimit: { toString: () => '21000' } as any,
      data: '0x',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: { toString: () => '0' } as any,
      chainId: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

  beforeEach(() => {
    jest.clearAllMocks()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseCowAnalytics.mockReturnValue({ sendEvent: mockSendEvent } as any)
    mockUseTradeSpenderAddress.mockReturnValue(mockSpenderAddress)
    mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
    mockUseApproveCallback.mockReturnValue(mockApproveCallback)
    mockUseUpdateTradeApproveState.mockReturnValue(mockUpdateTradeApproveState)
  })

  describe('successful approval flow', () => {
    it('should successfully approve tokens and track analytics', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: true,
        })
        expect(mockApproveCallback).toHaveBeenCalledWith(mockAmount)
        expect(mockSendEvent).toHaveBeenCalledWith({
          category: CowSwapAnalyticsCategory.TRADE,
          action: 'Send',
          label: mockToken.symbol,
        })
        expect(mockSendEvent).toHaveBeenCalledWith({
          category: CowSwapAnalyticsCategory.TRADE,
          action: 'Sign',
          label: mockToken.symbol,
        })
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })

    it('should return transaction receipt on successful approval', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })

    it('should wait for transaction to be mined', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      const mockWait = jest.fn().mockResolvedValue(createMockTransactionReceipt(1))
      mockTxResponse.wait = mockWait
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockWait).toHaveBeenCalled()
      })
    })
  })

  describe('failed approval flow', () => {
    it('should handle transaction failure (status !== 1)', async () => {
      const mockTxResponse = createMockTransactionResponse(0)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      const receipt = await result.current(mockAmount)

      await waitFor(() => {
        expect(receipt).toBeUndefined()
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          error: expect.stringContaining('Approval transaction failed'),
        })
      })
    })

    it('should handle user rejection', async () => {
      const rejectError = { code: 4001, message: 'User rejected the request' }
      mockApproveCallback.mockRejectedValue(rejectError)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      const receipt = await result.current(mockAmount)

      await waitFor(() => {
        expect(receipt).toBeUndefined()
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          error: 'User rejected approval transaction',
        })
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })

    it('should handle generic errors and track analytics', async () => {
      const genericError = { code: 500, message: 'Network error' }
      mockApproveCallback.mockRejectedValue(genericError)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      const receipt = await result.current(mockAmount)

      await waitFor(() => {
        expect(receipt).toBeUndefined()
        expect(mockSendEvent).toHaveBeenCalledWith({
          category: CowSwapAnalyticsCategory.TRADE,
          action: 'Error',
          label: mockToken.symbol,
          value: 500,
        })
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          error: expect.any(String),
        })
      })
    })

    it('should handle errors without error codes', async () => {
      const errorWithoutCode = new Error('Generic error')
      mockApproveCallback.mockRejectedValue(errorWithoutCode)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      const receipt = await result.current(mockAmount)

      await waitFor(() => {
        expect(receipt).toBeUndefined()
        expect(mockSendEvent).toHaveBeenCalledWith({
          category: CowSwapAnalyticsCategory.TRADE,
          action: 'Error',
          label: mockToken.symbol,
        })
      })
    })
  })

  describe('partial approval feature flag behavior', () => {
    it('should hide modal immediately when feature is disabled and transaction is sent', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: false })
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockSendEvent).toHaveBeenCalledWith({
          category: CowSwapAnalyticsCategory.TRADE,
          action: 'Sign',
          label: mockToken.symbol,
        })
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })

    it('should not hide modal early when feature is enabled', async () => {
      mockUseFeatureFlags.mockReturnValue({ isPartialApproveEnabled: true })
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockSendEvent).toHaveBeenCalledWith({
          category: CowSwapAnalyticsCategory.TRADE,
          action: 'Sign',
          label: mockToken.symbol,
        })
        const callsBeforeFinally = mockUpdateTradeApproveState.mock.calls.filter(
          (call) => call[0].currency === undefined && call[0].approveInProgress === false,
        )
        expect(callsBeforeFinally).toHaveLength(1)
      })
    })
  })

  describe('useModals parameter', () => {
    it('should show modal when useModals is true (default)', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: true,
        })
      })
    })

    it('should not show modal when useModals is false', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount, { useModals: false })

      await waitFor(() => {
        const modalCalls = mockUpdateTradeApproveState.mock.calls.filter((call) => call[0].approveInProgress === true)
        expect(modalCalls).toHaveLength(0)
      })
    })

    it('should still cleanup state even when useModals is false', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount, { useModals: false })

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })
  })

  describe('state cleanup', () => {
    it('should always reset state in finally block', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })

    it('should reset state even on error', async () => {
      mockApproveCallback.mockRejectedValue(new Error('Test error'))

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })

    it('should reset state even when transaction fails', async () => {
      const mockTxResponse = createMockTransactionResponse(0)
      mockApproveCallback.mockResolvedValue(mockTxResponse)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken))

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: undefined,
          approveInProgress: false,
        })
      })
    })
  })

  describe('memoization and re-renders', () => {
    it('should return stable callback reference', () => {
      const { result, rerender } = renderHook(() => useTradeApproveCallback(mockToken))

      const firstCallback = result.current

      rerender()

      expect(result.current).toBe(firstCallback)
    })

    it('should update callback when dependencies change', () => {
      const { result, rerender } = renderHook(({ currency }) => useTradeApproveCallback(currency), {
        initialProps: { currency: mockToken },
      })

      const firstCallback = result.current

      const newToken = new Token(1, '0x9876543210987654321098765432109876543210', 18, 'NEW', 'New Token')
      rerender({ currency: newToken })

      expect(result.current).not.toBe(firstCallback)
    })
  })
})
