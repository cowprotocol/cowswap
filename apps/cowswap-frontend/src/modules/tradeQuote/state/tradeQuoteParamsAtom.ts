import { atom } from 'jotai'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface TradeQuoteParamsState {
  amount: CurrencyAmount<Currency> | null
  orderKind: OrderKind
  fastQuote?: boolean
}

export const tradeQuoteParamsAtom = atom<TradeQuoteParamsState>({ amount: null, orderKind: OrderKind.SELL })
