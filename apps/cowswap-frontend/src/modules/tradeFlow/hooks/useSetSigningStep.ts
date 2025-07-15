import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { signingStepAtom, SigningSteps } from '../state/SigningStepManagerAtom'

export function useSetSigningStep(): (stepNumber: number, step: SigningSteps) => void {
  const setState = useSetAtom(signingStepAtom)

  return useCallback(
    (stepNumber: number, step: SigningSteps) => {
      setState({
        stepNumber,
        step,
      })
    },
    [setState],
  )
}
