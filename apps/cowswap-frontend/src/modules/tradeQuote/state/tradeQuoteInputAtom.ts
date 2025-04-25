import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export type SellTokenAddress = string

export interface TradeQuoteInputState {
  amount: CurrencyAmount<Currency> | null
  fastQuote?: boolean
  partiallyFillable?: boolean
}

export const tradeQuoteInputAtom = atom<TradeQuoteInputState>({ amount: null })
