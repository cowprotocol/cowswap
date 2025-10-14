import { useMemo } from 'react'

import { EthFlowProps } from 'modules/ethFlow'
import type { TradeWidgetProps as TradeWidgetComponentProps, TradeWidgetSlots } from 'modules/trade'
import { useTradePriceImpact } from 'modules/trade'
import { useHandleSwap } from 'modules/tradeFlow'

import { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'
import { useSwapWidgetActions } from '../../../hooks/useSwapWidgetActions'
import { ConfirmModalSlot, GenericModalSlot } from '../SlotComponents'

import type { CurrencyData } from './useWidgetCurrencyData'

export interface TradeWidgetPropsArgs {
  slots: TradeWidgetSlots
  widgetActions: ReturnType<typeof useSwapWidgetActions>
  params: TradeWidgetComponentProps['params']
  currencyData: CurrencyData
  priceImpact: ReturnType<typeof useTradePriceImpact>
  recipient: ReturnType<typeof useSwapDerivedState>['recipient']
  recipientAddress: ReturnType<typeof useSwapDerivedState>['recipientAddress']
  doTradeCallback: ReturnType<typeof useHandleSwap>['callback']
  showNativeWrapModal: boolean
  ethFlowProps: EthFlowProps
}

export function useTradeWidgetPropsMemo({
  slots,
  widgetActions,
  params,
  currencyData,
  priceImpact,
  recipient,
  recipientAddress,
  doTradeCallback,
  showNativeWrapModal,
  ethFlowProps,
}: TradeWidgetPropsArgs): TradeWidgetComponentProps {
  return useMemo(() => {
    const confirmModal = ConfirmModalSlot({
      doTradeCallback,
      recipient,
      recipientAddress,
      priceImpact,
      inputPreviewInfo: currencyData.inputPreviewInfo,
      outputPreviewInfo: currencyData.outputPreviewInfo,
    })

    const genericModal = showNativeWrapModal
      ? GenericModalSlot({ showNativeWrapModal, ethFlowProps })
      : undefined

    return {
      slots,
      actions: widgetActions,
      params,
      inputCurrencyInfo: currencyData.inputCurrencyInfo,
      outputCurrencyInfo: currencyData.outputCurrencyInfo,
      confirmModal,
      genericModal,
    }
  }, [
    slots,
    widgetActions,
    params,
    currencyData.inputCurrencyInfo,
    currencyData.outputCurrencyInfo,
    currencyData.inputPreviewInfo,
    currencyData.outputPreviewInfo,
    priceImpact,
    recipient,
    recipientAddress,
    doTradeCallback,
    showNativeWrapModal,
    ethFlowProps,
  ])
}
