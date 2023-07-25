import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { fullAmountQuoteAtom } from './fullAmountQuoteAtom'
import { partsStateAtom } from './partsStateAtom'

export const swapAmountDifferenceAtom = atom<CurrencyAmount<Currency> | null>((get) => {
  const fullAmountQuote = get(fullAmountQuoteAtom)
  const { numberOfPartsValue, outputPartAmount } = get(partsStateAtom)

  if (!outputPartAmount) return null

  const fullQuoteBuyAmountStr = fullAmountQuote?.quote.buyAmount

  if (!fullQuoteBuyAmountStr || !numberOfPartsValue) return null

  const fullQuoteBuyAmount = CurrencyAmount.fromRawAmount(outputPartAmount.currency, fullQuoteBuyAmountStr)

  return outputPartAmount.multiply(numberOfPartsValue).subtract(fullQuoteBuyAmount)
})
