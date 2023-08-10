import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(amount: CurrencyAmount<Currency> | null) {
  const updateTradeQuote = useSetAtom(updateTradeQuoteAtom)
  const updateState = useSetAtom(tradeQuoteParamsAtom)

  const context = useSafeMemoObject({ amount, updateTradeQuote, updateState })

  useEffect(() => {
    context.updateTradeQuote({ response: null, error: null })
    context.updateState({ amount: context.amount })
  }, [context])
}
