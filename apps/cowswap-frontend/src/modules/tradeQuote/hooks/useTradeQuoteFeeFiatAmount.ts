import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { useTradeQuote } from './useTradeQuote'

import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

export function useTradeQuoteFeeFiatAmount(): CurrencyAmount<Token> | null {
  const { quote } = useTradeQuote()
  const { amount } = useAtomValue(tradeQuoteInputAtom)

  const feeAmountStr = quote?.quoteResults.quoteResponse.quote.feeAmount

  const feeAmount = useMemo(() => {
    if (!amount || !feeAmountStr) return null

    return CurrencyAmount.fromRawAmount(amount?.currency, feeAmountStr)
  }, [amount, feeAmountStr])

  return useUsdAmount(feeAmount).value
}
