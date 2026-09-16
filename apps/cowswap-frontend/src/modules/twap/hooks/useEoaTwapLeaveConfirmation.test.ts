import { act, renderHook } from '@testing-library/react'

import { useEoaTwapLeaveConfirmation } from './useEoaTwapLeaveConfirmation'
import { useEoaTwapSigningStep } from './useEoaTwapSigningStep'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

jest.mock('./useEoaTwapSigningStep', () => ({ useEoaTwapSigningStep: jest.fn() }))

const mockUseEoaTwapSigningStep = useEoaTwapSigningStep as jest.MockedFunction<typeof useEoaTwapSigningStep>

const DEFAULT_PLAN = [
  EoaTwapSigningSteps.ApprovePoller,
  EoaTwapSigningSteps.TwapSetup,
  EoaTwapSigningSteps.TwapSign,
  EoaTwapSigningSteps.SubmitTwap,
]

describe('useEoaTwapLeaveConfirmation()', () => {
  const onDismiss = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEoaTwapSigningStep.mockReturnValue(null)
  })

  it('opens the leave modal when dismiss is requested during an active wallet signature', () => {
    mockUseEoaTwapSigningStep.mockReturnValue({
      step: EoaTwapSigningSteps.TwapSign,
      phase: EoaTwapSigningPhase.Sign,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    })

    const { result } = renderHook(() => useEoaTwapLeaveConfirmation({ symbol: 'USDC', onDismiss }))

    act(() => {
      result.current.onDismissRequest()
    })

    expect(result.current.leaveSetupModalProps?.isOpen).toBe(true)
    expect(result.current.leaveSetupModalProps?.variant).toBe('walletRequest')
  })

  it('closes the leave modal when the wallet request completes', () => {
    mockUseEoaTwapSigningStep.mockReturnValue({
      step: EoaTwapSigningSteps.TwapSign,
      phase: EoaTwapSigningPhase.Sign,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    })

    const { result, rerender } = renderHook(() => useEoaTwapLeaveConfirmation({ symbol: 'USDC', onDismiss }))

    act(() => {
      result.current.onDismissRequest()
    })

    expect(result.current.leaveSetupModalProps?.isOpen).toBe(true)

    mockUseEoaTwapSigningStep.mockReturnValue({
      step: EoaTwapSigningSteps.SubmitTwap,
      phase: EoaTwapSigningPhase.WaitingForTx,
      plan: DEFAULT_PLAN,
      lockDismiss: true,
    })

    rerender()

    expect(result.current.leaveSetupModalProps?.isOpen).toBe(false)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('closes the leave modal when the variant changes to another valid one', () => {
    mockUseEoaTwapSigningStep.mockReturnValue({
      step: EoaTwapSigningSteps.TwapSign,
      phase: EoaTwapSigningPhase.Sign,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    })

    const { result, rerender } = renderHook(() => useEoaTwapLeaveConfirmation({ symbol: 'USDC', onDismiss }))

    act(() => {
      result.current.onDismissRequest()
    })

    expect(result.current.leaveSetupModalProps?.variant).toBe('walletRequest')

    mockUseEoaTwapSigningStep.mockReturnValue({
      step: EoaTwapSigningSteps.TwapSign,
      phase: EoaTwapSigningPhase.WaitingForTx,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    })

    rerender()

    expect(result.current.leaveSetupModalProps?.isOpen).toBe(false)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('keeps the leave modal open while the wallet request is still pending', () => {
    mockUseEoaTwapSigningStep.mockReturnValue({
      step: EoaTwapSigningSteps.TwapSign,
      phase: EoaTwapSigningPhase.Sign,
      plan: DEFAULT_PLAN,
      lockDismiss: false,
    })

    const { result, rerender } = renderHook(() => useEoaTwapLeaveConfirmation({ symbol: 'USDC', onDismiss }))

    act(() => {
      result.current.onDismissRequest()
    })

    rerender()

    expect(result.current.leaveSetupModalProps?.isOpen).toBe(true)
  })
})
