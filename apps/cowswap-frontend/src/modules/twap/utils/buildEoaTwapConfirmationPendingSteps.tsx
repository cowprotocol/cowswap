import { ReactNode } from 'react'

import { t } from '@lingui/core/macro'

import { OrderStep, OrderStepStatus } from 'modules/trade'

import { ThreeDots } from 'common/pure/ThreeDots/ThreeDots.pure'

import { EoaTwapSigningPhase, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const LOADING_PHASES: ReadonlySet<EoaTwapSigningPhase> = new Set([
  EoaTwapSigningPhase.WaitingForTx,
  EoaTwapSigningPhase.Verifying,
])

export interface BuildEoaTwapConfirmationPendingStepsParams {
  signingStep: EoaTwapSigningStepState
  symbol?: string
}

export function buildEoaTwapConfirmationPendingSteps({
  signingStep,
  symbol,
}: BuildEoaTwapConfirmationPendingStepsParams): OrderStep[] {
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

export function getEoaTwapStepDescription(step: EoaTwapSigningSteps, status: OrderStepStatus): ReactNode | undefined {
  const isLoading = status === 'loading'

  switch (step) {
    case EoaTwapSigningSteps.ZeroApprove:
    case EoaTwapSigningSteps.ApproveOrPermit:
      if (isLoading) {
        return (
          <p>
            {t`Waiting for tx`}
            <ThreeDots />
          </p>
        )
      }
      return t`Confirm the approval transaction in your connected wallet.`

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
      return t`Sign in your wallet. We'll submit the funding order automatically.`

    case EoaTwapSigningSteps.CreatingOrder:
      // Completed step has nothing useful to re-expand:
      if (status === 'success') {
        return undefined
      }

      return (
        <p>
          {t`Settling the funding order and registering your TWAP`}
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
    case EoaTwapSigningSteps.TwapSetup:
      return t`Set up TWAP`
    case EoaTwapSigningSteps.FundingOrder:
      return t`Sign TWAP`
    case EoaTwapSigningSteps.CreatingOrder:
      return t`Activating TWAP`
  }
}
