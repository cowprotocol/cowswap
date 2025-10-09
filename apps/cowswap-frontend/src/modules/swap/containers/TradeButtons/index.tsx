import { ReactNode } from 'react'

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
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { buildSwapBridgeClickEvent } from './analytics'
import { swapTradeButtonsMap } from './swapTradeButtonsMap'

import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
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
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useSwapFormState()
  const wrappedToken = useWrappedToken()
  const onCurrencySelection = useOnCurrencySelection()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  const confirmTrade = tradeConfirmActions.onOpen

  const confirmText = isCurrentTradeBridging ? 'Swap and Bridge' : 'Swap'

  const { isPartialApproveEnabled } = useFeatureFlags()
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

  // Selling ETH is allowed in Swap
  const isPrimaryValidationPassed =
    !primaryFormValidation || primaryFormValidation === TradeFormValidation.SellNativeToken
  const isDisabled = !isTradeContextReady || !feeWarningAccepted || !isNoImpactWarningAccepted

  if (!tradeFormButtonContext) return null

  if (localFormValidation && isPrimaryValidationPassed) {
    return swapTradeButtonsMap[localFormValidation](context, isDisabled)
  }

  const addIntermediateTokenSection =
    shouldShowAddIntermediateToken && intermediateBuyToken ? (
      <AddIntermediateToken
        intermediateBuyToken={intermediateBuyToken}
        onImport={() => setShowAddIntermediateTokenModal(true)}
      />
    ) : null

  return (
    <>
      <TradeFormButtons
        confirmText={confirmText}
        validation={primaryFormValidation}
        context={tradeFormButtonContext}
        isDisabled={isDisabled}
        data-click-event={swapBridgeClickEvent}
      />
      {addIntermediateTokenSection}
    </>
  )
}
