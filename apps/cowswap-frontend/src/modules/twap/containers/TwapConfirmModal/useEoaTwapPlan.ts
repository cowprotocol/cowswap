import { useCallback, useMemo } from 'react'

import { Currency } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeConfirmActions } from 'modules/trade'

import { useEoaTwapFlowUpdater, useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'
import {
  buildEoaTwapConfirmationPendingSteps,
  EoaTwapCurrentStepBadgeProps,
  EoaTwapCurrentStepButtonProps,
  getEoaTwapCurrentStepBadge,
  getEoaTwapCurrentStepButton,
} from '../../utils/buildEoaTwapConfirmationPendingSteps'

interface UseEoaTwapPlanParams {
  inputToken: Currency | undefined
  inputSymbolLabel: string
}

interface UseEoaTwapPlanReturn {
  badgeProps: EoaTwapCurrentStepBadgeProps | null
  buttonProps: EoaTwapCurrentStepButtonProps | null
  hasSigningPlan: boolean
  isEoaTwapSuccess: boolean
  onDismiss: () => void
  steps: ReturnType<typeof buildEoaTwapConfirmationPendingSteps>
}

export function useEoaTwapPlan({ inputToken, inputSymbolLabel }: UseEoaTwapPlanParams): UseEoaTwapPlanReturn {
  const eoaTwapSigningStep = useEoaTwapSigningStep()
  const { chainId } = useWalletInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const updateEoaTwapFlow = useEoaTwapFlowUpdater()

  const steps = useMemo(() => {
    return eoaTwapSigningStep
      ? buildEoaTwapConfirmationPendingSteps({
          chainId,
          signingStep: eoaTwapSigningStep,
          token: inputToken,
        })
      : null
  }, [chainId, eoaTwapSigningStep, inputToken])

  const { badgeProps, buttonProps } = useMemo(() => {
    const currentStep = eoaTwapSigningStep?.step
    const currentOrderStepStatus = steps?.find((step) => step.id === currentStep)?.status

    if (!currentStep || !currentOrderStepStatus) {
      return {
        badgeProps: null,
        buttonProps: null,
      }
    }

    return {
      badgeProps: getEoaTwapCurrentStepBadge(currentStep, currentOrderStepStatus),
      buttonProps: getEoaTwapCurrentStepButton(currentStep, currentOrderStepStatus, inputSymbolLabel),
    }
  }, [steps, eoaTwapSigningStep, inputSymbolLabel])

  const onDismiss = useCallback(() => {
    updateEoaTwapFlow(null)
    tradeConfirmActions.onDismiss()
  }, [updateEoaTwapFlow, tradeConfirmActions])

  const hasSigningPlan = !!eoaTwapSigningStep
  const isEoaTwapSuccess = eoaTwapSigningStep?.step === EoaTwapSigningSteps.Success

  return {
    badgeProps,
    buttonProps,
    hasSigningPlan,
    isEoaTwapSuccess,
    onDismiss,
    steps,
  }
}
