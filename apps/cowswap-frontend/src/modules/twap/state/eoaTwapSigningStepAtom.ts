import { atom } from 'jotai'

export interface EoaTwapSigningStepState {
  step: EoaTwapSigningSteps
  phase: EoaTwapSigningPhase

  /**
   * The plan of steps to execute the TWAP.
   *
   * Set when the TWAP creation flow is initiated and preserved until the end of the flow (unless any step needs to
   * update it mid-flow).
   */
  plan: EoaTwapSigningSteps[]

  /**
   * When true, hide back/close in `ConfirmationPendingContentShell`.
   *
   * Set once the setup transaction is submitted and preserved until the end of the flow (unless any step needs to
   * update it mid-flow).
   */
  lockDismiss: boolean
}

/**
 * Progress within the current EOA TWAP signing step.
 * On-chain: Sign → WaitingForTx → (optional Verifying) → Confirmed.
 * Signature-only steps typically use Sign → Confirmed.
 */
export enum EoaTwapSigningPhase {
  Confirmed = 'Confirmed',
  Sign = 'Sign',
  Verifying = 'Verifying',
  WaitingForTx = 'WaitingForTx',
}

export enum EoaTwapSigningSteps {
  ZeroApprovePoller = 'ZeroApprovePoller',
  ApprovePoller = 'ApprovePoller',
  /** EIP-2612 / Dai-like permit for ComposableCowPoller. */
  PermitPoller = 'PermitPoller',
  TwapSetup = 'TwapSetup',
  CreatingOrder = 'CreatingOrder',
}

export const eoaTwapSigningStepAtom = atom<EoaTwapSigningStepState | null>(null)
