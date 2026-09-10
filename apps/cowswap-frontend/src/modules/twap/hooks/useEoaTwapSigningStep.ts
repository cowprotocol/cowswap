import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { eoaTwapSigningStepAtom, EoaTwapSigningStepState } from '../state/eoaTwapSigningStepAtom'
import {
  cancelEoaTwapPlacement,
  EoaTwapPlacementCancelledError,
  isEoaTwapPlacementCancelled,
} from '../utils/eoaTwapPlacementCancel'

export type EoaTwapFlowUpdate = Partial<EoaTwapSigningStepState> & Pick<EoaTwapSigningStepState, 'step' | 'phase'>

export type EoaTwapFlowUpdater = (update: EoaTwapFlowUpdaterArg) => void

export type EoaTwapFlowUpdaterArg =
  | null
  | EoaTwapFlowUpdate
  | ((prev: EoaTwapSigningStepState | null) => EoaTwapFlowUpdate)

export function useEoaTwapFlowUpdater(): EoaTwapFlowUpdater {
  const setState = useSetAtom(eoaTwapSigningStepAtom)

  return useCallback(
    (update: EoaTwapFlowUpdaterArg) => {
      if (!update) {
        cancelEoaTwapPlacement()
        setState(null)
        return
      }

      // Allow clearing after dismiss, but block other updates that would repopulate signing state:
      if (isEoaTwapPlacementCancelled()) {
        throw new EoaTwapPlacementCancelledError()
      }

      setState((prev) => mergeEoaTwapFlowState(prev, typeof update === 'function' ? update(prev) : update))
    },
    [setState],
  )
}

export function useEoaTwapSigningStep(): EoaTwapSigningStepState | null {
  return useAtomValue(eoaTwapSigningStepAtom)
}

function mergeEoaTwapFlowState(
  prev: EoaTwapSigningStepState | null,
  update: EoaTwapFlowUpdate,
): EoaTwapSigningStepState {
  const base: EoaTwapSigningStepState = prev ?? {
    step: update.step,
    phase: update.phase,
    plan: [],
    lockDismiss: false,
  }

  return {
    step: update.step,
    phase: update.phase,
    // Sticky until the end of the placement, or until overridden by a subsequent update:
    plan: update.plan ?? base.plan,
    lockDismiss: update.lockDismiss ?? base.lockDismiss,
    setupTxHash: update.setupTxHash ?? base.setupTxHash,
    orderId: update.orderId ?? base.orderId,
    proxyAddress: update.proxyAddress ?? base.proxyAddress,
  }
}
