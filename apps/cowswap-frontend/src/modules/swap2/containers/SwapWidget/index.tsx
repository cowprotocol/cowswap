import { ReactNode, useCallback, useState } from 'react'

import { Field } from 'legacy/state/types'

import { SelectTokenWidget } from 'modules/tokensList'
import {
  TradeWidget,
  TradeWidgetSlots,
  useReceiveAmountInfo,
  useTradeConfirmState,
  useTradePriceImpact,
  useWrapNativeFlow,
} from 'modules/trade'
import { useHandleSwap } from 'modules/tradeFlow'
import { useTradeQuote } from 'modules/tradeQuote'
import { SettingsTab, TradeRateDetails } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState, useSwapRecipientToggleState, useSwapSettings } from '../../hooks/useSwapSettings'
import { useSwapWidgetActions } from '../../hooks/useSwapWidgetActions'
import { SwapConfirmModal } from '../SwapConfirmModal'
import { TradeButtons } from '../TradeButtons'
import { Warnings } from '../Warnings'
import { EthFlowModal, EthFlowProps } from 'modules/ethFlow'
import { useHasEnoughWrappedBalanceForSwap } from '../../hooks/useHasEnoughWrappedBalanceForSwap'

export interface SwapWidgetProps {
  topContent?: ReactNode
  bottomContent?: ReactNode
}

export function SwapWidget({ topContent, bottomContent }: SwapWidgetProps) {
  const { showRecipient } = useSwapSettings()
  const deadlineState = useSwapDeadlineState()
  const recipientToggleState = useSwapRecipientToggleState()
  const { isLoading: isRateLoading } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const { isOpen: isConfirmOpen } = useTradeConfirmState()
  const widgetActions = useSwapWidgetActions()
  const receiveAmountInfo = useReceiveAmountInfo()
  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)

  const openNativeWrapModal = useCallback(() => setOpenNativeWrapModal(true), [])
  const dismissNativeWrapModal = useCallback(() => setOpenNativeWrapModal(false), [])

  const wrapCallback = useWrapNativeFlow()

  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
  } = useSwapDerivedState()
  const doTrade = useHandleSwap(useSafeMemoObject({ deadline: deadlineState[0] }), widgetActions)
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap()

  const ethFlowProps: EthFlowProps = useSafeMemoObject({
    nativeInput: inputCurrencyAmount || undefined,
    onDismiss: dismissNativeWrapModal,
    wrapCallback,
    directSwapCallback: doTrade.callback,
    hasEnoughWrappedBalanceForSwap,
  })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: true, // TODO
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: false, // TODO
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo,
  }
  const inputCurrencyPreviewInfo = {
    amount: inputCurrencyInfo.amount,
    fiatAmount: inputCurrencyInfo.fiatAmount,
    balance: inputCurrencyInfo.balance,
    label: 'Sell amount',
  }

  const outputCurrencyPreviewInfo = {
    amount: outputCurrencyInfo.amount,
    fiatAmount: outputCurrencyInfo.fiatAmount,
    balance: outputCurrencyInfo.balance,
    label: 'Receive (before fees)',
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const slots: TradeWidgetSlots = {
    topContent,
    settingsWidget: <SettingsTab recipientToggleState={recipientToggleState} deadlineState={deadlineState} />,
    bottomContent: useCallback(
      (tradeWarnings: ReactNode | null) => {
        return (
          <>
            {bottomContent}
            <TradeRateDetails
              isTradePriceUpdating={isRateLoading}
              rateInfoParams={rateInfoParams}
              deadline={deadlineState[0]}
            />
            <Warnings />
            {tradeWarnings}
            <TradeButtons
              isTradeContextReady={doTrade.contextIsReady}
              openNativeWrapModal={openNativeWrapModal}
              hasEnoughWrappedBalanceForSwap={hasEnoughWrappedBalanceForSwap}
            />
          </>
        )
      },
      [doTrade.contextIsReady, isRateLoading, rateInfoParams, deadlineState],
    ),
  }

  const params = {
    compactView: true,
    enableSmartSlippage: true,
    isMarketOrderWidget: true,
    recipient,
    showRecipient,
    isTradePriceUpdating: isRateLoading,
    priceImpact,
    disableQuotePolling: isConfirmOpen,
  }

  return (
    <TradeWidget
      disableOutput
      slots={slots}
      actions={widgetActions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      confirmModal={
        doTrade.contextIsReady ? (
          <SwapConfirmModal
            doTrade={doTrade.callback}
            recipient={recipient}
            priceImpact={priceImpact}
            inputCurrencyInfo={inputCurrencyPreviewInfo}
            outputCurrencyInfo={outputCurrencyPreviewInfo}
          />
        ) : null
      }
      genericModal={showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
    />
  )
}
