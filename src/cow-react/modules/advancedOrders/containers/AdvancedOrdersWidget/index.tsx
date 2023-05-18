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
import { DeadlineSelector } from '../DeadlineSelector'
import { PartsDisplay } from '../PartsDisplay'
import * as styledEl from './styled'
import { useParseNumberOfParts } from '../../hooks/useParseNumberOfParts'
import { useAtomValue } from 'jotai'
import { advancedOrdersSettingsAtom } from '../../state/advancedOrdersSettingsAtom'
import { TradeNumberInput } from '@cow/modules/trade/pure/TradeNumberInput'
import { useState } from 'react'
import { useParseSlippage } from '../../hooks/useParseSlippage'
import { useDisplaySlippageValue } from '../../hooks/useDisplaySlippageValue'

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

  // Number of parts
  const { numberOfPartsError, numberOfPartsValue } = useAtomValue(advancedOrdersSettingsAtom)
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
            error={numberOfPartsError}
            label="No. of parts"
            hint="Todo: No of parts hint"
          />
          <TradeNumberInput
            value={displaySlippageValue}
            onUserInput={(v: string) => parseSlippageInput(v)}
            error={slippageError}
            warning={slippageWarning}
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
