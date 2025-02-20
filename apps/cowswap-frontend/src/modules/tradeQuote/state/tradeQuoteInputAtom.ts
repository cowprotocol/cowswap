import { atom } from 'jotai'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface TradeQuoteInputState {
  amount: CurrencyAmount<Currency> | null
  orderKind: OrderKind
  fastQuote?: boolean
}

export const tradeQuoteInputAtom = atom<TradeQuoteInputState>({ amount: null, orderKind: OrderKind.SELL })
