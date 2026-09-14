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

  /** Conditional TWAP order id, set after placement succeeds. */
  orderId?: string

  /** Cow-shed proxy that owns the TWAP, used for the temporary Explorer address link. */
  proxyAddress?: string
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
  /** Cow-shed EIP-712 signature for the setup multicall. */
  TwapSetup = 'TwapSetup',
  /** Factory executeHooks on-chain transaction. */
  TwapSign = 'TwapSign',
  /** Wait for the factory executeHooks transaction to be mined. */
  SubmitTwap = 'SubmitTwap',
  /** Same as {@link SubmitTwap}, shown when activation is taking longer than usual. */
  SubmitTwapSlow = 'SubmitTwapSlow',
  /** Placement finished; the review card shows the inline success box. */
  Success = 'Success',
}

export const eoaTwapSigningStepAtom = atom<EoaTwapSigningStepState | null>(null)
