import { ReactNode } from 'react'

import { Currency } from '@cowprotocol/currency'
import { BadgeType } from '@cowprotocol/ui'

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
  token?: Currency
}

export interface EoaTwapCurrentStepBadgeProps {
  children: ReactNode
  type?: BadgeType
}

export interface EoaTwapCurrentStepButtonProps {
  label: ReactNode
  isDisabled: boolean
}

export function buildEoaTwapConfirmationPendingSteps({
  signingStep,
  token,
}: BuildEoaTwapConfirmationPendingStepsParams): OrderStep[] | null {
  const currentIndex = signingStep.plan.indexOf(signingStep.step)

  // Success is a terminal UI state and is intentionally omitted from the plan, so we just return null:
  if (currentIndex === -1) {
    return null
  }

  return signingStep.plan.map((step, index) => {
    const symbol = token?.symbol
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

export function getEoaTwapCurrentStepBadge(
  step: EoaTwapSigningSteps,
  status: OrderStepStatus,
): EoaTwapCurrentStepBadgeProps {
  const isLoading = status === 'loading'
  const hasError = status === 'error'

  switch (step) {
    case EoaTwapSigningSteps.ZeroApprovePoller:
    case EoaTwapSigningSteps.ApprovePoller:
      return isLoading
        ? {
            children: t`Approval pending`,
            type: 'information',
          }
        : {
            children: t`Action required`,
            type: hasError ? 'error' : 'alert',
          }

    case EoaTwapSigningSteps.PermitPoller:
      return isLoading
        ? {
            children: t`Permit pending`,
            type: 'information',
          }
        : {
            children: t`Action required`,
            type: hasError ? 'error' : 'alert',
          }

    case EoaTwapSigningSteps.TwapSetup:
    case EoaTwapSigningSteps.TwapSign:
      // TODO: This should probably be "Action required" as well, or use type="alert" at least:
      return {
        children: t`Waiting for signature`,
        type: 'information',
      }

    case EoaTwapSigningSteps.SubmitTwap:
      return {
        children: t`Activating`,
        type: 'information',
      }

    case EoaTwapSigningSteps.SubmitTwapSlow:
      return {
        children: t`Still activating`,
        type: 'information',
      }

    case EoaTwapSigningSteps.Success:
      return {
        children: t`Active`,
        type: 'success',
      }
  }
}

export function getEoaTwapCurrentStepButton(
  step: EoaTwapSigningSteps,
  status: OrderStepStatus,
  symbol: string,
): EoaTwapCurrentStepButtonProps | null {
  const isLoading = status === 'loading'
  const hasError = status === 'error'

  switch (step) {
    case EoaTwapSigningSteps.ZeroApprovePoller:
      return isLoading
        ? {
            label: t`Resetting approval...`,
            isDisabled: true,
          }
        : hasError
          ? {
              label: t`Reset approval`,
              isDisabled: false,
            }
          : {
              label: t`Confirming with your wallet...`,
              isDisabled: true,
            }

    case EoaTwapSigningSteps.ApprovePoller:
      return isLoading
        ? {
            label: t`Approving ${symbol}...`,
            isDisabled: true,
          }
        : hasError
          ? {
              label: t`Approve ${symbol}`,
              isDisabled: false,
            }
          : {
              label: t`Confirming with your wallet...`,
              isDisabled: true,
            }

    case EoaTwapSigningSteps.PermitPoller:
      return isLoading
        ? {
            label: t`Approving ${symbol}...`,
            isDisabled: true,
          }
        : hasError
          ? {
              label: t`Approve ${symbol}`,
              isDisabled: false,
            }
          : {
              label: t`Confirming with your wallet...`,
              isDisabled: true,
            }

    case EoaTwapSigningSteps.TwapSetup:
    case EoaTwapSigningSteps.TwapSign:
      return hasError
        ? {
            label: t`Try again`,
            isDisabled: false,
          }
        : {
            label: t`Confirming with your wallet...`,
            isDisabled: true,
          }

    default:
      // No more button past `TwapSign`, as we are just waiting for the tx confirmation.
      return null
  }
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
      return t`Confirm the TWAP transaction in your connected wallet.`

    case EoaTwapSigningSteps.SubmitTwap:
      return t`Sit tight! We're getting your order ready`

    case EoaTwapSigningSteps.SubmitTwapSlow:
      return t`This is taking longer than usual. We're still getting your order ready.`

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
    case EoaTwapSigningSteps.SubmitTwap:
      return t`Activating TWAP`
    case EoaTwapSigningSteps.SubmitTwapSlow:
      return t`Still activating TWAP`
    case EoaTwapSigningSteps.Success:
      return ''
  }
}
