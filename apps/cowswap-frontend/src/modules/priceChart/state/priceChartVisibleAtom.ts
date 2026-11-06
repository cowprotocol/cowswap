import { atom, SetStateAction, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

const legacyPriceChartVisibleAtom = atomWithStorage<unknown>(
  'price-chart-visible:v0',
  null,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

function createPriceChartVisibleAtom(key: string, defaultVisible: boolean): WritableAtom<boolean, [boolean], void> {
  const savedVisibilityAtom = atomWithStorage<unknown>(key, null, getJotaiIsolatedStorage(), { getOnInit: true })

  return atom(
    (get) => {
      const visible = get(savedVisibilityAtom)
      if (typeof visible === 'boolean') return visible

      const legacyVisible = get(legacyPriceChartVisibleAtom)
      return typeof legacyVisible === 'boolean' ? legacyVisible : defaultVisible
    },
    (_get, set, visible: boolean) => {
      set(savedVisibilityAtom, visible)
    },
  )
}

const priceChartVisibleAtoms: Record<TradeType, WritableAtom<boolean, [boolean], void>> = {
  [TradeType.SWAP]: createPriceChartVisibleAtom('swapPriceChartVisible:v0', false),
  [TradeType.LIMIT_ORDER]: createPriceChartVisibleAtom('limitPriceChartVisible:v0', true),
  [TradeType.ADVANCED_ORDERS]: createPriceChartVisibleAtom('twapPriceChartVisible:v0', true),
  [TradeType.YIELD]: createPriceChartVisibleAtom('yieldPriceChartVisible:v0', true),
}

const currentPriceChartVisibleAtom = atom(
  (get) => priceChartVisibleAtoms[get(tradeTypeAtom)?.tradeType ?? TradeType.SWAP],
)

export const priceChartVisibleAtom = atom(
  (get) => get(get(currentPriceChartVisibleAtom)),
  (get, set, update: SetStateAction<boolean>) => {
    const visible = typeof update === 'function' ? update(get(priceChartVisibleAtom)) : update
    set(get(currentPriceChartVisibleAtom), visible)
  },
)
