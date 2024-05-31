import { atom } from 'jotai'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { receiveAmountInfoAtom } from 'modules/trade'

import { fullAmountQuoteAtom } from './fullAmountQuoteAtom'
import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

export interface SwapAmountDifference {
  amount: CurrencyAmount<Currency>
  percent: Percent
}

export const swapAmountDifferenceAtom = atom<SwapAmountDifference | null>((get) => {
  const fullAmountQuote = get(fullAmountQuoteAtom)
  const outputPartAmount = get(receiveAmountInfoAtom)?.afterSlippage.buyAmount
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)

  if (!outputPartAmount || isFractionFalsy(outputPartAmount)) return null

  const fullQuoteBuyAmountStr = fullAmountQuote?.quote.buyAmount

  if (!fullQuoteBuyAmountStr || !numberOfPartsValue) return null

  const fullQuoteBuyAmount = CurrencyAmount.fromRawAmount(outputPartAmount.currency, fullQuoteBuyAmountStr)
  const allPartsAmount = outputPartAmount.multiply(numberOfPartsValue)

  const differenceAmount = allPartsAmount.subtract(fullQuoteBuyAmount)

  return {
    amount: differenceAmount,
    percent: new Percent(differenceAmount.quotient, allPartsAmount.quotient),
  }
})
