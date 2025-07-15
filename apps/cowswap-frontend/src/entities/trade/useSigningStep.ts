import { useAtomValue } from 'jotai'

import { signingStepAtom, SigningStepState } from './index'

export function useSigningStep(): SigningStepState | null {
  return useAtomValue(signingStepAtom)
}
