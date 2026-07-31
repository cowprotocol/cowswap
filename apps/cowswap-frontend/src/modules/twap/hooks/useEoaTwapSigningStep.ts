import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { eoaTwapSigningStepAtom, EoaTwapSigningStepState } from '../state/eoaTwapSigningStepAtom'
import {
  cancelEoaTwapPlacement,
  EoaTwapPlacementCancelledError,
  isEoaTwapPlacementCancelled,
} from '../utils/eoaTwapPlacementCancel'

export type EoaTwapFlowUpdate = Partial<EoaTwapSigningStepState> & Pick<EoaTwapSigningStepState, 'step' | 'phase'>

export type EoaTwapFlowUpdater = (update: null | EoaTwapFlowUpdate) => void

export function useEoaTwapFlowUpdater(): EoaTwapFlowUpdater {
  const setState = useSetAtom(eoaTwapSigningStepAtom)

  return useCallback(
    (update: null | EoaTwapFlowUpdate) => {
      if (!update) {
        cancelEoaTwapPlacement()
        setState(null)
        return
      }

      // Allow clearing after dismiss, but block other updates that would repopulate signing state:
      if (isEoaTwapPlacementCancelled()) {
        throw new EoaTwapPlacementCancelledError()
      }

      const { step, phase, plan, lockDismiss } = update

      setState((prev) => ({
        step,
        phase,

        // These two values are sticky until the end of the placement, or until overridden by a subsequent update:
        plan: plan ?? prev?.plan ?? [],
        lockDismiss: lockDismiss ?? prev?.lockDismiss ?? false,
      }))
    },
    [setState],
  )
}

export function useEoaTwapSigningStep(): EoaTwapSigningStepState | null {
  return useAtomValue(eoaTwapSigningStepAtom)
}
