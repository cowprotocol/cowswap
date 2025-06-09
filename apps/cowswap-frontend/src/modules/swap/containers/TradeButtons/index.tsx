import React from 'react'

import { useIsNoImpactWarningAccepted, useTradeConfirmActions, useWrappedToken } from 'modules/trade'
import {
  TradeFormButtons,
  TradeFormValidation,
  useGetTradeFormValidation,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { swapTradeButtonsMap } from './swapTradeButtonsMap'

import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapFormState } from '../../hooks/useSwapFormState'

const confirmText = 'Swap'

interface TradeButtonsProps {
  isTradeContextReady: boolean
  openNativeWrapModal(): void
  hasEnoughWrappedBalanceForSwap: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeButtons({
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
}: TradeButtonsProps) {
  const { inputCurrency } = useSwapDerivedState()

  const primaryFormValidation = useGetTradeFormValidation()
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useSwapFormState()
  const wrappedToken = useWrappedToken()
  const onCurrencySelection = useOnCurrencySelection()

  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade)

  const context = useSafeMemoObject({
    wrappedToken,
    onEthFlow: openNativeWrapModal,
    openSwapConfirm: confirmTrade,
    inputCurrency,
    hasEnoughWrappedBalanceForSwap,
    onCurrencySelection,
  })

  // Selling ETH is allowed in Swap
  const isPrimaryValidationPassed =
    !primaryFormValidation || primaryFormValidation === TradeFormValidation.SellNativeToken
  const isDisabled = !isTradeContextReady || !feeWarningAccepted || !isNoImpactWarningAccepted

  if (!tradeFormButtonContext) return null

  if (localFormValidation && isPrimaryValidationPassed) {
    return swapTradeButtonsMap[localFormValidation](context, isDisabled)
  }

  return (
    <TradeFormButtons
      confirmText={confirmText}
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isDisabled={isDisabled}
    />
  )
}
