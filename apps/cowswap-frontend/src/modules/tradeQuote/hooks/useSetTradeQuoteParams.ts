import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

export interface SetTradeQuoteParams {
  amount: Nullish<CurrencyAmount<Currency>>
  partiallyFillable?: boolean
  fastQuote?: boolean
  enableFastPath?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetTradeQuoteParams({ amount, partiallyFillable, fastQuote, enableFastPath }: SetTradeQuoteParams) {
  const updateState = useSetAtom(tradeQuoteInputAtom)

  useEffect(() => {
    updateState({
      amount: amount || null,
      fastQuote,
      partiallyFillable,
      enableFastPath,
    })
  }, [updateState, amount, partiallyFillable, fastQuote, enableFastPath])
}
