import { i18n, MessageDescriptor } from '@lingui/core'

import { msg } from '@lingui/core/macro'

import { ConfirmationPendingStep } from 'common/pure/ConfirmationPendingContent'

import { EoaTwapSigningPhase, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const EOA_TWAP_SIGNING_STEP_LABELS: Record<EoaTwapSigningSteps, Record<EoaTwapSigningPhase, MessageDescriptor>> = {
  [EoaTwapSigningSteps.ZeroApprove]: {
    [EoaTwapSigningPhase.Sign]: msg`Reset approval`,
    [EoaTwapSigningPhase.WaitingForTx]: msg`Waiting for tx`,
    [EoaTwapSigningPhase.Verifying]: msg`Verifying allowance`,
    [EoaTwapSigningPhase.Confirmed]: msg`Approval reset`,
  },
  [EoaTwapSigningSteps.ApproveOrPermit]: {
    [EoaTwapSigningPhase.Sign]: msg`Confirm approval`,
    [EoaTwapSigningPhase.WaitingForTx]: msg`Waiting for tx`,
    [EoaTwapSigningPhase.Verifying]: msg`Verifying allowance`,
    [EoaTwapSigningPhase.Confirmed]: msg`Approval confirmed`,
  },
  [EoaTwapSigningSteps.TwapSetup]: {
    [EoaTwapSigningPhase.Sign]: msg`Sign TWAP setup`,
    [EoaTwapSigningPhase.WaitingForTx]: msg`Sign TWAP setup`,
    [EoaTwapSigningPhase.Verifying]: msg`Sign TWAP setup`,
    [EoaTwapSigningPhase.Confirmed]: msg`TWAP setup signed`,
  },
  [EoaTwapSigningSteps.FundingOrder]: {
    [EoaTwapSigningPhase.Sign]: msg`Confirm order`,
    [EoaTwapSigningPhase.WaitingForTx]: msg`Waiting for tx`,
    [EoaTwapSigningPhase.Verifying]: msg`Verifying allowance`,
    [EoaTwapSigningPhase.Confirmed]: msg`Order confirmed`,
  },
  [EoaTwapSigningSteps.CreatingOrder]: {
    [EoaTwapSigningPhase.Sign]: msg`Creating order`,
    [EoaTwapSigningPhase.WaitingForTx]: msg`Waiting for settlement`,
    [EoaTwapSigningPhase.Verifying]: msg`Waiting for settlement`,
    [EoaTwapSigningPhase.Confirmed]: msg`Order created`,
  },
}

const LOADING_PHASES: ReadonlySet<EoaTwapSigningPhase> = new Set([
  EoaTwapSigningPhase.WaitingForTx,
  EoaTwapSigningPhase.Verifying,
])

export function buildEoaTwapConfirmationPendingSteps(signingStep: EoaTwapSigningStepState): ConfirmationPendingStep[] {
  const currentIndex = signingStep.plan.indexOf(signingStep.step)

  return signingStep.plan.map((step, index) => {
    if (index < currentIndex) {
      return {
        id: step,
        label: getEoaTwapStepLabel(step, EoaTwapSigningPhase.Confirmed),
        status: 'finished',
      }
    }

    if (index === currentIndex) {
      const isConfirmed = signingStep.phase === EoaTwapSigningPhase.Confirmed

      return {
        id: step,
        label: getEoaTwapStepLabel(step, signingStep.phase),
        status: isConfirmed ? 'finished' : 'active',
        loading: LOADING_PHASES.has(signingStep.phase),
      }
    }

    return {
      id: step,
      label: getEoaTwapStepLabel(step, EoaTwapSigningPhase.Sign),
      status: 'upcoming',
    }
  })
}

export function getEoaTwapStepLabel(
  step: EoaTwapSigningSteps,
  phase: EoaTwapSigningPhase = EoaTwapSigningPhase.Sign,
): string {
  return i18n._(EOA_TWAP_SIGNING_STEP_LABELS[step][phase])
}
