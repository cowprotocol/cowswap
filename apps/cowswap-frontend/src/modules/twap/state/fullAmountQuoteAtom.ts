import { atom } from 'jotai'

import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

export const fullAmountQuoteAtom = atom<OrderQuoteResponse | null>(null)
