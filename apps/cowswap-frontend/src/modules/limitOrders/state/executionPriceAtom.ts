import { atom } from 'jotai'

import { Currency, Price } from '@cowprotocol/currency'

export const executionPriceAtom = atom<Price<Currency, Currency> | null>(null)
