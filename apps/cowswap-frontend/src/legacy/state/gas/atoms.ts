import { atom } from 'jotai'

import { DEFAULT_GP_PRICE_STRATEGY } from '../../constants'

export type GpPriceStrategy = 'COWSWAP' | 'LEGACY'

export const gasPriceStrategyAtom = atom<GpPriceStrategy>(DEFAULT_GP_PRICE_STRATEGY)
