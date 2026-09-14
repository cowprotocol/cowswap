import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import type { Hex } from 'viem'

import { eoaTwapSigningStepAtom, EoaTwapSigningStepState } from '../state/eoaTwapSigningStepAtom'
import {
  cancelEoaTwapPlacement,
  EoaTwapPlacementCancelledError,
  isEoaTwapPlacementCancelled,
} from '../utils/eoaTwapPlacementCancel'

export type EoaTwapFlowUpdate = Partial<Omit<EoaTwapSigningStepState, 'completedStepTxHashes'>> &
  Pick<EoaTwapSigningStepState, 'step' | 'phase'> & {
    /** Merged into {@link EoaTwapSigningStepState.completedStepTxHashes} for the given step. */
    stepTxHash?: Hex
  }

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

  const completedStepTxHashes = update.stepTxHash
    ? {
        ...(base.completedStepTxHashes ?? {}),
        [update.step]: update.stepTxHash,
      }
    : base.completedStepTxHashes

  return {
    step: update.step,
    phase: update.phase,
    // Sticky until the end of the placement, or until overridden by a subsequent update:
    plan: update.plan ?? base.plan,
    lockDismiss: update.lockDismiss ?? base.lockDismiss,
    completedStepTxHashes,
    orderId: update.orderId ?? base.orderId,
    proxyAddress: update.proxyAddress ?? base.proxyAddress,
  }
}
