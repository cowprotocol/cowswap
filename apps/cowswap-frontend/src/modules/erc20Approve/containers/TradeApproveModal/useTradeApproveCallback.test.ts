import { useCowAnalytics } from '@cowprotocol/analytics'
import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Token } from '@uniswap/sdk-core'

import { renderHook, waitFor } from '@testing-library/react'
import { useSetOptimisticAllowance } from 'entities/optimisticAllowance/useSetOptimisticAllowance'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { processApprovalTransaction } from './approveUtils'
import { useTradeApproveCallback } from './useTradeApproveCallback'

import { LinguiWrapper } from '../../../../../LinguiJestProvider'
import { useApproveCallback } from '../../hooks'
import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../../state'

jest.mock('@cowprotocol/analytics', () => ({
  useCowAnalytics: jest.fn(),
  __resetGtmInstance: jest.fn(),
}))

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  useTradeSpenderAddress: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('entities/optimisticAllowance/useSetOptimisticAllowance', () => ({
  useSetOptimisticAllowance: jest.fn(),
}))

jest.mock('./approveUtils', () => ({
  processApprovalTransaction: jest.fn(),
}))

jest.mock('../../hooks', () => ({
  useApproveCallback: jest.fn(),
}))

jest.mock('../../state', () => ({
  useUpdateApproveProgressModalState: jest.fn(),
  useResetApproveProgressModalState: jest.fn(),
}))

const mockUseCowAnalytics = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const mockUseTradeSpenderAddress = useTradeSpenderAddress as jest.MockedFunction<typeof useTradeSpenderAddress>
const mockUseApproveCallback = useApproveCallback as jest.MockedFunction<typeof useApproveCallback>
const mockUseUpdateTradeApproveState = useUpdateApproveProgressModalState as jest.MockedFunction<
  typeof useUpdateApproveProgressModalState
>
const mockUseResetApproveProgressModalState = useResetApproveProgressModalState as jest.MockedFunction<
  typeof useResetApproveProgressModalState
>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseSetOptimisticAllowance = useSetOptimisticAllowance as jest.MockedFunction<typeof useSetOptimisticAllowance>
const mockProcessApprovalTransaction = processApprovalTransaction as jest.MockedFunction<
  typeof processApprovalTransaction
>

