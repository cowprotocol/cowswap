import { useAtomValue } from 'jotai'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/swap/actions'

import { useAdvancedOrdersActions } from 'modules/advancedOrders/hooks/useAdvancedOrdersActions'
import {
  useAdvancedOrdersDerivedState,
  useFillAdvancedOrdersDerivedState,
} from 'modules/advancedOrders/hooks/useAdvancedOrdersDerivedState'
import { useSetupTradeState, useTradePriceImpact, TradeWidget, TradeWidgetSlots } from 'modules/trade'
import { useTradeQuote, useSetTradeQuoteParams } from 'modules/tradeQuote'
import { partsStateAtom } from 'modules/twap/state/partsStateAtom'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

export function AdvancedOrdersWidget({ children }: { children: JSX.Element }) {
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
  const actions = useAdvancedOrdersActions()
  const { isLoading: isTradePriceUpdating } = useTradeQuote()
  const { inputPartAmount } = useAtomValue(partsStateAtom)
  const priceImpact = useTradePriceImpact()

  useSetTradeQuoteParams(inputPartAmount)

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
  const slots: TradeWidgetSlots = {
    settingsWidget: <div></div>,
    bottomContent: children,
  }

  const params = {
    recipient,
    compactView: false,
    showRecipient: false,
    isTradePriceUpdating,
    priceImpact,
  }

  return (
    <TradeWidget
      id="advanced-orders-page"
      disableOutput={true}
      slots={slots}
      actions={actions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
    />
  )
}
