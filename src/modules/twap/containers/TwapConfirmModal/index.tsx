import { useAtomValue } from 'jotai'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'
import { twapOrderSlippage } from 'modules/twap/state/twapOrdersSettingsAtom'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import { useCreateTwapOrder } from '../../hooks/useCreateTwapOrder'
import { TwapConfirmDetails } from '../TwapConfirmDetails'

export function TwapConfirmModal() {
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
  } = useAdvancedOrdersDerivedState()

  const tradeConfirmActions = useTradeConfirmActions()
  const createTwapOrder = useCreateTwapOrder()
  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)
  const allowedSlippage = useAtomValue(twapOrderSlippage)

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
          <TwapConfirmDetails allowedSlippage={allowedSlippage} rateInfoParams={rateInfoParams} />
        </>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
