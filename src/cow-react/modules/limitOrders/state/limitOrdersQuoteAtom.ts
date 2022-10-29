import { atom } from 'jotai'
import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'

export const limitOrdersQuoteAtom = atom<SimpleGetQuoteResponse | null>(null)
