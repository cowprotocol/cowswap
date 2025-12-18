import { ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
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

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { buildSwapBridgeClickEvent, type TradeButtonsAnalyticsParams } from './analytics'
import { swapTradeButtonsMap } from './swapTradeButtonsMap'

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
  shouldShow: boolean,
  intermediateBuyToken: TokenWithLogo | null,
  setShowAddIntermediateTokenModal: (show: boolean) => void,
): ReactNode {
  if (!shouldShow || !intermediateBuyToken) return null

  return (
    <AddIntermediateToken
      intermediateBuyToken={intermediateBuyToken}
      onImport={() => setShowAddIntermediateTokenModal(true)}
    />
  )
}

function shouldShowAddIntermediateTokenSection(
  tokenToBeImported: boolean,
  intermediateBuyToken: TokenWithLogo | null,
  primaryFormValidation: TradeFormValidation | null,
): boolean {
  return (
    tokenToBeImported &&
    !!intermediateBuyToken &&
    primaryFormValidation === TradeFormValidation.ImportingIntermediateToken
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

function useSwapBridgeClickEvent(params: TradeButtonsAnalyticsParams & { walletAddress?: string }): string | undefined {
  const {
    isCurrentTradeBridging,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    chainId,
    walletAddress,
  } = params

  return useMemo(
    () =>
      buildSwapBridgeClickEvent({
        isCurrentTradeBridging,
        inputCurrency,
        outputCurrency,
        inputCurrencyAmount,
        outputCurrencyAmount,
        chainId,
        walletAddress,
      }),
    [
      chainId,
      inputCurrency,
      inputCurrencyAmount,
      isCurrentTradeBridging,
      outputCurrency,
      outputCurrencyAmount,
      walletAddress,
    ],
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

  // Analytics event for bridge transactions
  const swapBridgeClickEvent = useSwapBridgeClickEvent({
    isCurrentTradeBridging,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    chainId,
    walletAddress,
  })

  const context = useSafeMemoObject({
    wrappedToken,
    onEthFlow: openNativeWrapModal,
    openSwapConfirm: tradeConfirmActions.onOpen,
    inputCurrency,
    hasEnoughWrappedBalanceForSwap,
    onCurrencySelection,
    confirmText,
  })

  const shouldShowAddIntermediateToken = shouldShowAddIntermediateTokenSection(
    tokenToBeImported,
    intermediateBuyToken,
    primaryFormValidation,
  )

  const isDisabled = getIsDisabled(
    isTradeContextReady,
    feeWarningAccepted,
    isNoImpactWarningAccepted,
    shouldCheckBridgingRecipient,
    smartContractRecipientConfirmed,
  )

  if (!tradeFormButtonContext) return null

  if (localFormValidation && isPrimaryValidationPassed) {
    return swapTradeButtonsMap[localFormValidation](context, isDisabled)
  }

  return (
    <>
      <TradeFormButtons
        confirmText={confirmText}
        validation={primaryFormValidation}
        context={tradeFormButtonContext}
        isDisabled={isDisabled}
        dataClickEvent={swapBridgeClickEvent}
      />
      {getAddIntermediateTokenSection(
        shouldShowAddIntermediateToken,
        intermediateBuyToken,
        setShowAddIntermediateTokenModal,
      )}
    </>
  )
}
