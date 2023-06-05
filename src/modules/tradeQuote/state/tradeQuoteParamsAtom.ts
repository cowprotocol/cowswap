import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface TradeQuoteParamsState {
  amount: CurrencyAmount<Currency> | null
}

export const tradeQuoteParamsAtom = atom<TradeQuoteParamsState>({ amount: null })
