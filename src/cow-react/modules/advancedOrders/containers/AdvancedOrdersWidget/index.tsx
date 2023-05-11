import { useSetupTradeState } from '@cow/modules/trade'
import { TradeWidget, TradeWidgetSlots } from '@cow/modules/trade/containers/TradeWidget'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from '@src/state/swap/actions'
import {
  useAdvancedOrdersFullState,
  useFillAdvancedOrdersFullState,
} from '@cow/modules/advancedOrders/hooks/useAdvancedOrdersFullState'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useAdvancedOrdersActions } from '@cow/modules/advancedOrders/hooks/useAdvancedOrdersActions'
import { useIsQuoteLoading } from '@cow/modules/advancedOrders/hooks/useIsQuoteLoading'
import { DeadlineInput } from '../DeadlineInput'
import { NumberOfParts } from '../NumberOfParts'
import { Slippage } from '../Slippage'
import * as styledEl from './styled'

export function AdvancedOrdersWidget() {
  useSetupTradeState()
  useFillAdvancedOrdersFullState()

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
  } = useAdvancedOrdersFullState()
  const actions = useAdvancedOrdersActions()
  const isTradePriceUpdating = useIsQuoteLoading()

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
        <styledEl.Row>
          <NumberOfParts />
          <Slippage />
        </styledEl.Row>

        <DeadlineInput />
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
