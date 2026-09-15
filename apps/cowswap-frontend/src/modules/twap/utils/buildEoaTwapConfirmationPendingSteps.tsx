import { ReactNode } from 'react'

import { Currency } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'

import { OrderStep, OrderStepStatus } from 'modules/trade'

import { ThreeDots } from 'common/pure/ThreeDots/ThreeDots.pure'

import { EoaTwapSigningPhase, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const LOADING_PHASES: ReadonlySet<EoaTwapSigningPhase> = new Set([
  EoaTwapSigningPhase.WaitingForTx,
  EoaTwapSigningPhase.Verifying,
])

const APPROVAL_STEPS = new Set<EoaTwapSigningSteps>([
  EoaTwapSigningSteps.ZeroApprovePoller,
  EoaTwapSigningSteps.ApprovePoller,
  EoaTwapSigningSteps.PermitPoller,
])

export interface BuildEoaTwapConfirmationPendingStepsParams {
  signingStep: EoaTwapSigningStepState
  symbol?: string
  token?: Currency
}

export function buildEoaTwapConfirmationPendingSteps({
  signingStep,
  symbol,
  token,
}: BuildEoaTwapConfirmationPendingStepsParams): OrderStep[] {
  const currentIndex = signingStep.plan.indexOf(signingStep.step)

  if (currentIndex === -1) {
    throw new Error(
      `EOA TWAP signing step "${signingStep.step}" is not present in plan [${signingStep.plan.join(', ')}]`,
    )
  }

  return signingStep.plan.map((step, index) => {
    const label = getEoaTwapStepLabel(step, symbol)
    const approvalToken = APPROVAL_STEPS.has(step) ? token : undefined

    let status: OrderStepStatus

    if (index < currentIndex || (index === currentIndex && signingStep.phase === EoaTwapSigningPhase.Confirmed)) {
      status = 'success'
    } else if (index === currentIndex) {
      status = LOADING_PHASES.has(signingStep.phase) ? 'loading' : 'active'
    } else {
      status = 'upcoming'
    }

    return {
      id: step,
      label,
      description: getEoaTwapStepDescription(step, status),
      status,
      ...(approvalToken ? { token: approvalToken } : {}),
    }
  })
}

export function getEoaTwapStepDescription(step: EoaTwapSigningSteps, status: OrderStepStatus): ReactNode | undefined {
  if (status === 'success') {
    return undefined
  }

  const isLoading = status === 'loading'

  switch (step) {
    case EoaTwapSigningSteps.ZeroApprovePoller:
    case EoaTwapSigningSteps.ApprovePoller:
      if (isLoading) {
        return (
          <p>
            {t`Waiting for tx`}
            <ThreeDots />
          </p>
        )
      }
      return t`Confirm the approval transaction in your connected wallet. Each part is pulled right before it trades.`

    case EoaTwapSigningSteps.PermitPoller:
      return t`Sign the permit in your wallet. Each part is pulled right before it trades.`

    case EoaTwapSigningSteps.TwapSetup:
      if (isLoading) {
        return (
          <p>
            {t`Submitting setup transaction`}
            <ThreeDots />
          </p>
        )
      }
      return t`Confirm setup in your connected wallet. This registers just-in-time funding and creates the TWAP.`

    case EoaTwapSigningSteps.CreatingOrder:
      return (
        <p>
          {t`Activating your TWAP`}
          <ThreeDots />
        </p>
      )
  }
}

export function getEoaTwapStepLabel(step: EoaTwapSigningSteps, symbol?: string): string {
  switch (step) {
    case EoaTwapSigningSteps.ZeroApprovePoller:
    case EoaTwapSigningSteps.ApprovePoller:
      return symbol ? t`Approve ${symbol} for funding` : t`Approve funding`
    case EoaTwapSigningSteps.PermitPoller:
      return symbol ? t`Permit ${symbol} for funding` : t`Permit funding`
    case EoaTwapSigningSteps.TwapSetup:
      return t`Set up TWAP`
    case EoaTwapSigningSteps.CreatingOrder:
      return t`Activating TWAP`
  }
}
