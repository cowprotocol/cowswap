import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ONE_HUNDRED_PERCENT } from 'legacy/constants/misc'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import { useCreateTwapOrder } from '../../hooks/useCreateTwapOrder'
import { twapOrderSlippage } from '../../state/twapOrdersSettingsAtom'

export function TwapConfirmModal() {
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
  } = useAdvancedOrdersDerivedState()
  const slippage = useAtomValue(twapOrderSlippage)

  const tradeConfirmActions = useTradeConfirmActions()
  const createTwapOrder = useCreateTwapOrder()

  const isInvertedState = useState(false)

  // TODO: add conditions based on warnings
  const isConfirmDisabled = false

  // TODO: define priceImpact
  const priceImpact = {
    priceImpact: undefined,
    error: undefined,
    loading: false,
  }

  const inputCurrencyInfo = {
    amount: inputCurrencyAmount,
    fiatAmount: inputCurrencyFiatAmount,
    balance: inputCurrencyBalance,
    label: 'Sell amount',
  }

  const outputCurrencyInfo = {
    amount: outputCurrencyAmount,
    fiatAmount: outputCurrencyFiatAmount,
    balance: outputCurrencyBalance,
    label: 'Estimated receive amount',
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  // This is the minimum per part
  const minReceivedAmountPerPart = useMemo(
    () => getSlippageAdjustedBuyAmount(outputCurrencyAmount, slippage),
    [slippage, outputCurrencyAmount]
  )

  const { numberOfPartsValue } = partsState
  const minReceivedAmount = numberOfPartsValue ? minReceivedAmountPerPart?.multiply(numberOfPartsValue) : null

  return (
    <TradeConfirmModal>
      <TradeConfirmation
        title="Review TWAP order"
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={createTwapOrder}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
      >
        <>
          <>{/*TODO: display details*/}</>
          <TradeBasicConfirmDetails
            rateInfoParams={rateInfoParams}
            minReceiveAmount={minReceivedAmount}
            isInvertedState={isInvertedState}
            slippage={slippage}
          />
        </>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}

function getSlippageAdjustedBuyAmount(
  buyAmount: Nullish<CurrencyAmount<Currency>>,
  slippage: Percent
): CurrencyAmount<Currency> | undefined {
  return buyAmount?.multiply(ONE_HUNDRED_PERCENT.subtract(slippage))
}
