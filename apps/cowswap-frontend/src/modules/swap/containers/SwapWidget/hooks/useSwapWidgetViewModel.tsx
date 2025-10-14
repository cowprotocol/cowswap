import { ReactNode } from 'react'

import { useTryFindIntermediateToken } from 'modules/bridge'
import { EthFlowProps } from 'modules/ethFlow'
import { useGetReceiveAmountInfo, useTradePriceImpact } from 'modules/trade'
import type { TradeWidgetProps as TradeWidgetComponentProps } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useCurrencyData } from './useWidgetCurrencyData'
import { useLockScreenState } from './useWidgetLockScreen'
import { useIntermediateTokenModalVisibility, useWidgetModals } from './useWidgetModals'
import { usePartialApprovalOptions } from './useWidgetPartialApproval'
import { useWidgetSettings } from './useWidgetSettings'
import { useTradeContext } from './useWidgetTradeContext'
import { useTradeWidgetParamsMemo, useTradeWidgetPropsMemo, useTradeWidgetSlotsMemo } from './useWidgetTradeWidget'

import { useSwapWidgetActions } from '../../../hooks/useSwapWidgetActions'

import type { AddIntermediateModalHandlers } from './useWidgetModals'

export interface SwapWidgetViewModel {
  showAddIntermediateTokenModal: boolean
  addIntermediateModalHandlers: AddIntermediateModalHandlers
  tradeWidgetProps: TradeWidgetComponentProps
}

export interface SwapWidgetPropsInternal {
  topContent?: ReactNode
  bottomContent?: ReactNode
}

export function useSwapWidgetViewModel({ topContent, bottomContent }: SwapWidgetPropsInternal): SwapWidgetViewModel {
  const { showRecipient, deadlineState, recipientToggleState, hooksEnabledState } = useWidgetSettings()
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const widgetActions = useSwapWidgetActions()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { intermediateBuyToken, toBeImported } = useTryFindIntermediateToken({ bridgeQuote })
  const {
    showNativeWrapModal,
    openNativeWrapModal,
    dismissNativeWrapModal,
    showAddIntermediateTokenModal,
    setShowAddIntermediateTokenModal,
    addIntermediateModalHandlers,
  } = useWidgetModals()
  const { derivedState, doTrade, hasEnoughWrappedBalanceForSwap, updateSwapState, wrapCallback } = useTradeContext(
    deadlineState,
    widgetActions,
  )
  const { handleUnlock, shouldShowLockScreen } = useLockScreenState(derivedState, updateSwapState)
  const currencyData = useCurrencyData({ derivedState, receiveAmountInfo })
  const { enablePartialApprovalState, enablePartialApproval } = usePartialApprovalOptions(derivedState)
  const ethFlowProps: EthFlowProps = useSafeMemoObject({
    nativeInput: derivedState.inputCurrencyAmount || undefined,
    onDismiss: dismissNativeWrapModal,
    wrapCallback,
    directSwapCallback: doTrade.callback,
    hasEnoughWrappedBalanceForSwap,
  })
  const shouldShowAddIntermediateTokenModal = useIntermediateTokenModalVisibility({
    showAddIntermediateTokenModal,
    setShowAddIntermediateTokenModal,
    toBeImported,
    intermediateBuyToken,
  })
  const slots = useTradeWidgetSlotsMemo({
    topContent,
    bottomContent,
    shouldShowLockScreen,
    handleUnlock,
    recipientToggleState,
    hooksEnabledState,
    enablePartialApprovalState,
    enablePartialApproval,
    deadlineState,
    rateInfoParams: currencyData.rateInfoParams,
    buyingFiatAmount: currencyData.buyingFiatAmount,
    isTradeContextReady: doTrade.contextIsReady,
    openNativeWrapModal,
    hasEnoughWrappedBalanceForSwap,
    toBeImported,
    intermediateBuyToken,
    setShowAddIntermediateTokenModal,
  })
  const params = useTradeWidgetParamsMemo({
    recipient: derivedState.recipient,
    showRecipient,
    isRateLoading,
    priceImpact,
  })
  const tradeWidgetProps = useTradeWidgetPropsMemo({
    slots,
    widgetActions,
    params,
    currencyData,
    priceImpact,
    recipient: derivedState.recipient,
    recipientAddress: derivedState.recipientAddress,
    doTradeCallback: doTrade.callback,
    showNativeWrapModal,
    ethFlowProps,
  })

  return {
    showAddIntermediateTokenModal: shouldShowAddIntermediateTokenModal,
    addIntermediateModalHandlers,
    tradeWidgetProps,
  }
}

export type { AddIntermediateModalHandlers } from './useWidgetModals'
