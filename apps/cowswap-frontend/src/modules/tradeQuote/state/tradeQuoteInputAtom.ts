import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

export type SellTokenAddress = string

export interface TradeQuoteInputState {
  amount: CurrencyAmount<Currency> | null
  fastQuote?: boolean
  partiallyFillable?: boolean
  // Fast path (out-of-competition execution) — adds `fastPath: true` to the quote request. Swap flow only.
  enableFastPath?: boolean
}

export const tradeQuoteInputAtom = atom<TradeQuoteInputState>({ amount: null })
