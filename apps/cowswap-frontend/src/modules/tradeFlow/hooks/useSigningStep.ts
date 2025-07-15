import { useAtomValue } from 'jotai'

import { signingStepAtom, SigningStepState } from '../state/SigningStepManagerAtom'

export function useSigningStep(): SigningStepState | null {
  return useAtomValue(signingStepAtom)
}
