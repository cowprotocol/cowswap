import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

type PriceChartVisibilityPreference = boolean | null | undefined

function createPriceChartVisibilityStorage(
  defaultVisible: boolean,
): ReturnType<typeof getJotaiIsolatedStorage<PriceChartVisibilityPreference>> {
  const storage = getJotaiIsolatedStorage<PriceChartVisibilityPreference>()

  return {
    ...storage,
    getItem(key: string, initialValue: PriceChartVisibilityPreference): PriceChartVisibilityPreference {
      try {
        if (typeof localStorage === 'undefined') return defaultVisible
        if (localStorage.getItem(key) === null) return initialValue

        const value: unknown = storage.getItem(key, defaultVisible)
        return typeof value === 'boolean' || (initialValue === null && value === null) ? value : defaultVisible
      } catch {
        return defaultVisible
      }
    },
  }
}

const defaultPriceChartVisibleAtom = atomWithStorage<boolean | null>(
  'price-chart-visible:v0',
  null,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const swapPriceChartVisibleAtom = atomWithStorage<PriceChartVisibilityPreference>(
  'swapPriceChartVisible:v0',
  undefined,
  createPriceChartVisibilityStorage(false),
  { getOnInit: true },
)

const limitPriceChartVisibleAtom = atomWithStorage<PriceChartVisibilityPreference>(
  'limitPriceChartVisible:v0',
  null,
  createPriceChartVisibilityStorage(true),
  { getOnInit: true },
)

const twapPriceChartVisibleAtom = atomWithStorage<PriceChartVisibilityPreference>(
  'twapPriceChartVisible:v0',
  null,
  createPriceChartVisibilityStorage(true),
  { getOnInit: true },
)

const yieldPriceChartVisibleAtom = atomWithStorage<PriceChartVisibilityPreference>(
  'yieldPriceChartVisible:v0',
  null,
  createPriceChartVisibilityStorage(true),
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
    const isSwap = currentAtom === swapPriceChartVisibleAtom
    const useSharedPreference = isSwap ? visible === undefined : visible === null
    if (!useSharedPreference) return !isSwap

    const defaultVisible: unknown = get(defaultPriceChartVisibleAtom)
    return typeof defaultVisible === 'boolean' ? defaultVisible : !isSwap
  },
  (get, set, update: boolean | ((value: boolean) => boolean)) => {
    const value = typeof update === 'function' ? update(get(priceChartVisibleAtom)) : update
    set(get(currentPriceChartVisibleAtom), value)
  },
)
