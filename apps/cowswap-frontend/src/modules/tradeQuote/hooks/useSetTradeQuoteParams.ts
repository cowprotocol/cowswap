import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

export interface SetTradeQuoteParams {
  amount: Nullish<CurrencyAmount<Currency>>
  partiallyFillable?: boolean
  fastQuote?: boolean
}

export function useSetTradeQuoteParams({ amount, partiallyFillable, fastQuote }: SetTradeQuoteParams) {
  const updateState = useSetAtom(tradeQuoteInputAtom)

  useEffect(() => {
    updateState({
      amount: amount || null,
      fastQuote,
      partiallyFillable,
    })
  }, [updateState, amount, partiallyFillable, fastQuote])
}
