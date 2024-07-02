import { atom } from 'jotai'

import { DEFAULT_PRICE_STRATEGY } from '@cowprotocol/common-const'

export type PriceStrategy = 'COWSWAP' | 'LEGACY'

export const gasPriceStrategyAtom = atom<PriceStrategy>(DEFAULT_PRICE_STRATEGY)
