import { useEffect } from 'react'

import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { CowEvents, OnTradeParamsPayload } from '@cowprotocol/events'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { EVENT_EMITTER } from 'eventEmitter'

import { useDerivedTradeState } from './useDerivedTradeState'
import { TradeType } from './useTradeTypeInfo'

import { TradeDerivedState } from '../types/TradeDerivedState'

export function useNotifyWidgetTrade() {
  const { state } = useDerivedTradeState()

  useEffect(() => {
    if (!state?.tradeType) return

    EVENT_EMITTER.emit(CowEvents.ON_CHANGE_TRADE_PARAMS, getTradeParamsEventPayload(state.tradeType, state))
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
    inputCurrency: currencyToTokenInfo(state.inputCurrency),
    outputCurrency: currencyToTokenInfo(state.outputCurrency),
    inputCurrencyAmount: currencyAmountToBigInt(state.inputCurrencyAmount),
    outputCurrencyAmount: currencyAmountToBigInt(state.outputCurrencyAmount),
    inputCurrencyBalance: currencyAmountToBigInt(state.inputCurrencyBalance),
    outputCurrencyBalance: currencyAmountToBigInt(state.outputCurrencyBalance),
    inputCurrencyFiatAmount: state.inputCurrencyFiatAmount?.toExact(),
    outputCurrencyFiatAmount: state.outputCurrencyFiatAmount?.toExact(),
    slippageAdjustedSellAmount: currencyAmountToBigInt(state.slippageAdjustedSellAmount),
    recipient: state.recipient || undefined,
    orderKind: state.orderKind,
  }
}

function currencyToTokenInfo(currency: Currency | null): TokenInfo | undefined {
  if (!currency) return undefined

  return {
    address: getIsNativeToken(currency) ? NATIVE_CURRENCY_ADDRESS : currency.address,
    chainId: currency.chainId,
    name: currency.name || '',
    decimals: currency.decimals,
    symbol: currency.symbol || '',
  }
}

function currencyAmountToBigInt(currency: CurrencyAmount<Currency> | null): bigint | undefined {
  if (!currency) return undefined

  return BigInt(currency.quotient.toString())
}
