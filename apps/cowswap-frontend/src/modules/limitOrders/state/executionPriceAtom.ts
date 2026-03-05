import { atom } from 'jotai'

import { Currency, Price } from '@cowprotocol/common-entities'

export const executionPriceAtom = atom<Price<Currency, Currency> | null>(null)
