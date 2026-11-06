import { useCallback, useMemo } from 'react'

import { maxUint256 } from 'viem'

import { isEvmChain } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { usePermitInfo } from 'modules/permit'
import { useFreezeWhileConfirming, useTradeConfirmActions } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

import { COMPOSABLE_COW_POLLER_ADDRESS } from '../../composable-cow-poller/composable-cow-poller.constants'
import { useEoaTwapFlowUpdater, useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { useTwapOrder } from '../../hooks/useTwapOrder'
import { EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'
import {
  buildEoaTwapConfirmationPendingSteps,
  EoaTwapCurrentStepBadgeProps,
  EoaTwapCurrentStepButtonProps,
  getEoaTwapCurrentStepBadge,
  getEoaTwapCurrentStepButton,
} from '../../utils/buildEoaTwapConfirmationPendingSteps'
import { getEoaTwapPollerAmountToApprove } from '../../utils/getEoaTwapPollerAmountToApprove'

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
  const amountToSignApprove = useGetAmountToSignApprove()
  const twapOrder = useTwapOrder()
  const sellAmount = twapOrder?.sellAmount

  // ADVANCED_ORDERS disables permit for the trade spender; look up the poller as SWAP + custom spender.
  const pollerAddress = chainId && isEvmChain(chainId) ? COMPOSABLE_COW_POLLER_ADDRESS[chainId] : undefined
  const pollerPermitInfo = usePermitInfo(inputToken ?? sellAmount?.currency, TradeType.SWAP, pollerAddress)

  // `useGetAmountToSignApprove` is vault-relayer oriented (0 when that spender is already covered, null when the
  // form is not ready). Stepper labels must match the poller wallet request instead: same zero→sell and Dai-like
  // unlimited normalization as `useCreateTwapOrder`.
  const pollerAmountToApprove = useMemo(() => {
    const currency = sellAmount?.currency ?? amountToSignApprove?.currency ?? inputToken

    if (!currency) {
      return null
    }

    if (!sellAmount) {
      return amountToSignApprove
    }

    const amountToApproveRaw = amountToSignApprove ? BigInt(amountToSignApprove.quotient.toString()) : maxUint256
    const normalized = getEoaTwapPollerAmountToApprove({
      amountToApprove: amountToApproveRaw,
      sellAmount: BigInt(sellAmount.quotient.toString()),
      isDaiLikePermit: pollerPermitInfo?.type === 'dai-like',
    })

    return CurrencyAmount.fromRawAmount(currency, normalized.toString())
  }, [amountToSignApprove, inputToken, pollerPermitInfo?.type, sellAmount])

  const amountToApprove = useFreezeWhileConfirming(pollerAmountToApprove)

  const steps = useMemo(() => {
    return eoaTwapSigningStep
      ? buildEoaTwapConfirmationPendingSteps({
          chainId,
          signingStep: eoaTwapSigningStep,
          token: inputToken,
          amountToApprove,
        })
      : null
  }, [amountToApprove, chainId, eoaTwapSigningStep, inputToken])

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
      buttonProps: getEoaTwapCurrentStepButton(currentStep, currentOrderStepStatus, inputSymbolLabel, amountToApprove),
    }
  }, [amountToApprove, steps, eoaTwapSigningStep, inputSymbolLabel])

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
