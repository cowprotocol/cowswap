import { ReactNode } from 'react'

import type { Hex } from 'viem'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { BadgeType, ExternalLink } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { OrderStep, OrderStepStatus } from 'modules/trade'

import { ThreeDots } from 'common/pure/ThreeDots/ThreeDots.pure'

import { TwapOrderStepTokenInfo } from '../containers/TwapConfirmModal/TwapConfirmModal.styled'
import { EoaTwapSigningPhase, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export const EOA_TWAP_WALLET_ACTIONS_COMPLETE_STEP_ID = 'WalletActionsComplete'

const ACTIVATION_STEPS = new Set<EoaTwapSigningSteps>([
  EoaTwapSigningSteps.SubmitTwap,
  EoaTwapSigningSteps.SubmitTwapSlow,
])

export interface BuildEoaTwapConfirmationPendingStepsParams {
  chainId?: SupportedChainId
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

interface BuildEoaTwapWalletActionsCompleteDescriptionParams {
  walletActionSteps: EoaTwapSigningSteps[]
  completedStepTxHashes: Partial<Record<EoaTwapSigningSteps, Hex>> | undefined
  token: Currency | undefined
  chainId: SupportedChainId | undefined
}

interface EoaTwapWalletActionOutcome {
  label: string
  hasTxLink: boolean
}

export function buildEoaTwapConfirmationPendingSteps({
  chainId,
  signingStep,
  token,
}: BuildEoaTwapConfirmationPendingStepsParams): OrderStep[] | null {
  const currentIndex = signingStep.plan.indexOf(signingStep.step)

  // Success is a terminal UI state and is intentionally omitted from the plan, so we just return null:
  if (currentIndex === -1) {
    return null
  }

  if (ACTIVATION_STEPS.has(signingStep.step)) {
    const walletActionSteps = signingStep.plan.filter((step) => !ACTIVATION_STEPS.has(step))
    const activationStatus = getEoaTwapActivationStepStatus(signingStep)

    return [
      {
        id: EOA_TWAP_WALLET_ACTIONS_COMPLETE_STEP_ID,
        label: t`Wallet actions complete`,
        description: buildEoaTwapWalletActionsCompleteDescription({
          walletActionSteps,
          completedStepTxHashes: signingStep.completedStepTxHashes,
          token,
          chainId,
        }),
        status: 'success',
      },
      {
        id: signingStep.step,
        label: getEoaTwapStepLabel(signingStep.step),
        description: getEoaTwapStepDescription(signingStep.step, activationStatus),
        status: activationStatus,
      },
    ]
  }

  return signingStep.plan.map((step, index) => {
    const symbol = token?.symbol
    const label = getEoaTwapStepLabel(step, symbol)

    let status: OrderStepStatus

    if (index < currentIndex || (index === currentIndex && signingStep.phase === EoaTwapSigningPhase.Confirmed)) {
      status = 'success'
    } else if (index === currentIndex) {
      status = signingStep.phase == EoaTwapSigningPhase.WaitingForTx ? 'loading' : 'active'
    } else {
      status = 'upcoming'
    }

    return {
      id: step,
      label,
      description: getEoaTwapStepDescription(step, status, token),
      status,
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

export function getEoaTwapStepDescription(
  step: EoaTwapSigningSteps,
  status: OrderStepStatus,
  token?: Currency,
): ReactNode | undefined {
  if (status === 'success') {
    return undefined
  }

  const isLoading = status === 'loading'
  const tokenElement = token ? <TwapOrderStepTokenInfo token={token} /> : null

  switch (step) {
    case EoaTwapSigningSteps.ZeroApprovePoller:
    case EoaTwapSigningSteps.ApprovePoller:
      return isLoading ? (
        <>
          <p>
            {t`Approval submitted. Waiting for network confirmation`}
            <ThreeDots />
          </p>
          <p>{tokenElement}</p>
        </>
      ) : (
        <>
          <p>{t`Review and confirm in your wallet to continue.`}</p>
          <p>{tokenElement}</p>
        </>
      )

    case EoaTwapSigningSteps.PermitPoller:
      return isLoading ? (
        <>
          <p>
            {t`Permit submitted. Waiting for network confirmation`}
            <ThreeDots />
          </p>
          <p>{tokenElement}</p>
        </>
      ) : (
        <>
          <p>{t`Review and confirm in your wallet to continue.`}</p>
          <p>{tokenElement}</p>
        </>
      )

    case EoaTwapSigningSteps.TwapSetup:
    case EoaTwapSigningSteps.TwapSign:
      return t`Review and confirm in your wallet to continue.`

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
      return symbol ? t`Approve ${symbol}` : t`Approve token`
    case EoaTwapSigningSteps.PermitPoller:
      return symbol ? t`Permit ${symbol}` : t`Permit token`
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

export function getEoaTwapWalletActionSummaryLabel(
  step: EoaTwapSigningSteps,
  symbol: string | undefined,
): null | string {
  switch (step) {
    case EoaTwapSigningSteps.ZeroApprovePoller:
      return t`Reset approval`
    case EoaTwapSigningSteps.ApprovePoller:
      return symbol ? t`Approve ${symbol}` : t`Approve token`
    case EoaTwapSigningSteps.PermitPoller:
      return symbol ? t`Permit ${symbol}` : t`Permit token`
    case EoaTwapSigningSteps.TwapSetup:
      return t`Set up TWAP`
    case EoaTwapSigningSteps.TwapSign:
      return t`Sign TWAP`
    default:
      return null
  }
}

function buildEoaTwapWalletActionsCompleteDescription({
  walletActionSteps,
  completedStepTxHashes,
  token,
  chainId,
}: BuildEoaTwapWalletActionsCompleteDescriptionParams): ReactNode {
  const symbol = token?.symbol

  return (
    <>
      {walletActionSteps.map((step) => {
        const label = getEoaTwapWalletActionSummaryLabel(step, symbol)
        const outcome = getEoaTwapWalletActionOutcome(step)

        if (!label || !outcome) return null

        const txHash = completedStepTxHashes?.[step]
        const explorerUrl =
          chainId && txHash && outcome.hasTxLink
            ? getExplorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)
            : undefined

        return (
          <p key={step}>
            {label} · {explorerUrl ? <ExternalLink href={explorerUrl}>{outcome.label} ↗</ExternalLink> : outcome.label}
          </p>
        )
      })}
    </>
  )
}

function getEoaTwapActivationStepStatus(signingStep: EoaTwapSigningStepState): OrderStepStatus {
  if (signingStep.phase === EoaTwapSigningPhase.Confirmed) {
    return 'success'
  }

  return signingStep.phase === EoaTwapSigningPhase.WaitingForTx ? 'loading' : 'active'
}

function getEoaTwapWalletActionOutcome(step: EoaTwapSigningSteps): null | EoaTwapWalletActionOutcome {
  switch (step) {
    case EoaTwapSigningSteps.ZeroApprovePoller:
    case EoaTwapSigningSteps.ApprovePoller:
      return { label: t`Confirmed`, hasTxLink: true }
    case EoaTwapSigningSteps.PermitPoller:
    case EoaTwapSigningSteps.TwapSetup:
    case EoaTwapSigningSteps.TwapSign:
      return { label: t`Signed`, hasTxLink: false }
    default:
      return null
  }
}
