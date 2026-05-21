import { atom } from 'jotai'

export interface SigningStepState {
  stepNumber: string
  step: SigningSteps
}

export enum SigningSteps {
  PermitSigning = 'PermitSigning',
  BridgingSigning = 'BridgingSigning',
  PreparingDepositAddress = 'PreparingDepositAddress',
  OrderSigning = 'OrderSigning',
}

export const signingStepAtom = atom<SigningStepState | null>(null)
