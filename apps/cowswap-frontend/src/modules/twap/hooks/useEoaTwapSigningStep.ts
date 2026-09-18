import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import type { Hex } from 'viem'

import { usePrevious } from '@cowprotocol/common-hooks'
import { jotaiStore } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import { eoaTwapSigningStepAtom, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'
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

/**
 * Reset the EOA Twap success screen if the order displayed there is the cancelled one.
 */
export function resetEoaTwapSuccessScreenIfMatches(twapOrderId: string, updateEoaTwapFlow: EoaTwapFlowUpdater): void {
  const signingStep = jotaiStore.get(eoaTwapSigningStepAtom)

  if (signingStep?.step === EoaTwapSigningSteps.Success && signingStep.eventId === twapOrderId) {
    updateEoaTwapFlow(null)
  }
}

export function useEoaTwapFlowUpdater(): EoaTwapFlowUpdater {
  const { account, chainId } = useWalletInfo()
  const prevAccount = usePrevious(account)
  const prevChainId = usePrevious(chainId)
  const setState = useSetAtom(eoaTwapSigningStepAtom)

  const updateEoaTwapFlow = useCallback(
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

  useEffect(() => {
    if ((prevChainId && chainId !== prevChainId) || (prevAccount && prevAccount !== account)) {
      // Reset the EOA Twap success screen if the account or chain id changes:
      updateEoaTwapFlow(null)
    }
  }, [account, chainId, prevAccount, prevChainId, updateEoaTwapFlow])

  return updateEoaTwapFlow
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
    eventId: update.eventId ?? base.eventId,
  }
}
