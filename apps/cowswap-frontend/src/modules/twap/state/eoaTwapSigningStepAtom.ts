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

  /** Cow-shed factory setup transaction hash, set after the tx is submitted. */
  setupTxHash?: string

  /** Conditional TWAP order id, set after placement succeeds. */
  orderId?: string

  /** Cow-shed proxy that owns the TWAP, used for the temporary Explorer address link. */
  proxyAddress?: string
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
  /** Cow-shed EIP-712 signature for the setup multicall. */
  TwapSetup = 'TwapSetup',
  /** Factory executeHooks on-chain transaction. */
  TwapSign = 'TwapSign',
  /** Placement finished; the review card shows the inline success box. */
  Success = 'Success',
}

export const eoaTwapSigningStepAtom = atom<EoaTwapSigningStepState | null>(null)
