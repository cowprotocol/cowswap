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
}: BuildEoaTwapConfirmationPendingStepsParams): OrderStep[] | null {
  const currentIndex = signingStep.plan.indexOf(signingStep.step)

  // Success is a terminal UI state and is intentionally omitted from the plan, so we just return null:
  if (currentIndex === -1) {
    return null
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
      return t`Sign the setup in your wallet. This registers just-in-time funding and creates the TWAP.`

    case EoaTwapSigningSteps.TwapSign:
      if (isLoading) {
        return (
          <p>
            {t`Submitting setup transaction`}
            <ThreeDots />
          </p>
        )
      }
      return t`Confirm the TWAP transaction in your connected wallet.`

    case EoaTwapSigningSteps.Success:
      return undefined
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
    case EoaTwapSigningSteps.TwapSign:
      return t`Sign TWAP`
    case EoaTwapSigningSteps.Success:
      return ''
  }
}
