import { atom } from 'jotai'

export interface EoaTwapSigningStepState {
  step: EoaTwapSigningSteps
  plan: EoaTwapSigningSteps[]
  phase: EoaTwapSigningPhase
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
  ZeroApprove = 'ZeroApprove',
  ApproveOrPermit = 'ApproveOrPermit',
  TwapSetup = 'TwapSetup',
  FundingOrder = 'FundingOrder',
  CreatingOrder = 'CreatingOrder',
}

export const eoaTwapSigningStepAtom = atom<EoaTwapSigningStepState | null>(null)
