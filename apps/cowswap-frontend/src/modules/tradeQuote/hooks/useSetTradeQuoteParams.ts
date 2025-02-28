import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

export function useSetTradeQuoteParams(amount: Nullish<CurrencyAmount<Currency>>, fastQuote?: boolean) {
  const updateState = useSetAtom(tradeQuoteInputAtom)

  useEffect(() => {
    updateState({ amount: amount || null, fastQuote })
  }, [updateState, amount, fastQuote])
}
