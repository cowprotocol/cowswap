import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

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

import { buildSwapBridgeClickEvent } from './analytics'
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

  const { t } = useLingui()

  const confirmTrade = tradeConfirmActions.onOpen

  const confirmText = useGetConfirmButtonLabel()

  const { isPartialApproveEnabled } = useFeatureFlags()
  // enable partial approve only for swap
  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade, !!isPartialApproveEnabled)

  // Analytics event for bridge transactions
  const swapBridgeClickEvent = buildSwapBridgeClickEvent({
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
    openSwapConfirm: confirmTrade,
    inputCurrency,
    hasEnoughWrappedBalanceForSwap,
    onCurrencySelection,
    confirmText,
  })

  const shouldShowAddIntermediateToken =
    tokenToBeImported &&
    !!intermediateBuyToken &&
    primaryFormValidation === TradeFormValidation.ImportingIntermediateToken

  const addIntermediateTokenSection =
    shouldShowAddIntermediateToken && intermediateBuyToken ? (
      <AddIntermediateToken
        intermediateBuyToken={intermediateBuyToken}
        onImport={() => setShowAddIntermediateTokenModal(true)}
      />
    ) : null

  const isDisabled =
    !isTradeContextReady ||
    !feeWarningAccepted ||
    !isNoImpactWarningAccepted ||
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
        dataClickEvent={swapBridgeClickEvent}
      />
      {addIntermediateTokenSection}
    </>
  )
}
