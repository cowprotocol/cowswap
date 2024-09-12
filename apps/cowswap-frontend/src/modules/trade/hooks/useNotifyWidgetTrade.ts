import { useEffect } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { AtomsAndUnits, CowWidgetEvents, OnTradeParamsPayload } from '@cowprotocol/events'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { useDerivedTradeState } from './useDerivedTradeState'

import { TradeType } from '../types'
import { TradeDerivedState } from '../types/TradeDerivedState'

export function useNotifyWidgetTrade() {
  const state = useDerivedTradeState()

  useEffect(() => {
    if (!state?.tradeType) return

    WIDGET_EVENT_EMITTER.emit(
      CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
      getTradeParamsEventPayload(state.tradeType, state),
    )
  }, [state])
}

const TradeTypeToUiOrderType: Record<TradeType, UiOrderType> = {
  [TradeType.SWAP]: UiOrderType.SWAP,
  [TradeType.LIMIT_ORDER]: UiOrderType.LIMIT,
  [TradeType.ADVANCED_ORDERS]: UiOrderType.TWAP,
}

function getTradeParamsEventPayload(tradeType: TradeType, state: TradeDerivedState): OnTradeParamsPayload {
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
    maximumSendSellAmount: currencyAmountToAtomsAndUnits(state.slippageAdjustedSellAmount),
    minimumReceiveBuyAmount: currencyAmountToAtomsAndUnits(state.slippageAdjustedBuyAmount),
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
