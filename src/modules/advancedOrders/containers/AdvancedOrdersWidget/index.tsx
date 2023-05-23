import { OrderKind } from '@cowprotocol/cow-sdk'
import { useSetupTradeState } from 'modules/trade'
import { TradeWidget, TradeWidgetSlots } from 'modules/trade/containers/TradeWidget'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { Field } from 'legacy/state/swap/actions'
import { useFillAdvancedOrdersDerivedState } from '../../hooks/useAdvancedOrdersDerivedState'
import { useAdvancedOrdersActions } from '../../hooks/useAdvancedOrdersActions'
import { useIsQuoteLoading } from 'modules/tradeQuote'
import { TwapFormWidget } from 'modules/twap'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

export function AdvancedOrdersWidget() {
  useSetupTradeState()
  useFillAdvancedOrdersDerivedState()

  const actions = useAdvancedOrdersActions()
  const isTradePriceUpdating = useIsQuoteLoading()

  const { state } = useDerivedTradeState()

  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    orderKind,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyBalance,
    outputCurrencyFiatAmount,
    inputCurrencyFiatAmount,
    recipient,
  } = state

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
    bottomContent: (
      <>
        {/*TODO: conditionally display a widget for current advanced order type*/}
        <TwapFormWidget />
      </>
    ),
  }

  const params = {
    recipient,
    compactView: false,
    showRecipient: false,
    isTradePriceUpdating,
    priceImpact: {
      priceImpact: undefined,
      error: undefined,
      loading: false,
    },
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
