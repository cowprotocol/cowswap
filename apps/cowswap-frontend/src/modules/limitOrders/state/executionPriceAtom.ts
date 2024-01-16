import { atom } from 'jotai'

import { Currency, Price } from '@uniswap/sdk-core'

export const executionPriceAtom = atom<Price<Currency, Currency> | null>(null)
