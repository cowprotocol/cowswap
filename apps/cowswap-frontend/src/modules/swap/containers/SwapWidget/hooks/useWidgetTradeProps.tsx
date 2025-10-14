import { ReactNode, useMemo } from 'react'

import { EthFlowModal, EthFlowProps } from 'modules/ethFlow'
import type { TradeWidgetProps as TradeWidgetComponentProps, TradeWidgetSlots } from 'modules/trade'
import { useTradePriceImpact } from 'modules/trade'
import { useHandleSwap } from 'modules/tradeFlow'

import { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'
import { useSwapWidgetActions } from '../../../hooks/useSwapWidgetActions'
import { SwapConfirmModal } from '../../SwapConfirmModal'

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
  const confirmModal = useMemo(
    () =>
      renderConfirmModal({
        doTradeCallback,
        recipient,
        recipientAddress,
        priceImpact,
        inputPreviewInfo: currencyData.inputPreviewInfo,
        outputPreviewInfo: currencyData.outputPreviewInfo,
      }),
    [
      doTradeCallback,
      recipient,
      recipientAddress,
      priceImpact,
      currencyData.inputPreviewInfo,
      currencyData.outputPreviewInfo,
    ],
  )

  const genericModal = useMemo(
    () => (showNativeWrapModal ? renderGenericModal({ showNativeWrapModal, ethFlowProps }) : undefined),
    [showNativeWrapModal, ethFlowProps],
  )

  return useMemo(
    () => ({
      slots,
      actions: widgetActions,
      params,
      inputCurrencyInfo: currencyData.inputCurrencyInfo,
      outputCurrencyInfo: currencyData.outputCurrencyInfo,
      confirmModal,
      genericModal,
    }),
    [
      slots,
      widgetActions,
      params,
      currencyData.inputCurrencyInfo,
      currencyData.outputCurrencyInfo,
      confirmModal,
      genericModal,
    ],
  )
}

interface ConfirmModalProps {
  doTradeCallback: ReturnType<typeof useHandleSwap>['callback']
  recipient: ReturnType<typeof useSwapDerivedState>['recipient']
  recipientAddress: ReturnType<typeof useSwapDerivedState>['recipientAddress']
  priceImpact: ReturnType<typeof useTradePriceImpact>
  inputPreviewInfo: CurrencyData['inputPreviewInfo']
  outputPreviewInfo: CurrencyData['outputPreviewInfo']
}

function renderConfirmModal({
  doTradeCallback,
  recipient,
  recipientAddress,
  priceImpact,
  inputPreviewInfo,
  outputPreviewInfo,
}: ConfirmModalProps): ReactNode {
  return (
    <SwapConfirmModal
      doTrade={doTradeCallback}
      recipient={recipient}
      recipientAddress={recipientAddress}
      priceImpact={priceImpact}
      inputCurrencyInfo={inputPreviewInfo}
      outputCurrencyInfo={outputPreviewInfo}
    />
  )
}

interface GenericModalProps {
  showNativeWrapModal: boolean
  ethFlowProps: EthFlowProps
}

function renderGenericModal({ showNativeWrapModal, ethFlowProps }: GenericModalProps): ReactNode {
  if (!showNativeWrapModal) {
    return null
  }

  return <EthFlowModal {...ethFlowProps} />
}
