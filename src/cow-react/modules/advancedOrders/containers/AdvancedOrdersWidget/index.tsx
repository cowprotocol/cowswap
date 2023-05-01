import { useSetupTradeState } from '@cow/modules/trade'
import { TradeWidget } from '@cow/modules/trade/containers/TradeWidget'
import React from 'react'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from '@src/state/swap/actions'
import { useAdvancedOrdersTradeState } from '@cow/modules/advancedOrders/hooks/useAdvancedOrdersTradeState'
import { formatInputAmount } from '@cow/utils/amountFormat'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { useOnCurrencySelection } from '@cow/modules/trade/hooks/useOnCurrencySelection'

export function AdvancedOrdersWidget() {
  useSetupTradeState()

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
    orderKind,
  } = useAdvancedOrdersTradeState()
  const { isWrapOrUnwrap } = useDetectNativeToken()
  const onCurrencySelection = useOnCurrencySelection()

  const inputViewAmount = formatInputAmount(inputCurrencyAmount, inputCurrencyBalance, orderKind === OrderKind.SELL)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    rawAmount: inputCurrencyAmount,
    viewAmount: inputViewAmount,
    receiveAmountInfo: null,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    rawAmount: outputCurrencyAmount,
    viewAmount: isWrapOrUnwrap
      ? inputViewAmount
      : formatInputAmount(outputCurrencyAmount, outputCurrencyBalance, orderKind === OrderKind.BUY),
    receiveAmountInfo: null,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
  }

  // TODO
  const slots = {
    settingsWidget: <div></div>,
  }

  // TODO
  const actions = {
    onCurrencySelection,
    onUserInput() {
      console.log('onUserInput')
    },
    onChangeRecipient() {
      console.log('onChangeRecipient')
    },
    onSwitchTokens() {
      console.log('onSwitchTokens')
    },
  }

  const params = {
    recipient,
    compactView: false,
    showRecipient: false,
    isTradePriceUpdating: false,
    priceImpact: {
      priceImpact: undefined,
      error: undefined,
      loading: false,
    },
  }

  return (
    <TradeWidget
      id="advanced-orders-page"
      slots={slots}
      actions={actions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
    />
  )
}
