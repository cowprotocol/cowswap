import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useGetReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { getTwapSwapSuggestion, quoteMatchesCurrentInput, TwapSwapSuggestion } from '../utils/getTwapSwapSuggestion'

export interface TwapSwapSuggestionState {
  suggestion: TwapSwapSuggestion | null
  feeFiatAmount: CurrencyAmount<Token> | null
}

export function useTwapSwapSuggestion(): TwapSwapSuggestionState {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { isLoading, hasParamsChanged } = useTradeQuote()
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const perPartNetworkBuy = receiveAmountInfo?.costs.networkFee.amountInBuyCurrency
  const perPartBeforeBuy = receiveAmountInfo?.beforeNetworkCosts.buyAmount
  const perPartBeforeSell = receiveAmountInfo?.beforeNetworkCosts.sellAmount
  const feeFiatAmount = useUsdAmount(perPartNetworkBuy).value
  const quoteIsForCurrentInput =
    !!inputCurrencyAmount &&
    !!perPartBeforeSell &&
    inputCurrencyAmount.currency.equals(perPartBeforeSell.currency) &&
    quoteMatchesCurrentInput(inputCurrencyAmount.quotient, perPartBeforeSell.quotient, numberOfPartsValue)

  const suggestion = useMemo(() => {
    // A changed sell amount or part count keeps the previous part quote until the next response.
    if ((isLoading && hasParamsChanged) || !quoteIsForCurrentInput) return null
    if (!perPartNetworkBuy || !perPartBeforeBuy) return null
    if (!perPartNetworkBuy.currency.equals(perPartBeforeBuy.currency)) return null

    return getTwapSwapSuggestion({
      perPartNetworkBuy: perPartNetworkBuy.quotient,
      perPartBeforeBuy: perPartBeforeBuy.quotient,
      currentParts: numberOfPartsValue,
    })
  }, [hasParamsChanged, isLoading, numberOfPartsValue, perPartBeforeBuy, perPartNetworkBuy, quoteIsForCurrentInput])

  return { suggestion, feeFiatAmount }
}
