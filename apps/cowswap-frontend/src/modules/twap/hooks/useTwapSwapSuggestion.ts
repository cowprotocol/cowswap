import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

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
  /** Whether `parts` stays under the network-cost threshold. Unknown costs only allow the current count or fewer. */
  isPartsCountAffordable: (parts: number) => boolean
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

  const quotedPartCosts = useMemo(() => {
    // A changed sell amount or part count keeps the previous part quote until the next response.
    if ((isLoading && hasParamsChanged) || !quoteIsForCurrentInput) return null
    if (!perPartNetworkBuy || !perPartBeforeBuy) return null
    if (!perPartNetworkBuy.currency.equals(perPartBeforeBuy.currency)) return null

    return { perPartNetworkBuy: perPartNetworkBuy.quotient, perPartBeforeBuy: perPartBeforeBuy.quotient }
  }, [hasParamsChanged, isLoading, perPartBeforeBuy, perPartNetworkBuy, quoteIsForCurrentInput])

  const suggestion = useMemo(() => {
    if (!quotedPartCosts) return null

    return getTwapSwapSuggestion({ ...quotedPartCosts, currentParts: numberOfPartsValue })
  }, [numberOfPartsValue, quotedPartCosts])

  const isPartsCountAffordable = useCallback(
    (parts: number): boolean => {
      if (!quotedPartCosts) return parts <= numberOfPartsValue

      return (
        getTwapSwapSuggestion({ ...quotedPartCosts, currentParts: parts, quotedParts: numberOfPartsValue }) === null
      )
    },
    [numberOfPartsValue, quotedPartCosts],
  )

  return { suggestion, feeFiatAmount, isPartsCountAffordable }
}
