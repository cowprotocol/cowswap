import { atom, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

type PriceChartVisibilityUpdate = boolean | ((visible: boolean) => boolean)

const legacyPriceChartVisibleAtom = atomWithStorage<boolean | null>(
  'price-chart-visible:v0',
  null,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

function createPriceChartVisibleAtom(
  key: string,
  defaultVisible: boolean,
  legacyFallback: 'missing' | 'missing-or-null' = 'missing-or-null',
): WritableAtom<boolean, [boolean], void> {
  const storage = getJotaiIsolatedStorage<boolean | null>()
  const savedVisibilityAtom = atomWithStorage<boolean | null>(
    key,
    null,
    {
      ...storage,
      getItem(key: string, initialValue: boolean | null): boolean | null {
        try {
          if (typeof localStorage === 'undefined') return defaultVisible
          if (localStorage.getItem(key) === null) return initialValue

          const value: unknown = storage.getItem(key, defaultVisible)
          if (typeof value === 'boolean') return value
          return value === null && legacyFallback === 'missing-or-null' ? null : defaultVisible
        } catch {
          return defaultVisible
        }
      },
    },
    { getOnInit: true },
  )

  return atom(
    (get) => {
      const visible = get(savedVisibilityAtom)
      if (visible !== null) return visible

      const legacyVisible: unknown = get(legacyPriceChartVisibleAtom)
      return typeof legacyVisible === 'boolean' ? legacyVisible : defaultVisible
    },
    (_get, set, visible: boolean) => {
      set(savedVisibilityAtom, visible)
    },
  )
}

const priceChartVisibleAtoms = {
  [TradeType.SWAP]: createPriceChartVisibleAtom('swapPriceChartVisible:v0', false, 'missing'),
  [TradeType.LIMIT_ORDER]: createPriceChartVisibleAtom('limitPriceChartVisible:v0', true),
  [TradeType.ADVANCED_ORDERS]: createPriceChartVisibleAtom('twapPriceChartVisible:v0', true),
  [TradeType.YIELD]: createPriceChartVisibleAtom('yieldPriceChartVisible:v0', true),
}

const currentPriceChartVisibleAtom = atom(
  (get) => priceChartVisibleAtoms[get(tradeTypeAtom)?.tradeType ?? TradeType.SWAP],
)

export const priceChartVisibleAtom = atom(
  (get) => get(get(currentPriceChartVisibleAtom)),
  (get, set, update: PriceChartVisibilityUpdate) => {
    const visible = typeof update === 'function' ? update(get(priceChartVisibleAtom)) : update
    set(get(currentPriceChartVisibleAtom), visible)
  },
)
