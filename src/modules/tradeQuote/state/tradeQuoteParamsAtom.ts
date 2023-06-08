import { atom } from 'jotai'

export interface TradeQuoteParamsState {
  amount: string | null
}

export const tradeQuoteParamsAtom = atom<TradeQuoteParamsState>({ amount: null })
