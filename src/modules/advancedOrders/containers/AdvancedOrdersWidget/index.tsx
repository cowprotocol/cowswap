import { useSetupTradeState } from 'modules/trade'
import { TradeWidget } from 'modules/trade/containers/TradeWidget'
import React from 'react'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { Field } from '@src/legacy/state/swap/actions'
import {
  useAdvancedOrdersDerivedState,
  useFillAdvancedOrdersDerivedState,
} from 'modules/advancedOrders/hooks/useAdvancedOrdersDerivedState'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'

export function AdvancedOrdersWidget() {
  useSetupTradeState()
  useFillAdvancedOrdersDerivedState()

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
  } = useAdvancedOrdersDerivedState()
  const onCurrencySelection = useNavigateOnCurrencySelection()

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: orderKind === OrderKind.SELL,
    receiveAmountInfo: null,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: orderKind === OrderKind.BUY,
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
