import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useUpdateTradeQuote } from './useUpdateTradeQuote'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(amount: Nullish<CurrencyAmount<Currency>>) {
  const updateTradeQuote = useUpdateTradeQuote()
  const updateState = useSetAtom(tradeQuoteParamsAtom)

  const context = useSafeMemoObject({ amount, updateTradeQuote, updateState })

  useEffect(() => {
    context.updateTradeQuote({ response: null, error: null })
    context.updateState({ amount: context.amount || null })
  }, [context])
}
