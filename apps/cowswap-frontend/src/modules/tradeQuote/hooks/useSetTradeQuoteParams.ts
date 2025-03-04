import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { SellTokenAddress, tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

export function useSetTradeQuoteParams(
  amount: Nullish<CurrencyAmount<Currency>>,
  sellTokenAddress: SellTokenAddress | null,
  fastQuote?: boolean,
) {
  const updateState = useSetAtom(tradeQuoteInputAtom)

  useEffect(() => {
    updateState({
      amount: amount || null,
      sellTokenAddress: sellTokenAddress ? sellTokenAddress.toLowerCase() : null,
      fastQuote,
    })
  }, [updateState, amount, sellTokenAddress, fastQuote])
}
