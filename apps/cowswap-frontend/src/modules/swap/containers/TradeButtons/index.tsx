import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { AddIntermediateToken } from 'modules/tokensList'
import {
  useIsCurrentTradeBridging,
  useIsNoImpactWarningAccepted,
  useTradeConfirmActions,
  useWrappedToken,
} from 'modules/trade'
import {
  TradeFormButtons,
  TradeFormValidation,
  useGetTradeFormValidation,
  useIsTradeFormValidationPassed,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

import { useSafeMemo, useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { buildSwapBridgeClickEvent, type TradeButtonsAnalyticsParams } from './analytics'
import { swapTradeButtonsMap, type SwapTradeButtonsContext } from './swapTradeButtonsMap'

import { useGetConfirmButtonLabel } from '../../hooks/useGetConfirmButtonLabel'
import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
import {
  useShouldCheckBridgingRecipient,
  useSmartContractRecipientConfirmed,
} from '../../hooks/useSmartContractRecipientConfirmed'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapFormState } from '../../hooks/useSwapFormState'

interface TradeButtonsProps {
  isTradeContextReady: boolean

  openNativeWrapModal(): void

  hasEnoughWrappedBalanceForSwap: boolean
  tokenToBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
  setShowAddIntermediateTokenModal: (show: boolean) => void
}

function getAddIntermediateTokenSection(
  tokenToBeImported: boolean,
  intermediateBuyToken: TokenWithLogo | null,
  primaryFormValidation: TradeFormValidation | null,
  setShowAddIntermediateTokenModal: (show: boolean) => void,
): ReactNode {
  const shouldShow =
    tokenToBeImported &&
    !!intermediateBuyToken &&
    primaryFormValidation === TradeFormValidation.ImportingIntermediateToken

  if (!shouldShow || !intermediateBuyToken) return null

  return (
    <AddIntermediateToken
      intermediateBuyToken={intermediateBuyToken}
      onImport={() => setShowAddIntermediateTokenModal(true)}
    />
  )
}

function getIsDisabled(
  isTradeContextReady: boolean,
  feeWarningAccepted: boolean,
  isNoImpactWarningAccepted: boolean,
  shouldCheckBridgingRecipient: boolean,
  smartContractRecipientConfirmed: boolean,
): boolean {
  return (
    !isTradeContextReady ||
    !feeWarningAccepted ||
    !isNoImpactWarningAccepted ||
    (shouldCheckBridgingRecipient ? !smartContractRecipientConfirmed : false)
  )
}

type TradeButtonsAnalyticsStage = 'approve' | 'confirm'

function useSwapBridgeClickEvent(
  params: TradeButtonsAnalyticsParams & { walletAddress?: string; stage: TradeButtonsAnalyticsStage },
): string | undefined {
  const {
    isCurrentTradeBridging,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    chainId,
    walletAddress,
    stage,
  } = params

  const inputCurrencyKey = inputCurrency
    ? `${getCurrencyAddress(inputCurrency)}:${inputCurrency.chainId ?? ''}`
    : 'none'
  const outputCurrencyKey = outputCurrency
    ? `${getCurrencyAddress(outputCurrency)}:${outputCurrency.chainId ?? ''}`
    : 'none'
  const inputAmountKey = inputCurrencyAmount?.quotient.toString() ?? 'none'
  const outputAmountKey = outputCurrencyAmount?.quotient.toString() ?? 'none'

  return useSafeMemo(
    () =>
      buildSwapBridgeClickEvent({
        isCurrentTradeBridging,
        inputCurrency,
        outputCurrency,
        inputCurrencyAmount,
        outputCurrencyAmount,
        chainId,
        action: stage === 'approve' ? 'swap_bridge_click_approve' : 'swap_bridge_click_confirm',
        walletAddress,
      }),
    [
      chainId,
      inputAmountKey,
      inputCurrencyKey,
      isCurrentTradeBridging,
      outputAmountKey,
      outputCurrencyKey,
      stage,
      walletAddress,
    ],
  )
}

function getTradeButtonsContent(params: {
  tradeFormButtonContext: ReturnType<typeof useTradeFormButtonContext> | null
  localFormValidation: ReturnType<typeof useSwapFormState>
  isPrimaryValidationPassed: boolean
  context: SwapTradeButtonsContext
  isDisabled: boolean
  confirmText: string
  primaryFormValidation: ReturnType<typeof useGetTradeFormValidation>
  tokenToBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
  setShowAddIntermediateTokenModal: (show: boolean) => void
  swapBridgeClickEventApprove: string | undefined
}): ReactNode {
  const {
    tradeFormButtonContext,
    localFormValidation,
    isPrimaryValidationPassed,
    context,
    isDisabled,
    confirmText,
    primaryFormValidation,
    tokenToBeImported,
    intermediateBuyToken,
    setShowAddIntermediateTokenModal,
    swapBridgeClickEventApprove,
  } = params

  if (!tradeFormButtonContext) return null

  if (localFormValidation && isPrimaryValidationPassed) {
    return swapTradeButtonsMap[localFormValidation](context, isDisabled)
  }

  const addIntermediateTokenSection = getAddIntermediateTokenSection(
    tokenToBeImported,
    intermediateBuyToken,
    primaryFormValidation,
    setShowAddIntermediateTokenModal,
  )

  return (
    <>
      <TradeFormButtons
        confirmText={confirmText}
        validation={primaryFormValidation}
        context={tradeFormButtonContext}
        isDisabled={isDisabled}
        dataClickEvent={swapBridgeClickEventApprove}
      />
      {addIntermediateTokenSection}
    </>
  )
}

export function TradeButtons({
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  tokenToBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: TradeButtonsProps): ReactNode {
  const { chainId, account: walletAddress } = useWalletInfo()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useSwapDerivedState()
  const primaryFormValidation = useGetTradeFormValidation()
  const isPrimaryValidationPassed = useIsTradeFormValidationPassed()
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useSwapFormState()
  const wrappedToken = useWrappedToken()
  const onCurrencySelection = useOnCurrencySelection()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const shouldCheckBridgingRecipient = useShouldCheckBridgingRecipient()
  const smartContractRecipientConfirmed = useSmartContractRecipientConfirmed()
  const confirmText = useGetConfirmButtonLabel()
  const { isPartialApproveEnabled } = useFeatureFlags()
  // enable partial approve only for swap
  const tradeFormButtonContext = useTradeFormButtonContext(
    confirmText,
    tradeConfirmActions.onOpen,
    !!isPartialApproveEnabled,
  )

  // Analytics event for bridge transactions (approve stage only)
  const swapBridgeClickEventApprove = useSwapBridgeClickEvent({
    isCurrentTradeBridging,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    chainId,
    walletAddress,
    stage: 'approve',
  })

  const context: SwapTradeButtonsContext = {
    wrappedToken,
    onEthFlow: openNativeWrapModal,
    openSwapConfirm: tradeConfirmActions.onOpen,
    inputCurrency,
    hasEnoughWrappedBalanceForSwap,
    onCurrencySelection,
    confirmText,
  }

  const memoizedContext = useSafeMemoObject(
    context as unknown as Record<string, unknown>,
  ) as unknown as SwapTradeButtonsContext

  const isDisabled = getIsDisabled(
    isTradeContextReady,
    feeWarningAccepted,
    isNoImpactWarningAccepted,
    shouldCheckBridgingRecipient,
    smartContractRecipientConfirmed,
  )

  return getTradeButtonsContent({
    tradeFormButtonContext,
    localFormValidation,
    isPrimaryValidationPassed,
    context: memoizedContext,
    isDisabled,
    confirmText,
    primaryFormValidation,
    tokenToBeImported,
    intermediateBuyToken,
    setShowAddIntermediateTokenModal,
    swapBridgeClickEventApprove,
  })
}
