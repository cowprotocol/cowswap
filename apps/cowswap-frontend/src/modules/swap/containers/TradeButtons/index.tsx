import React, { ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { AddIntermediateToken } from 'modules/tokensList'
import {
  useConfirmTradeWithRwaCheck,
  useGetConfirmButtonLabel,
  useIsCurrentTradeBridging,
  useIsNoImpactWarningAccepted,
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

import { swapTradeButtonsMap } from './swapTradeButtonsMap'

import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
// Used by both Warnings (banner visibility) and TradeButtons (isDisabled). Keep in sync.
import { useShouldBlockUnsupportedDestination } from '../../hooks/useShouldBlockUnsupportedDestination'
import {
  useShouldCheckBridgingRecipient,
  useSmartContractRecipientConfirmed,
} from '../../hooks/useSmartContractRecipientConfirmed'
import { buildSwapBridgeClickEvent, useSwapBridgeClickEventData } from '../../hooks/useSwapBridgeClickEvent'
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

export function TradeButtons({
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  tokenToBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: TradeButtonsProps): ReactNode {
  const { inputCurrency } = useSwapDerivedState()

  const primaryFormValidation = useGetTradeFormValidation()
  const isPrimaryValidationPassed = useIsTradeFormValidationPassed()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useSwapFormState()
  const wrappedToken = useWrappedToken()
  const onCurrencySelection = useOnCurrencySelection()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const shouldCheckBridgingRecipient = useShouldCheckBridgingRecipient()
  const smartContractRecipientConfirmed = useSmartContractRecipientConfirmed()
  const shouldBlockUnsupportedDestination = useShouldBlockUnsupportedDestination()
  const isSafeWallet = useIsSafeWallet()

  const { confirmTrade } = useConfirmTradeWithRwaCheck()

  const confirmText = useGetConfirmButtonLabel('swap', isCurrentTradeBridging)

  const swapBridgeClickEventData = useSwapBridgeClickEventData()
  const swapBridgeClickEvent = useMemo(
    () => buildSwapBridgeClickEvent({ ...swapBridgeClickEventData, action: 'swap_bridge_click' }),
    [swapBridgeClickEventData],
  )
  const swapBridgeClickApproveEvent = useMemo(
    () => buildSwapBridgeClickEvent({ ...swapBridgeClickEventData, action: 'swap_bridge_click_approve' }),
    [swapBridgeClickEventData],
  )

  const tradeFormAnalytics = useSafeMemoObject({
    confirmClickEvent: swapBridgeClickEvent,
    approveClickEvent: swapBridgeClickApproveEvent,
  })

  // enable partial approve only for swap
  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade, true, tradeFormAnalytics)

  const context = useSafeMemoObject({
    wrappedToken,
    onEthFlow: openNativeWrapModal,
    openSwapConfirm: confirmTrade,
    inputCurrency,
    hasEnoughWrappedBalanceForSwap,
    onCurrencySelection,
    confirmText,
    isSafeWallet,
    isCurrentTradeBridging,
    swapBridgeClickEvent,
  })

  const shouldShowAddIntermediateToken =
    tokenToBeImported &&
    !!intermediateBuyToken &&
    primaryFormValidation === TradeFormValidation.ImportingIntermediateToken

  const isDisabled =
    !isTradeContextReady ||
    !feeWarningAccepted ||
    !isNoImpactWarningAccepted ||
    shouldBlockUnsupportedDestination ||
    (shouldCheckBridgingRecipient ? !smartContractRecipientConfirmed : false)

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
      />
      {shouldShowAddIntermediateToken && (
        <AddIntermediateToken
          intermediateBuyToken={intermediateBuyToken!}
          onImport={() => setShowAddIntermediateTokenModal(true)}
        />
      )}
    </>
  )
}
