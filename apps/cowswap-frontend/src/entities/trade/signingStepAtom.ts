import { atom } from 'jotai'

export enum SigningSteps {
  PermitSigning = 'PermitSigning',
  BridgingSigning = 'BridgingSigning',
  OrderSigning = 'BridgingSign',
}

export interface SigningStepState {
  stepNumber: string
  step: SigningSteps
}

export const signingStepAtom = atom<SigningStepState | null>(null)
