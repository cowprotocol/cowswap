import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { Token } from '@uniswap/sdk-core'

import { renderHook, waitFor } from '@testing-library/react'

import { useApproveAndSwap } from './useApproveAndSwap'
import { useApproveCurrency } from './useApproveCurrency'
import { useGeneratePermitInAdvanceToTrade } from './useGeneratePermitInAdvanceToTrade'

import { LinguiWrapper } from '../../../../LinguiJestProvider'
import { useTokenSupportsPermit } from '../../permit'
import { MAX_APPROVE_AMOUNT } from '../constants'
import { TradeApproveResult } from '../containers'
import { useIsPartialApproveSelectedByUser, useUpdateApproveProgressModalState } from '../state'

jest.mock('./useApproveCurrency')
jest.mock('./useGeneratePermitInAdvanceToTrade')
jest.mock('../../permit')
jest.mock('../state')

const mockUseApproveCurrency = useApproveCurrency as jest.MockedFunction<typeof useApproveCurrency>
const mockUseGeneratePermitInAdvanceToTrade = useGeneratePermitInAdvanceToTrade as jest.MockedFunction<
  typeof useGeneratePermitInAdvanceToTrade
>
const mockUseTokenSupportsPermit = useTokenSupportsPermit as jest.MockedFunction<typeof useTokenSupportsPermit>
const mockUseIsPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser as jest.MockedFunction<
  typeof useIsPartialApproveSelectedByUser
>
const mockUseUpdateTradeApproveState = useUpdateApproveProgressModalState as jest.MockedFunction<
  typeof useUpdateApproveProgressModalState
>