// eslint-disable-next-line max-lines-per-function
describe('useTradeApproveCallback', () => {
  const mockToken = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'TEST', 'Test Token')
  const mockSpenderAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
  const mockAmount = BigInt('1000000000000000000')

  const mockSendEvent = jest.fn()
  const mockUpdateTradeApproveState = jest.fn()
  const mockResetApproveProgressModalState = jest.fn()
  const mockApproveCallback = jest.fn()
  const mockSetOptimisticAllowance = jest.fn()
  const mockAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // Valid address
  const mockChainId = 1

  const createMockTransactionReceipt = (status: number): TransactionReceipt => {
    return {
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
    }
  }

  const createMockTransactionResponse = (status: number): TransactionResponse =>
    ({
      hash: '0x15de6602b39be44ce9e6b57245deb4ee64ad28286c0f9f8094a6af2016e30591',
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
    mockUseApproveCallback.mockReturnValue(mockApproveCallback)
    mockUseUpdateTradeApproveState.mockReturnValue(mockUpdateTradeApproveState)
    mockUseResetApproveProgressModalState.mockReturnValue(mockResetApproveProgressModalState)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseWalletInfo.mockReturnValue({ chainId: mockChainId, account: mockAccount } as any)
    mockUseSetOptimisticAllowance.mockReturnValue(mockSetOptimisticAllowance)
  })

  describe('successful approval flow', () => {
    it('should extract and set optimistic allowance from transaction logs', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue({
        tokenAddress: mockToken.address.toLowerCase(),
        owner: mockAccount,
        spender: mockSpenderAddress,
        amount: mockAmount,
        blockNumber: 123456,
        chainId: mockChainId,
      })

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount, { useModals: true, waitForTxConfirmation: true })

      await waitFor(() => {
        expect(mockProcessApprovalTransaction).toHaveBeenCalled()
        expect(mockSetOptimisticAllowance).toHaveBeenCalledWith({
          tokenAddress: mockToken.address.toLowerCase(),
          owner: mockAccount,
          spender: mockSpenderAddress,
          amount: mockAmount,
          blockNumber: 123456,
          chainId: mockChainId,
        })
      })
    })

    it('should use actual approved amount from logs when user changes amount in wallet', async () => {
      const userChangedAmount = BigInt('5000000000000000000') // User changed to 5 tokens instead of 1
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue({
        tokenAddress: mockToken.address.toLowerCase(),
        owner: mockAccount,
        spender: mockSpenderAddress,
        amount: userChangedAmount,
        blockNumber: 123456,
        chainId: mockChainId,
      })

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount, { useModals: true, waitForTxConfirmation: true }) // Request 1 token

      await waitFor(() => {
        expect(mockProcessApprovalTransaction).toHaveBeenCalled()
        expect(mockSetOptimisticAllowance).toHaveBeenCalledWith({
          tokenAddress: mockToken.address.toLowerCase(),
          owner: mockAccount,
          spender: mockSpenderAddress,
          amount: userChangedAmount, // Should use the actual amount from logs, not mockAmount
          blockNumber: 123456,
          chainId: mockChainId,
        })
      })
    })

    it('should not set optimistic allowance when logs are missing', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null) // No approval data found

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount, { useModals: true, waitForTxConfirmation: true })

      await waitFor(() => {
        expect(mockProcessApprovalTransaction).toHaveBeenCalled()
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })

      expect(mockSetOptimisticAllowance).not.toHaveBeenCalled()
    })

    it('should successfully approve tokens and track analytics', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount, { useModals: true, waitForTxConfirmation: true })

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: true,
          amountToApprove: expect.any(Object),
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
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })

    it('should return transaction receipt on successful approval', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })

    it('should wait for transaction to be mined', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      const mockWait = jest.fn().mockResolvedValue(createMockTransactionReceipt(1))
      mockTxResponse.wait = mockWait
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount, { useModals: true, waitForTxConfirmation: true })

      await waitFor(() => {
        expect(mockWait).toHaveBeenCalled()
      })
    })
  })

  describe('failed approval flow', () => {
    it('should handle transaction failure (status !== 1)', async () => {
      const mockTxResponse = createMockTransactionResponse(0)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      // processApprovalTransaction will throw an error for status !== 1
      mockProcessApprovalTransaction.mockImplementation(() => {
        throw new Error('Approval transaction failed')
      })

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      const receipt = await result.current(mockAmount, { useModals: true, waitForTxConfirmation: true })

      await waitFor(() => {
        expect(receipt).toBeUndefined()
        // Error should be set first
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          error: expect.stringContaining('Approval transaction failed'),
        })
        // Then cleanup in finally block
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })

    it('should handle user rejection', async () => {
      const rejectError = { code: 4001, message: 'User rejected the request' }
      mockApproveCallback.mockRejectedValue(rejectError)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      const receipt = await result.current(mockAmount)

      await waitFor(() => {
        expect(receipt).toBeUndefined()
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          error: 'User rejected approval transaction',
        })
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })

    it('should handle generic errors and track analytics', async () => {
      const genericError = { code: 500, message: 'Network error' }
      mockApproveCallback.mockRejectedValue(genericError)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

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

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

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

  describe('useModals parameter', () => {
    it('should show modal when useModals is true (default)', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: true,
          amountToApprove: expect.any(Object),
        })
      })
    })

    it('should not show modal when useModals is false', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount, { useModals: false })

      await waitFor(() => {
        const modalCalls = mockUpdateTradeApproveState.mock.calls.filter((call) => call[0].approveInProgress === true)
        expect(modalCalls).toHaveLength(0)
      })
    })

    it('should still cleanup state even when useModals is false', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount, { useModals: false })

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })
  })

  describe('state cleanup', () => {
    it('should always reset state in finally block', async () => {
      const mockTxResponse = createMockTransactionResponse(1)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      mockProcessApprovalTransaction.mockReturnValue(null)

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })

    it('should reset state even on error', async () => {
      mockApproveCallback.mockRejectedValue(new Error('Test error'))

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })

    it('should reset state even when transaction fails', async () => {
      const mockTxResponse = createMockTransactionResponse(0)
      mockApproveCallback.mockResolvedValue(mockTxResponse)
      // processApprovalTransaction will throw an error for status !== 1
      mockProcessApprovalTransaction.mockImplementation(() => {
        throw new Error('Approval transaction failed')
      })

      const { result } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      await result.current(mockAmount)

      await waitFor(() => {
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({
          currency: mockToken,
          approveInProgress: false,
          amountToApprove: undefined,
          isPendingInProgress: false,
        })
      })
    })
  })

  describe('memoization and re-renders', () => {
    it('should return stable callback reference', () => {
      const { result, rerender } = renderHook(() => useTradeApproveCallback(mockToken), { wrapper: LinguiWrapper })

      const firstCallback = result.current

      rerender()

      expect(result.current).toBe(firstCallback)
    })

    it('should update callback when dependencies change', () => {
      const { result, rerender } = renderHook(({ currency }) => useTradeApproveCallback(currency), {
        initialProps: { currency: mockToken },
        wrapper: LinguiWrapper,
      })

      const firstCallback = result.current

      const newToken = new Token(1, '0x9876543210987654321098765432109876543210', 18, 'NEW', 'New Token')
      rerender({ currency: newToken })

      expect(result.current).not.toBe(firstCallback)
    })
  })
})
