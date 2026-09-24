import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useGetReceiveAmountInfo } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { getTwapSwapSuggestion, quotedPartCount, TwapSwapSuggestion } from '../utils/getTwapSwapSuggestion'

export interface TwapSwapSuggestionState {
  suggestion: TwapSwapSuggestion | null
  feeFiatAmount: CurrencyAmount<Token> | null
}

export function useTwapSwapSuggestion(): TwapSwapSuggestionState {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const perPartNetworkBuy = receiveAmountInfo?.costs.networkFee.amountInBuyCurrency
  const perPartBeforeBuy = receiveAmountInfo?.beforeNetworkCosts.buyAmount
  const perPartBeforeSell = receiveAmountInfo?.beforeNetworkCosts.sellAmount
  const feeFiatAmount = useUsdAmount(perPartNetworkBuy).value
  const quotedParts = useMemo(() => {
    if (!inputCurrencyAmount || !perPartBeforeSell) return numberOfPartsValue
    if (!inputCurrencyAmount.currency.equals(perPartBeforeSell.currency)) return numberOfPartsValue

    return quotedPartCount(inputCurrencyAmount.quotient, perPartBeforeSell.quotient) ?? numberOfPartsValue
  }, [inputCurrencyAmount, numberOfPartsValue, perPartBeforeSell])

  const suggestion = useMemo(() => {
    if (!perPartNetworkBuy || !perPartBeforeBuy) return null
    if (!perPartNetworkBuy.currency.equals(perPartBeforeBuy.currency)) return null

    return getTwapSwapSuggestion({
      perPartNetworkBuy: perPartNetworkBuy.quotient,
      perPartBeforeBuy: perPartBeforeBuy.quotient,
      currentParts: numberOfPartsValue,
      quotedParts,
    })
  }, [numberOfPartsValue, perPartBeforeBuy, perPartNetworkBuy, quotedParts])

  return { suggestion, feeFiatAmount }
}
