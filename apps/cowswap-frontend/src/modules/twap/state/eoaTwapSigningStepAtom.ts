import { atom } from 'jotai'

import type { Hex } from 'viem'

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

  /** On-chain transaction hashes for completed wallet-action steps (approvals, setup tx). */
  completedStepTxHashes?: Partial<Record<EoaTwapSigningSteps, Hex>>

  /** Indexed TWAP event ID used for the Explorer details link. */
  eventId?: string
}

/**
 * Progress within the current EOA TWAP signing step.
 * On-chain: Sign → WaitingForTx → Confirmed.
 */
export enum EoaTwapSigningPhase {
  Sign = 'Sign',
  WaitingForTx = 'WaitingForTx',
  Confirmed = 'Confirmed',
}

export enum EoaTwapSigningSteps {
  ZeroApprovePoller = 'ZeroApprovePoller',
  ApprovePoller = 'ApprovePoller',
  /** EIP-2612 / Dai-like permit for ComposableCowPoller. */
  PermitPoller = 'PermitPoller',
  AuthorizeTwap = 'AuthorizeTwap',
  /** Cow-shed setup transaction. */
  TwapSign = 'TwapSign',
  /** Wait for the setup transaction to be mined. */
  SubmitTwap = 'SubmitTwap',
  /** Same as {@link SubmitTwap}, shown when activation is taking longer than usual. */
  SubmitTwapSlow = 'SubmitTwapSlow',
  /** Placement finished; the review card shows the inline success box. */
  Success = 'Success',
}

export const eoaTwapSigningStepAtom = atom<EoaTwapSigningStepState | null>(null)
