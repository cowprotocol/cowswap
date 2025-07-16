import { useAtomValue } from 'jotai'

import { signingStepAtom, SigningStepState } from './signingStepAtom'

export function useSigningStep(): SigningStepState | null {
  return useAtomValue(signingStepAtom)
}
