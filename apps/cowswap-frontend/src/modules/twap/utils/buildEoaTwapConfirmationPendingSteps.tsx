import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'

import { MultiConfirmationPendingStep } from 'common/pure/ConfirmationPendingContent'
import { ThreeDots } from 'common/pure/ThreeDots/ThreeDots.pure'

import { EoaTwapSigningPhase, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const LOADING_PHASES: ReadonlySet<EoaTwapSigningPhase> = new Set([
  EoaTwapSigningPhase.WaitingForTx,
  EoaTwapSigningPhase.Verifying,
])

export interface BuildEoaTwapConfirmationPendingStepsParams {
  symbol?: string
}

export function buildEoaTwapConfirmationPendingSteps(
  signingStep: EoaTwapSigningStepState,
  { symbol }: BuildEoaTwapConfirmationPendingStepsParams = {},
): MultiConfirmationPendingStep[] {
  const currentIndex = signingStep.plan.indexOf(signingStep.step)

  if (currentIndex === -1) {
    throw new Error(
      `EOA TWAP signing step "${signingStep.step}" is not present in plan [${signingStep.plan.join(', ')}]`,
    )
  }

  return signingStep.plan.map((step, index) => {
    const label = getEoaTwapStepLabel(step, symbol)

    if (index < currentIndex) {
      return {
        id: step,
        label,
        description: getEoaTwapStepDescription(step, 'success'),
        status: 'success',
      }
    }

    if (index === currentIndex) {
      if (signingStep.phase === EoaTwapSigningPhase.Confirmed) {
        return {
          id: step,
          label,
          description: getEoaTwapStepDescription(step, 'success'),
          status: 'success',
        }
      }

      const status = LOADING_PHASES.has(signingStep.phase) ? 'loading' : 'active'

      return {
        id: step,
        label,
        description: getEoaTwapStepDescription(step, status),
        status,
      }
    }

    return {
      id: step,
      label,
      description: getEoaTwapStepDescription(step, 'upcoming'),
      status: 'upcoming',
    }
  })
}

export function getEoaTwapStepDescription(
  step: EoaTwapSigningSteps,
  status: MultiConfirmationPendingStep['status'],
): ReactNode | undefined {
  if (status === 'success') {
    return undefined
  }

  const isLoading = status === 'loading'

  switch (step) {
    case EoaTwapSigningSteps.ZeroApprove:
    case EoaTwapSigningSteps.ApproveOrPermit:
      if (isLoading) {
        return waitingForTxDescription()
      }
      return t`Confirm the approval transaction in your connected wallet.`

    case EoaTwapSigningSteps.ZeroApprovePoller:
    case EoaTwapSigningSteps.ApprovePoller:
      if (isLoading) {
        return waitingForTxDescription()
      }
      return t`Confirm the approval transaction in your connected wallet. Each part is pulled right before it trades.`

    case EoaTwapSigningSteps.RegisterPoller:
      if (isLoading) {
        return waitingForTxDescription()
      }
      return t`Confirm the funding schedule transaction in your connected wallet.`

    case EoaTwapSigningSteps.TwapSetup:
      return t`Confirm this required setup signature in your connected wallet.`

    case EoaTwapSigningSteps.FundingOrder:
      if (isLoading) {
        return (
          <p>
            {t`Verifying approval`}
            <ThreeDots />
          </p>
        )
      }
      return t`Sign in your wallet. We'll submit the setup order automatically.`

    case EoaTwapSigningSteps.CreatingOrder:
      return (
        <p>
          {t`Settling the setup order and registering your TWAP`}
          <ThreeDots />
        </p>
      )
  }
}

export function getEoaTwapStepLabel(step: EoaTwapSigningSteps, symbol?: string): string {
  switch (step) {
    case EoaTwapSigningSteps.ZeroApprove:
    case EoaTwapSigningSteps.ApproveOrPermit:
      return symbol ? t`Approve ${symbol}` : t`Approve`
    case EoaTwapSigningSteps.ZeroApprovePoller:
    case EoaTwapSigningSteps.ApprovePoller:
      return symbol ? t`Approve ${symbol} for funding` : t`Approve funding`
    case EoaTwapSigningSteps.RegisterPoller:
      return t`Schedule funding`
    case EoaTwapSigningSteps.TwapSetup:
      return t`Set up TWAP`
    case EoaTwapSigningSteps.FundingOrder:
      return t`Sign TWAP`
    case EoaTwapSigningSteps.CreatingOrder:
      return t`Activating TWAP`
  }
}

function waitingForTxDescription(): ReactNode {
  return (
    <p>
      {t`Waiting for tx`}
      <ThreeDots />
    </p>
  )
}
