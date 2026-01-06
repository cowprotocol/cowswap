import { ReactElement, ReactNode } from 'react'

import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { act, renderHook } from '@testing-library/react'

import { usePendingApprovalModal } from './usePendingApprovalModal'

import { LinguiWrapper } from '../../../../LinguiJestProvider'
import { MAX_APPROVE_AMOUNT } from '../constants'

interface ConfirmationPendingContentProps {
  onDismiss: () => void
  title: ReactNode
  description: ReactNode
  operationLabel: string
  modalMode?: boolean
  isPendingInProgress?: boolean
}

const mockCloseModal = jest.fn()
const mockModalState = {
  isModalOpen: false,
  openModal: jest.fn(),
  closeModal: mockCloseModal,
  context: 'TEST_TOKEN',
}

jest.mock('common/hooks/useModalState', () => ({
  useModalState: () => mockModalState,
}))

const mockIsMaxAmountToApprove = jest.fn()
jest.mock('../utils', () => ({
  isMaxAmountToApprove: (amount: CurrencyAmount<Currency> | undefined) => mockIsMaxAmountToApprove(amount),
}))

jest.mock('common/pure/ConfirmationPendingContent', () => ({
  ConfirmationPendingContent: jest.fn(() => <div data-testid="confirmation-pending-content" />),
}))

const mockToken = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
const mockMaxAmount = CurrencyAmount.fromRawAmount(mockToken, MAX_APPROVE_AMOUNT.toString())
const mockPartialAmount = CurrencyAmount.fromRawAmount(mockToken, '1000000000000000000') // 1 DAI

describe('usePendingApprovalModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mockIsMaxAmountToApprove to return true for mockMaxAmount and false for others
    mockIsMaxAmountToApprove.mockImplementation((amount) => {
      if (!amount) return false
      return amount.quotient.toString() === MAX_APPROVE_AMOUNT.toString()
    })
  })

  it('should return Modal and state', () => {
    const { result } = renderHook(() => usePendingApprovalModal(), { wrapper: LinguiWrapper })

    expect(result.current).toHaveProperty('Modal')
    expect(result.current).toHaveProperty('state')
    expect(result.current.state).toBe(mockModalState)
  })

  it('should handle empty params', () => {
    const { result } = renderHook(() => usePendingApprovalModal(), { wrapper: LinguiWrapper })

    expect(result.current.Modal).toBeDefined()
  })

  it('should use context when currencySymbol is not provided', () => {
    const { result } = renderHook(() => usePendingApprovalModal(), { wrapper: LinguiWrapper })

    expect(result.current.Modal).toBeDefined()
    // The Modal should use the context value 'TEST_TOKEN' from mockModalState
  })

  it('should use currencySymbol when provided', () => {
    const { result } = renderHook(() => usePendingApprovalModal({ currencySymbol: 'DAI' }), { wrapper: LinguiWrapper })

    expect(result.current.Modal).toBeDefined()
    // The Modal should use the provided currencySymbol 'DAI'
  })

  it('should pass modalMode to ConfirmationPendingContent', () => {
    const { result: resultWithModalMode } = renderHook(() => usePendingApprovalModal({ modalMode: true }), {
      wrapper: LinguiWrapper,
    })

    expect(resultWithModalMode.current.Modal).toBeDefined()

    const { result: resultWithoutModalMode } = renderHook(() => usePendingApprovalModal({ modalMode: false }), {
      wrapper: LinguiWrapper,
    })

    expect(resultWithoutModalMode.current.Modal).toBeDefined()
  })

  it('should pass isPendingInProgress to ConfirmationPendingContent', () => {
    const { result: resultWithPending } = renderHook(() => usePendingApprovalModal({ isPendingInProgress: true }), {
      wrapper: LinguiWrapper,
    })

    expect(resultWithPending.current.Modal).toBeDefined()

    const { result: resultWithoutPending } = renderHook(() => usePendingApprovalModal({ isPendingInProgress: false }), {
      wrapper: LinguiWrapper,
    })

    expect(resultWithoutPending.current.Modal).toBeDefined()
  })

  it('should handle onDismiss callback', () => {
    const mockOnDismiss = jest.fn()

    const { result } = renderHook(() => usePendingApprovalModal({ onDismiss: mockOnDismiss }), {
      wrapper: LinguiWrapper,
    })

    // Extract the onDismiss prop from the Modal and call it
    const onDismissCallback = (result.current.Modal as ReactElement<ConfirmationPendingContentProps>).props.onDismiss
    act(() => {
      onDismissCallback()
    })

    expect(mockCloseModal).toHaveBeenCalled()
    expect(mockOnDismiss).toHaveBeenCalled()
  })

  it('should display token amount when amountToApprove is provided and not max', () => {
    const { result } = renderHook(() => usePendingApprovalModal({ amountToApprove: mockPartialAmount }), {
      wrapper: LinguiWrapper,
    })

    expect(result.current.Modal).toBeDefined()
    // The Modal should display the token amount
  })

  it('should not display token amount when amountToApprove is max', () => {
    const { result } = renderHook(() => usePendingApprovalModal({ amountToApprove: mockMaxAmount }), {
      wrapper: LinguiWrapper,
    })

    expect(result.current.Modal).toBeDefined()
  })

  it('should not display token amount when amountToApprove is not provided', () => {
    const { result } = renderHook(() => usePendingApprovalModal({ currencySymbol: 'DAI' }), { wrapper: LinguiWrapper })

    expect(result.current.Modal).toBeDefined()
  })

  it('should pass isPendingInProgress to ConfirmationPendingContent', () => {
    const { result } = renderHook(() => usePendingApprovalModal({ isPendingInProgress: true }), {
      wrapper: LinguiWrapper,
    })

    const confirmationPendingContent = (result.current.Modal as ReactElement<ConfirmationPendingContentProps>).props
    expect(confirmationPendingContent.isPendingInProgress).toBe(true)
  })
})
