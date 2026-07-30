import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import {
  EoaTwapSigningPhase,
  eoaTwapSigningStepAtom,
  EoaTwapSigningStepState,
  EoaTwapSigningSteps,
} from '../state/eoaTwapSigningStepAtom'

export type EoaTwapFlowUpdater = (
  step: EoaTwapSigningSteps | null,
  phase?: EoaTwapSigningPhase,
  plan?: EoaTwapSigningSteps[],
) => void

export function useEoaTwapFlowUpdater(): EoaTwapFlowUpdater {
  const setState = useSetAtom(eoaTwapSigningStepAtom)

  return useCallback(
    (step: EoaTwapSigningSteps | null, phase?: EoaTwapSigningPhase, plan?: EoaTwapSigningSteps[]) => {
      if (!step || !phase) {
        setState(null)
        return
      }

      setState((prev) => ({
        plan: plan ?? prev?.plan ?? [],
        step,
        phase,
      }))
    },
    [setState],
  )
}

export function useEoaTwapSigningStep(): EoaTwapSigningStepState | null {
  return useAtomValue(eoaTwapSigningStepAtom)
}
