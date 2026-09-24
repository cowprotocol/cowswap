import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { useGetReceiveAmountInfo } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { getTwapSwapSuggestion, TwapSwapSuggestion } from '../utils/getTwapSwapSuggestion'

export interface TwapSwapSuggestionState {
  suggestion: TwapSwapSuggestion | null
  feeFiatAmount: CurrencyAmount<Token> | null
}

export function useTwapSwapSuggestion(): TwapSwapSuggestionState {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const perPartNetworkBuy = receiveAmountInfo?.costs.networkFee.amountInBuyCurrency
  const perPartBeforeBuy = receiveAmountInfo?.beforeNetworkCosts.buyAmount
  const feeFiatAmount = useUsdAmount(perPartNetworkBuy).value

  const suggestion = useMemo(() => {
    if (!perPartNetworkBuy || !perPartBeforeBuy) return null
    if (!perPartNetworkBuy.currency.equals(perPartBeforeBuy.currency)) return null

    return getTwapSwapSuggestion({
      perPartNetworkBuy: perPartNetworkBuy.quotient,
      perPartBeforeBuy: perPartBeforeBuy.quotient,
      currentParts: numberOfPartsValue,
    })
  }, [numberOfPartsValue, perPartBeforeBuy, perPartNetworkBuy])

  return { suggestion, feeFiatAmount }
}
