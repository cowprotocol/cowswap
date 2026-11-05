import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomFamily } from 'jotai-family'

import { assetStockQueryAtomFamily, RWA_MARKET_KINDS, type RwaMarketKind } from '@/entities/asset'

const DEFAULT_MARKET_KIND: RwaMarketKind = 'stock'

const storedMarketKindAtom = atomWithStorage<unknown>('rwaMarketKind:v1', DEFAULT_MARKET_KIND)

/** The market the user picked */
export const marketKindAtom = atom(
  (get): RwaMarketKind => {
    const stored = get(storedMarketKindAtom)

    return RWA_MARKET_KINDS.find((kind) => kind === stored) ?? DEFAULT_MARKET_KIND
  },
  (_get, set, kind: RwaMarketKind) => set(storedMarketKindAtom, kind),
)

/** `false` while unknown, so the stock market is requested in parallel with its chart */
export const isStockUnavailableAtomFamily = atomFamily((ticker: string) =>
  atom((get): boolean => {
    const { data, error } = get(assetStockQueryAtomFamily(ticker))

    return data ? data.market === null : error !== null
  }),
)

/** The picked market, or `tokenized` for an asset without stock market data */
export const shownMarketKindAtomFamily = atomFamily((ticker: string) =>
  atom((get): RwaMarketKind => (get(isStockUnavailableAtomFamily(ticker)) ? 'tokenized' : get(marketKindAtom))),
)
