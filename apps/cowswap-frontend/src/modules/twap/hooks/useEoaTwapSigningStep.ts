import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import {
  EoaTwapSigningPhase,
  eoaTwapSigningStepAtom,
  EoaTwapSigningStepState,
  EoaTwapSigningSteps,
} from '../state/eoaTwapSigningStepAtom'

export function useEoaTwapSigningStep(): EoaTwapSigningStepState | null {
  return useAtomValue(eoaTwapSigningStepAtom)
}

export function useResetEoaTwapSigningStep(): () => void {
  const setState = useSetAtom(eoaTwapSigningStepAtom)

  return useCallback(() => {
    setState(null)
  }, [setState])
}

export function useSetEoaTwapSigningStep(): (
  step: EoaTwapSigningSteps,
  plan: EoaTwapSigningSteps[],
  phase?: EoaTwapSigningPhase,
) => void {
  const setState = useSetAtom(eoaTwapSigningStepAtom)

  return useCallback(
    (step: EoaTwapSigningSteps, plan: EoaTwapSigningSteps[], phase: EoaTwapSigningPhase = EoaTwapSigningPhase.Sign) => {
      setState({ step, plan, phase })
    },
    [setState],
  )
}
