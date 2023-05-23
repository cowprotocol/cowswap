import { useState } from 'react'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useSetupTradeState } from 'modules/trade'
import { TradeWidget, TradeWidgetSlots } from 'modules/trade/containers/TradeWidget'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'
import { Field } from 'legacy/state/swap/actions'
import {
  useAdvancedOrdersDerivedState,
  useFillAdvancedOrdersDerivedState,
} from 'modules/advancedOrders/hooks/useAdvancedOrdersDerivedState'
import { useAdvancedOrdersActions } from 'modules/advancedOrders/hooks/useAdvancedOrdersActions'
import { useIsQuoteLoading } from 'modules/advancedOrders/hooks/useIsQuoteLoading'
import { DeadlineSelector } from 'modules/advancedOrders/containers/DeadlineSelector'
import { PartsDisplay } from 'modules/advancedOrders/containers/PartsDisplay'
import { useParseNumberOfParts } from 'modules/advancedOrders/hooks/useParseNumberOfParts'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { useParseSlippage } from 'modules/advancedOrders/hooks/useParseSlippage'
import { useDisplaySlippageValue } from 'modules/advancedOrders/hooks/useDisplaySlippageValue'
import { useDisplaySlippageError } from 'modules/advancedOrders/hooks/useDisplaySlippageError'
import { useNoOfParts } from 'modules/advancedOrders/hooks/useParts'
import * as styledEl from './styled'

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
  const actions = useAdvancedOrdersActions()
  const isTradePriceUpdating = useIsQuoteLoading()

  // Number of parts
  const { numberOfPartsError, numberOfPartsValue } = useNoOfParts()
  const parseNumberOfParts = useParseNumberOfParts()

  // Slippage
  const [slippageInput, setSlippageInput] = useState('')
  const [slippageWarning, setSlippageWarning] = useState<string | null>(null)
  const [slippageError, setSlippageError] = useState<string | null>(null)

  const parseSlippageInput = useParseSlippage({
    setSlippageInput,
    setSlippageError,
    setSlippageWarning,
  })
  const displaySlippageValue = useDisplaySlippageValue(slippageInput)
  const displaySlippageError = useDisplaySlippageError(slippageWarning, slippageError)

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
          <TradeNumberInput
            value={numberOfPartsValue}
            onUserInput={(v: string) => parseNumberOfParts(v)}
            error={numberOfPartsError ? { type: 'error', text: numberOfPartsError } : null}
            label="No. of parts"
            hint="Todo: No of parts hint"
          />
          <TradeNumberInput
            value={displaySlippageValue}
            onUserInput={(v: string) => parseSlippageInput(v)}
            error={displaySlippageError}
            label="Slippage"
            hint="Todo: Slippage hint"
            suffix="%"
          />
        </styledEl.Row>

        <PartsDisplay />
        <DeadlineSelector />
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
