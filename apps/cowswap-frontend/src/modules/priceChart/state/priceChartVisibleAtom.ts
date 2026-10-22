import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

const SWAP_PRICE_CHART_VISIBLE_STORAGE_KEY = 'swapPriceChartVisible:v0'

const defaultPriceChartVisibleAtom = atomWithStorage<boolean | null>(
  'price-chart-visible:v0',
  null,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const swapPriceChartVisibleAtom = atomWithStorage<boolean | undefined>(
  SWAP_PRICE_CHART_VISIBLE_STORAGE_KEY,
  undefined,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const limitPriceChartVisibleAtom = atomWithStorage<boolean | null>(
  'limitPriceChartVisible:v0',
  null,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const twapPriceChartVisibleAtom = atomWithStorage<boolean | null>(
  'twapPriceChartVisible:v0',
  null,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const yieldPriceChartVisibleAtom = atomWithStorage<boolean | null>(
  'yieldPriceChartVisible:v0',
  null,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const priceChartVisibleAtoms = {
  [TradeType.SWAP]: swapPriceChartVisibleAtom,
  [TradeType.LIMIT_ORDER]: limitPriceChartVisibleAtom,
  [TradeType.ADVANCED_ORDERS]: twapPriceChartVisibleAtom,
  [TradeType.YIELD]: yieldPriceChartVisibleAtom,
}

const currentPriceChartVisibleAtom = atom(
  (get) => priceChartVisibleAtoms[get(tradeTypeAtom)?.tradeType ?? TradeType.SWAP],
)

export const priceChartVisibleAtom = atom(
  (get) => {
    const currentAtom = get(currentPriceChartVisibleAtom)
    const visible: unknown = get(currentAtom)

    if (typeof visible === 'boolean') return visible
    if (currentAtom === swapPriceChartVisibleAtom) {
      if (visible !== undefined) return false
      try {
        if (
          typeof localStorage === 'undefined' ||
          localStorage.getItem(SWAP_PRICE_CHART_VISIBLE_STORAGE_KEY) !== null
        ) {
          return false
        }
      } catch {
        return false
      }

      const legacyVisible: unknown = get(defaultPriceChartVisibleAtom)
      return typeof legacyVisible === 'boolean' ? legacyVisible : false
    }
    if (visible !== null) return true

    const defaultVisible: unknown = get(defaultPriceChartVisibleAtom)
    return typeof defaultVisible === 'boolean' ? defaultVisible : true
  },
  (get, set, update: boolean | ((value: boolean) => boolean)) => {
    const value = typeof update === 'function' ? update(get(priceChartVisibleAtom)) : update
    set(get(currentPriceChartVisibleAtom), value)
  },
)
