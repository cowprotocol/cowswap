import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useUpdateTradeQuote } from './useUpdateTradeQuote'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(amount: Nullish<CurrencyAmount<Currency>>, fastQuote?: boolean) {
  const updateTradeQuote = useUpdateTradeQuote()
  const updateState = useSetAtom(tradeQuoteParamsAtom)

  const context = useSafeMemoObject({ amount, fastQuote, updateTradeQuote, updateState })

  useEffect(() => {
    context.updateTradeQuote({ response: null, error: null })
    context.updateState({ amount: context.amount || null, fastQuote: context.fastQuote })
  }, [context])
}
