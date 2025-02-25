import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

export function useSetTradeQuoteParams(
  amount: Nullish<CurrencyAmount<Currency>>,
  orderKind: OrderKind,
  fastQuote?: boolean,
) {
  const updateState = useSetAtom(tradeQuoteInputAtom)

  useEffect(() => {
    updateState({ amount: amount || null, orderKind, fastQuote })
  }, [updateState, amount, orderKind, fastQuote])
}
