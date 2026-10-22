import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

const defaultPriceChartVisibleAtom = atomWithStorage<boolean>(
  'price-chart-visible:v0',
  true,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const swapPriceChartVisibleAtom = atomWithStorage<boolean>(
  'swapPriceChartVisible:v0',
  false,
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
  (get) => get(get(currentPriceChartVisibleAtom)) ?? get(defaultPriceChartVisibleAtom),
  (get, set, update: boolean | ((value: boolean) => boolean)) => {
    const value = typeof update === 'function' ? update(get(priceChartVisibleAtom)) : update
    set(get(currentPriceChartVisibleAtom), value)
  },
)
