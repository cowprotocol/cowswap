import { useAtomValue } from 'jotai'
import React from 'react'

import { Field } from 'legacy/state/types'

import { TradeWidget, useTradeConfirmState, useTradePriceImpact } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'
import { useYieldWidgetActions } from '../../hooks/useYieldWidgetActions'
import { yieldSettingsAtom } from '../../state/yieldSettingsAtom'
import { TradeButtons } from '../TradeButtons'
import { YieldConfirmModal } from '../YieldConfirmModal'

export function YieldWidget() {
  const settingsState = useAtomValue(yieldSettingsAtom)
  const { isLoading: isRateLoading } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const { isOpen: isConfirmOpen } = useTradeConfirmState()
  const widgetActions = useYieldWidgetActions()
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
  } = useYieldDerivedState()

  const { showRecipient } = settingsState

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: 'Sell amount',
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: true,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: 'Buy exactly',
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: true,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const inputCurrencyPreviewInfo = {
    amount: inputCurrencyInfo.amount,
    fiatAmount: inputCurrencyInfo.fiatAmount,
    balance: inputCurrencyInfo.balance,
    label: inputCurrencyInfo.label,
  }

  const outputCurrencyPreviewInfo = {
    amount: outputCurrencyInfo.amount,
    fiatAmount: outputCurrencyInfo.fiatAmount,
    balance: outputCurrencyInfo.balance,
    label: outputCurrencyInfo.label,
  }

  const slots = {
    settingsWidget: <button>Settings</button>,
    bottomContent: <TradeButtons isTradeContextReady />,
  }

  const params = {
    compactView: false,
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
        <YieldConfirmModal
          recipient={recipient}
          priceImpact={priceImpact}
          inputCurrencyInfo={inputCurrencyPreviewInfo}
          outputCurrencyInfo={outputCurrencyPreviewInfo}
        />
      }
    />
  )
}
