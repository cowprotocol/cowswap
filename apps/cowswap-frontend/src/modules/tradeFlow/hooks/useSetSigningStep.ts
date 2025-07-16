import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { signingStepAtom, SigningSteps } from 'entities/trade'

export function useSetSigningStep(): (stepNumber: string, step: SigningSteps) => void {
  const setState = useSetAtom(signingStepAtom)

  return useCallback(
    (stepNumber: string, step: SigningSteps) => {
      setState({
        stepNumber,
        step,
      })
    },
    [setState],
  )
}
