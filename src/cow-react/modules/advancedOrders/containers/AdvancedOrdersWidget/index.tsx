import { useSetupTradeState } from '@cow/modules/trade'
import { TradeWidget } from '@cow/modules/trade/containers/TradeWidget'
import React, { useMemo, useState } from 'react'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from '@src/state/swap/actions'
import {
  useAdvancedOrdersDerivedState,
  useFillAdvancedOrdersDerivedState,
} from '@cow/modules/advancedOrders/hooks/useAdvancedOrdersDerivedState'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useNavigateOnCurrencySelection } from '@cow/modules/trade/hooks/useNavigateOnCurrencySelection'
import { TradeNumberInput } from 'cow-react/modules/trade/pure/TradeNumberInput'
import { limitOrdersDeadlines } from '@cow/modules/limitOrders/pure/DeadlineSelector/deadlines'
import styled from 'styled-components/macro'
import { DeadlineSelector } from 'cow-react/modules/trade/pure/DeadlineSelector'
import { TradeSelect } from '@cow/modules/trade/pure/TradeSelect'

const TwoCells = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
`

// TODO: create own const
const totalTimeItems = limitOrdersDeadlines.map((item) => ({ label: item.title, value: item.value }))

const ordersTypes = [
  { label: 'TWAP', value: 'TWAP' },
  { label: 'Stop loss', value: 'STOP_LOSS' },
]

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

  // TODO: bind state to atom
  const [totalTime, setTotalTime] = useState(totalTimeItems[0].value)
  const [numOfParts, setNumOfParts] = useState(1)
  const [slippage, setSlippage] = useState(0.5)
  const [orderType, setOrderType] = useState(ordersTypes[0])

  const numPartsValidationError = useMemo(() => {
    if (numOfParts < 1) return 'Should be at least 1'
    if (numOfParts > 5) return 'Should be less than 5'

    return null
  }, [numOfParts])

  // TODO
  const slots = {
    settingsWidget: <div></div>,
    topContent: (
      <div>
        <TradeSelect
          label="Order type"
          hint="Some hint"
          items={ordersTypes}
          active={orderType}
          onSelect={(item) => setOrderType(item as typeof orderType)}
        />
      </div>
    ),
    bottomContent: (
      <>
        <TwoCells>
          <TradeNumberInput
            value={numOfParts}
            onChange={setNumOfParts}
            validationError={numPartsValidationError}
            label="No. of parts"
            hint="Some hint"
          />
          <TradeNumberInput value={slippage} onChange={setSlippage} label="Slippage" hint="Some hint" suffix="%" />
        </TwoCells>
        <DeadlineSelector items={totalTimeItems} deadline={totalTime} setDeadline={setTotalTime} />
      </>
    ),
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
