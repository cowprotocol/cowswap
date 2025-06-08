import { useEffect } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { AtomsAndUnits, CowWidgetEvents, OnTradeParamsPayload } from '@cowprotocol/events'
import { TokenInfo } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { AmountsToSign, useAmountsToSign } from './useAmountsToSign'
import { useDerivedTradeState } from './useDerivedTradeState'

import { TradeTypeToUiOrderType } from '../const/common'
import { TradeType, TradeDerivedState } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useNotifyWidgetTrade() {
  const state = useDerivedTradeState()
  const amountsToSign = useAmountsToSign()

  useEffect(() => {
    if (!state || !amountsToSign) return

    /**
     * There is no way to select both empty sell and buy currencies in the widget UI.
     * The only way when it is possible is when the widget integrator set the state, but in this case it doesn't make sense to notify them.
     *
     * In practice, the state has both currencies empty only at the beginning, when the widget is not ready to trade.
     * So we skip the notification in this case.
     */
    const stateIsNotReady = !state.inputCurrency && !state.outputCurrency

    if (!state.tradeType || stateIsNotReady) {
      return
    }

    WIDGET_EVENT_EMITTER.emit(
      CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
      getTradeParamsEventPayload(state.tradeType, state, amountsToSign),
    )
  }, [state, amountsToSign])
}

function getTradeParamsEventPayload(
  tradeType: TradeType,
  state: TradeDerivedState,
  { maximumSendSellAmount, minimumReceiveBuyAmount }: AmountsToSign,
): OnTradeParamsPayload {
  return {
    orderType: TradeTypeToUiOrderType[tradeType],
    sellToken: currencyToTokenInfo(state.inputCurrency),
    buyToken: currencyToTokenInfo(state.outputCurrency),
    sellTokenAmount: currencyAmountToAtomsAndUnits(state.inputCurrencyAmount),
    buyTokenAmount: currencyAmountToAtomsAndUnits(state.outputCurrencyAmount),
    sellTokenBalance: currencyAmountToAtomsAndUnits(state.inputCurrencyBalance),
    buyTokenBalance: currencyAmountToAtomsAndUnits(state.outputCurrencyBalance),
    sellTokenFiatAmount: state.inputCurrencyFiatAmount?.toExact(),
    buyTokenFiatAmount: state.outputCurrencyFiatAmount?.toExact(),
    maximumSendSellAmount: currencyAmountToAtomsAndUnits(maximumSendSellAmount),
    minimumReceiveBuyAmount: currencyAmountToAtomsAndUnits(minimumReceiveBuyAmount),
    recipient: state.recipient || undefined,
    orderKind: state.orderKind,
  }
}

function currencyToTokenInfo(currency: Currency | null): TokenInfo | undefined {
  if (!currency) return undefined

  return {
    address: getCurrencyAddress(currency),
    chainId: currency.chainId,
    name: currency.name || '',
    decimals: currency.decimals,
    symbol: currency.symbol || '',
  }
}

function currencyAmountToAtomsAndUnits(currency: CurrencyAmount<Currency> | null): AtomsAndUnits | undefined {
  if (!currency) return undefined

  return {
    atoms: BigInt(currency.quotient.toString()),
    units: currency.toExact(),
  }
}
