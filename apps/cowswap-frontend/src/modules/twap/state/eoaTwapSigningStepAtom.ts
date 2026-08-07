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
   * Set once the funding-order EIP-712 signature is requested and preserved until the end of the flow (unless any step
   * needs to update it mid-flow).
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
  ZeroApproveVaultRelayer = 'ZeroApproveVaultRelayer',
  ApproveVaultRelayer = 'ApproveVaultRelayer',
  ZeroApprovePoller = 'ZeroApprovePoller',
  ApprovePoller = 'ApprovePoller',
  /** EIP-2612 / Dai-like permit for ComposableCowPoller (sell=buy pre-hook). */
  PermitPoller = 'PermitPoller',
  TwapSetup = 'TwapSetup',
  FundingOrder = 'FundingOrder',
  CreatingOrder = 'CreatingOrder',
}

export const eoaTwapSigningStepAtom = atom<EoaTwapSigningStepState | null>(null)
