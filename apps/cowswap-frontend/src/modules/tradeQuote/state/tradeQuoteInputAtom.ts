import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface TradeQuoteInputState {
  amount: CurrencyAmount<Currency> | null
  fastQuote?: boolean
}

export const tradeQuoteInputAtom = atom<TradeQuoteInputState>({ amount: null })