// eslint-disable-next-line max-lines-per-function
describe('useApproveAndSwap', () => {
  const mockToken = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'TEST', 'Test Token')
  const mockAmount = BigInt('1000000000000000000')
  const mockAmountToApprove = {
    currency: mockToken,
    quotient: { toString: () => mockAmount.toString() },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  const mockOnApproveConfirm = jest.fn()
  const mockHandleApprove = jest.fn()
  const mockGeneratePermitToTrade = jest.fn()
  const mockUpdateTradeApproveState = jest.fn()

  const createMockTransactionReceipt = (): TransactionReceipt => {
    return {
      to: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
      from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
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
      status: 1,
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseApproveCurrency.mockReturnValue(mockHandleApprove)
    mockUseGeneratePermitInAdvanceToTrade.mockReturnValue(mockGeneratePermitToTrade)
    mockUseTokenSupportsPermit.mockReturnValue(false)
    mockUseIsPartialApproveSelectedByUser.mockReturnValue(false)
    mockUseUpdateTradeApproveState.mockReturnValue(mockUpdateTradeApproveState)
  })

  describe('permit flow', () => {
    it('should handle successful permit signing and call onApproveConfirm', async () => {
      mockUseTokenSupportsPermit.mockReturnValue(true)
      mockGeneratePermitToTrade.mockResolvedValue(true)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockGeneratePermitToTrade).toHaveBeenCalled()
        expect(mockOnApproveConfirm).toHaveBeenCalled()
        expect(mockHandleApprove).not.toHaveBeenCalled()
      })
    })

    it('falls back to approval flow if permit signing fails', async () => {
      mockUseTokenSupportsPermit.mockReturnValue(true)
      mockGeneratePermitToTrade.mockResolvedValue(false)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockGeneratePermitToTrade).toHaveBeenCalled()
        expect(mockOnApproveConfirm).not.toHaveBeenCalled()
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
      })
    })

    it('should not call onApproveConfirm if onApproveConfirm callback is not provided', async () => {
      mockUseTokenSupportsPermit.mockReturnValue(true)
      mockGeneratePermitToTrade.mockResolvedValue(true)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: undefined,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockGeneratePermitToTrade).not.toHaveBeenCalled()
        expect(mockOnApproveConfirm).not.toHaveBeenCalled()
      })
    })

    it('should skip permit flow when ignorePermit is true', async () => {
      mockUseTokenSupportsPermit.mockReturnValue(true)
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<TransactionReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: BigInt('2000000000000000000'),
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: true,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockGeneratePermitToTrade).not.toHaveBeenCalled()
        expect(mockHandleApprove).toHaveBeenCalled()
        expect(mockOnApproveConfirm).toHaveBeenCalled()
      })
    })
  })

  describe('approval flow with TradeApproveResult', () => {
    it('should approve and call confirmSwap when approved amount is sufficient', async () => {
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<TransactionReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: BigInt('2000000000000000000'), // More than required
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
        expect(mockOnApproveConfirm).toHaveBeenCalled()
      })
    })

    it('should approve and call confirmSwap when approved amount equals required amount', async () => {
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<TransactionReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: mockAmount, // Exactly what's required
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
        expect(mockOnApproveConfirm).toHaveBeenCalled()
      })
    })

    it('should set error state when approved amount is insufficient', async () => {
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<TransactionReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: BigInt('500000000000000000'), // Less than required
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({ error: 'Approved amount is not sufficient!' })
        expect(mockOnApproveConfirm).not.toHaveBeenCalled()
      })
    })

    it('should set error state when approved amount is undefined', async () => {
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<TransactionReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: undefined,
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
        expect(mockUpdateTradeApproveState).toHaveBeenCalledWith({ error: 'Approved amount is not sufficient!' })
        expect(mockOnApproveConfirm).not.toHaveBeenCalled()
      })
    })

    it('should use partial approve amount when user has enabled it', async () => {
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(true)
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<TransactionReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: mockAmount,
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(mockAmount)
        expect(mockOnApproveConfirm).toHaveBeenCalled()
      })
    })
  })

  describe('no transaction or confirmSwap', () => {
    it('should not call confirmSwap when transaction is null', async () => {
      mockHandleApprove.mockResolvedValue(null)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
        expect(mockOnApproveConfirm).not.toHaveBeenCalled()
      })
    })

    it('should not call confirmSwap when transaction is undefined', async () => {
      mockHandleApprove.mockResolvedValue(undefined)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
        expect(mockOnApproveConfirm).not.toHaveBeenCalled()
      })
    })

    it('should not call confirmSwap when confirmSwap callback is not provided', async () => {
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<TransactionReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: mockAmount,
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: undefined,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
        expect(mockOnApproveConfirm).not.toHaveBeenCalled()
      })
    })
  })

  describe('useModals parameter', () => {
    it('should pass useModals=true to useApproveCurrency', () => {
      renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      expect(mockUseApproveCurrency).toHaveBeenCalledWith(mockAmountToApprove, true)
    })

    it('should pass useModals=false to useApproveCurrency', () => {
      renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: false,
          }),
        { wrapper: LinguiWrapper },
      )

      expect(mockUseApproveCurrency).toHaveBeenCalledWith(mockAmountToApprove, false)
    })

    it('should pass useModals=undefined to useApproveCurrency when not specified', () => {
      renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
          }),
        { wrapper: LinguiWrapper },
      )

      expect(mockUseApproveCurrency).toHaveBeenCalledWith(mockAmountToApprove, undefined)
    })
  })

  describe('error handling', () => {
    it('should propagate errors from handleApprove', async () => {
      const mockError = new Error('Approval failed')
      mockHandleApprove.mockRejectedValue(mockError)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await expect(result.current()).rejects.toThrow('Approval failed')

      expect(mockHandleApprove).toHaveBeenCalledWith(MAX_APPROVE_AMOUNT)
      expect(mockOnApproveConfirm).not.toHaveBeenCalled()
    })

    it('should propagate errors from generatePermitToTrade', async () => {
      mockUseTokenSupportsPermit.mockReturnValue(true)
      const mockError = new Error('Permit generation failed')
      mockGeneratePermitToTrade.mockRejectedValue(mockError)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await expect(result.current()).rejects.toThrow('Permit generation failed')

      expect(mockGeneratePermitToTrade).toHaveBeenCalled()
      expect(mockHandleApprove).not.toHaveBeenCalled()
      expect(mockOnApproveConfirm).not.toHaveBeenCalled()
    })
  })
})
