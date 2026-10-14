import { useSetAtom } from 'jotai'
import { startTransition, useEffect } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

export interface SetTradeQuoteParams {
  amount: Nullish<CurrencyAmount<Currency>>
  partiallyFillable?: boolean
  fastQuote?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetTradeQuoteParams({ amount, partiallyFillable, fastQuote }: SetTradeQuoteParams) {
  const updateState = useSetAtom(tradeQuoteInputAtom)

  useEffect(() => {
    // Same as TradeFormValidationUpdater: a plain update on every amount keystroke crashes when a key is held
    startTransition(() => {
      updateState({
        amount: amount || null,
        fastQuote,
        partiallyFillable,
      })
    })
  }, [updateState, amount, partiallyFillable, fastQuote])
}
